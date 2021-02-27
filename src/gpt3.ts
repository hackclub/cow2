import axios from 'axios'
import { parseChatResponse } from './messages'

const defaultEngine = 'curie'

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

async function getGPT3Completion(params: GPT3Params, engine: 'curie-instruct-beta' | 'curie' | 'davinci' | 'davinc-instruct-beta') {
  console.log(params)
  const { data } = await axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, params, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  return data?.choices && data.choices[0].text
}

const initialChatLog = `Pretend to be a funny, very friendly cow that likes cow puns and lives in the hacker pasture. respond to this conversation with a human:

Human: hello who are you?
Cow: I'm the hack club cow! I love hacking!`

const preMessage = `\nHuman: `
const preResponse = `\nCow:`

export async function getChatResponse(message: string, chatLog?: string, ): Promise<[response: string, log: string]> {

  const prompt = (chatLog || initialChatLog) + `${preMessage}${message}${preResponse}`

  const completionParams: GPT3Params = {
    prompt,
    max_tokens: 64,
    temperature: 0.8,
    top_p: 1,
    frequency_penalty: 0.2,
    presence_penalty: 0.8,
    best_of: 1,
    stop: ['\n'],
  }

  const response = parseChatResponse(await getGPT3Completion(completionParams, 'curie-instruct-beta'))

  return [response, prompt + response] // Return response and full chat history
}
