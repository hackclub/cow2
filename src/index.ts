if (process.env.NODE_ENV !== 'production') require('dotenv').config()
import { App, GenericMessageEvent, ReactionMessageItem } from '@slack/bolt'
import mongoose from 'mongoose'
import { getChatResponse } from './gpt3'
import { parseUserMessage, isUserMessageOffTopic } from './messages'
import Thread, { IThread } from './models/Thread'
import Cow from './models/Cow'
import Channel from './models/Channel'
// import User from './models/User'
import getGenericResponse, { pyramid as cowPyramid } from './genericMessages'
import * as cron from 'node-cron'
import { blockCowCommand, allowCowCommand, cowInfoCommand } from './commands'
import getResponse from './genericMessages'

const maxDailyWords = process.env.MAX_DAILY_WORDS || 0
const maxWeeklyWordsPerUser = process.env.MAX_WORDS_USER_WEEKLY || 0
const maxChatWords = process.env.MAX_CHAT_LENGTH || 0

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

let currentChannel // We don't want to check the DB every time we get a new threaded message
let selfId // ID of bot

bot.command('/allow-cow', allowCowCommand)
bot.command('/leave-cow', blockCowCommand)
bot.command('/cow', cowInfoCommand)

// Summon cow to any channel
async function summonCow(channelId: string, client): Promise<boolean> {
  const channel = await Channel.findOne({ channelId })
  if (!channel || !channel.cowAllowed) return false // Cow not allowed

  const cow = await Cow.findOne()

  if (cow.currentChannel === channelId) return true // Same channel

  const lastThread = await Thread.findOne({
    channel: cow.currentChannel
  }).sort({ startedAt: 'desc' })

  const lastThreadWasRecent = lastThread && (new Date().getTime() - lastThread.startedAt.getTime()) < (1000 * 150)

  if (cow.currentChannel === process.env.COW_HOME_CHANNEL || lastThreadWasRecent) client.chat.postMessage({
    channel: cow.currentChannel,
    text: cow.currentChannel === process.env.COW_HOME_CHANNEL ? getGenericResponse('summonedAwayFromHome') + ` <#${channelId}>` : getGenericResponse('summonedAway') + ` <#${channelId}>. MOOOO! :wave:`
  })

  cow.currentChannel = channelId

  await cow.save()

  currentChannel = channelId

  client.chat.postMessage({
    channel: channelId,
    text: getGenericResponse('summoned')
  })

  return true
}

async function cowRespond(thread: IThread, client, userMsg: string, userId: string) {
  try {
    console.log(`Responding to message "${userMsg}" from ${userId} in ${thread.channel}-${thread.thread_ts}`)

    const msg = parseUserMessage(userMsg)
    if (!msg) return

    if (msg.length > 350) return // message too long

    if (thread.chatLog?.split(/ |\n/).length >= maxChatWords) return // This thread is becoming too large

    // Make sure the user sent an appropriate question (required by OpenAI)
    if (isUserMessageOffTopic(msg)) {
      await client.chat.postMessage({
        channel: thread.channel,
        thread_ts: thread.thread_ts,
        text: getGenericResponse('offTopicMessage')
      })
      return
    }

    const cow = await Cow.findOne()
    if (cow.wordsToday >= maxDailyWords) {
      await client.chat.postMessage({
        channel: thread.channel,
        thread_ts: thread.thread_ts,
        text: getGenericResponse('noMoreResponsesDay')
      })
      return
    }

    // const user = await User.findOneAndUpdate({
    //   slackId: userId
    // }, {
    //   slackId: userId,
    // }, { upsert: true, new: true })

    const [cowResponse, chatLog] = await getChatResponse(msg, thread.chatLog || null)

    Cow.incrementWordCount(chatLog.split(/ |\n/).length)

    await client.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      text: cowResponse
    })

    // TODO Fix race condition with saving chat log
    thread.chatLog = chatLog
    if (!thread.participants) thread.participants = []
    if (!thread.participants.includes(userId)) thread.participants.push(userId)
    thread.save()
  } catch (err) {
    console.error('Error generating cow response', err)
  }
}

