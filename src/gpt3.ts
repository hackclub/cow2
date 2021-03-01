import axios from 'axios'
import { parseChatResponse } from './messages'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) throw Error('No openAI API key set')

// https://beta.openai.com/docs/api-reference/create-completion
interface GPT3Params {
  prompt: string
  max_tokens: number
  temperature: number // sampling temp: https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277
  top_p?: number
  frequency_penalty?: number // Frequency and presence penalties: https://beta.openai.com/docs/api-reference/parameter-details
  presence_penalty?: number
  echo?: boolean // Echo back the prompt as well as completion; defaults to false
  stop?: string[] | string // Stop completion indicators
  best_of?: number // Returns best completion of best_of completions
}

async function getGPT3Completion(params: GPT3Params, engine: ('curie-instruct-beta' | 'curie' | 'davinci' | 'davinci-instruct-beta') = 'curie') {
  // console.log(params)
  const { data } = await axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, params, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  return data?.choices && data.choices[0].text
}

const initialChatLog = `Cow is a funny, friendly cow that likes cow puns and lives in the hacker pasture

You: Hello! Who are you?
Cow: I'm the Hack Club Cow, your friendly neighborhood cow! MOOOOO :cow: :cow2:
You: I don't like you 
Cow: Cows have feelings too :sad-rat:`

const preMessage = `\nYou: `
const preResponse = `\nCow:`

export async function getChatResponse(message: string, chatLog?: string, ): Promise<[response: string, log: string]> {

  const prompt = (chatLog || initialChatLog) + `${preMessage}${message}${preResponse}`

  const completionParams: GPT3Params = {
    prompt,
    max_tokens: 64,
    temperature: 0.6,
    top_p: 1,
    frequency_penalty: 0.2,
    presence_penalty: 0.8,
    best_of: 2,
    stop: ['\n'],
  }

  const response = parseChatResponse(await getGPT3Completion(completionParams, 'curie-instruct-beta'))

  return [response, prompt + ' ' + response] // Return response and full chat history
}
