require('dotenv').config()
import { App } from '@slack/bolt'
import { getChatResponse } from './gpt3'
import { parseUserMessage } from './messages'

const bot = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

// TODO regex listener

bot.event('app_mention', async ({ event, client }) => {
  console.log(event)
  await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.event_ts,
    text: await getChatResponse(parseUserMessage(event.text))
  })
})

async function start() {
  await bot.start(parseInt(process.env.PORT) || 5000)
  console.log('⚡️ Bot started')
}

start()