bot.event('app_mention', async ({ event, client }) => {
  // Start a new thread

  if (event.thread_ts || !await summonCow(event.channel, client)) return // Cow not summoned or this is a thread

  // Temporary fix to prevent long chains of messages with the goat bot
  if (event.text.indexOf('<@U01U06UT4CD>') >= 0) {
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: getResponse('goatRefusal')
    })
    return
  }

  const thread = new Thread({
    channel: event.channel,
    thread_ts: event.ts,
    startedAt: new Date()
  })

  await cowRespond(thread, client, event.text, event.user)
})

// TODO fix typings
bot.message(async ({ message, client }) => {
  message = message as GenericMessageEvent // why do I have to do this, this is stupid

  // Ignore unthreaded messages
  if (!message.thread_ts || message.ts <= message.thread_ts) return

  if (!currentChannel) {
    currentChannel = (await Cow.findOne({})).currentChannel
  }
  // Ignore threads from channels the cow is no longer a participant in.
  if (message.channel !== currentChannel) return

  // Ignore threads from more than 120 minutes ago
  if ((Number(message.thread_ts) * 10**3) < (new Date().getTime() - (1000 * 60 * 120))) return

  const thread = await Thread.findOne({
    channel: message.channel,
    thread_ts: message.thread_ts
  }).catch()

  if (!thread) return // Not a cow thread

  cowRespond(thread, client, message.text, message.user)
})

function isMsgReaction(item): item is ReactionMessageItem {
  return !!item.channel
}

// Removal voting
bot.event('reaction_added', async ({ event, client }) => {
  // Start a new thread

  // Ignore reactions that aren't messages or aren't the x emoji
  if (!isMsgReaction(event.item) || event.reaction !== 'x') return

  if (!selfId) selfId = (await client.auth.test()).user_id
  // Was this message sent by the cow
  if (event.item_user !== selfId) return

  const totalVotes = (await client.reactions.get({
    channel: event.item.channel,
    timestamp: event.item.ts
  }) as any).message.reactions.filter(r => r.name === 'x')[0].count

  // Delete the message if we have two votes (or I voted; yes, my vote counts as one million votes)
  if (totalVotes >= 2 || event.user === 'U0128N09Q8Y') await client.chat.delete({
    channel: event.item.channel,
    ts: event.item.ts
  })
})

async function cowAllowed(channelId): Promise<boolean> {
  const channel = await Channel.findOne({ channelId })
  if (channel && channel.cowAllowed) return true
}

bot.message(/(^| )moo+$/, async ({ say, message }) => {
  if (!await cowAllowed(message.channel) || (message as GenericMessageEvent).thread_ts) return
  say(getGenericResponse('mooResponse'))
})

bot.message(/(^| )cow pyramid$/, async ({ say, message }) => {
  if (!await cowAllowed(message.channel) || (message as GenericMessageEvent).thread_ts) return
  await say(cowPyramid)
  say(getGenericResponse('pyramidText'))
})

// bot.message(/^cow introduce yourself$/, async ({ say }) => {
//   await say(":wave: Hello everyone! I'm the Hack Club Cow 2.0. It's nice to meet you!")
// })

async function dailyReset() {
  // Send cow home and reset daily count
  const cow = await Cow.findOne()

  currentChannel = process.env.COW_HOME_CHANNEL
  cow.currentChannel = currentChannel
  cow.wordsToday = 0

  await cow.save()
}

cron.schedule('0 0 * * *', dailyReset)

async function start() {
  mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

  // Create or update the cow doc
  await Cow.ensureCreated()

  await bot.start(parseInt(process.env.PORT) || 5000)
  console.log('⚡️ Bot started')
}

start()
