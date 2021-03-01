require('dotenv').config()
import { App, GenericMessageEvent } from '@slack/bolt'
import * as mongoose from 'mongoose'
import { getChatResponse } from './gpt3'
import { parseUserMessage } from './messages'
import Thread, { IThread } from './models/Thread'
import Cow from './models/Cow'
import Channel from './models/Channel'
import getGenericResponse from './genericMessages'
import cron from 'node-cron'
import { blockCowCommand, allowCowCommand, cowInfoCommand } from './commands'

const maxDailyWords = process.env.MAX_DAILY_WORDS || 0
const maxWeeklyWordsPerUser = process.env.MAX_WORDS_USER_WEEKLY || 0
const maxChatWords = process.env.MAX_CHAT_LENGTH || 0

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

let currentChannel // We don't want to check the DB every time we get a new threaded message

bot.command('/allow-cow', allowCowCommand)
bot.command('/leave-cow', blockCowCommand)
bot.command('/cow', cowInfoCommand)

// Summon cow to any channel
async function summonCow(channelId: string, client): Promise<boolean> {
  const channel = await Channel.findOne({ channelId })
  if (!channel || !channel.cowAllowed) return false // Cow not allowed

  const cow = await Cow.findOne()

  if (cow.currentChannel === channelId) return true // Same channel

  if (cow.currentChannel) client.chat.postMessage({
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

async function cowRespond(thread: IThread, client, userMsg: string) {
  try {
    const msg = parseUserMessage(userMsg)
    if (!msg) return

    if (msg.length > 300) return // message too long

    console.log(thread.chatLog?.split(/ |\n/).length)

    if (thread.chatLog?.split(/ |\n/).length >= maxChatWords) return // This thread is becoming too large

    const cow = await Cow.findOne()
    if (cow.wordsToday >= maxDailyWords) {
      await client.chat.postMessage({
        channel: thread.channel,
        thread_ts: thread.thread_ts,
        text: getGenericResponse('noMoreResponsesDay')
      })
      return
    }

    const [cowResponse, chatLog] = await getChatResponse(msg, thread.chatLog || null)

    Cow.incrementWordCount(chatLog.split(/ |\n/).length)

    await client.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      text: cowResponse
    })

    thread.chatLog = chatLog
    thread.save()
  } catch (err) {
    console.error('Error generating cow response', err)
  }
}

bot.event('app_mention', async ({ event, client }) => {
  // Start a new thread

  if (!await summonCow(event.channel, client)) return // Cow not summoned

  const thread = new Thread({
    channel: event.channel,
    thread_ts: event.ts,
    startedAt: new Date()
  })

  await cowRespond(thread, client, event.text)
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

  const thread = await Thread.findOne({
    channel: message.channel,
    thread_ts: message.thread_ts
  }).catch()

  if (!thread) return // Not a cow thread

  cowRespond(thread, client, message.text)
})

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
  Cow.updateOne({}, {}, { upsert: true })

  await bot.start(parseInt(process.env.PORT) || 5000)
  console.log('⚡️ Bot started')
}

start()
