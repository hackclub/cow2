require('dotenv').config()
import { App, GenericMessageEvent } from '@slack/bolt'
import * as mongoose from 'mongoose'
import { getChatResponse } from './gpt3'
import { parseUserMessage } from './messages'
import Thread from './models/Thread'
import Cow from './models/Cow'

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

let currentChannel

async function cowRespond(thread, client, userMsg) {
  try {
    const msg = parseUserMessage(userMsg)
    if (!msg) return

    const [cowResponse, chatLog] = await getChatResponse(msg, thread.chatLog || null)

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

  const thread = new Thread({
    channel: event.channel,
    thread_ts: event.ts,
    startedAt: new Date()
  })

  await cowRespond(thread, client, event.text)

  currentChannel = event.channel
  await Cow.findOneAndUpdate({}, {
    currentChannel
  }, { upsert: true })
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

async function start() {
  mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

  await bot.start(parseInt(process.env.PORT) || 5000)
  console.log('⚡️ Bot started')
}

start()
