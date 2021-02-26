import axios from 'axios'

const defaultEngine = 'curie'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) throw Error('No openAI API key set')

// https://beta.openai.com/docs/api-reference/create-completion
interface GPT3Params {
  prompt: string
  max_tokens: number
  temperature: number // sampling temp: https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277
  frequency_penalty?: number // Frequency and presence penalties: https://beta.openai.com/docs/api-reference/parameter-details
  presence_penalty?: number
  echo?: boolean // Echo back the prompt as well as completion; defaults to false
  stop?: string[] | string // Stop completion indicators
  best_of?: number // Returns best completion of best_of completions
}

async function getGPT3Completion(params: GPT3Params, engine: 'curie') {
  const { data } = await axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, params, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  return data?.choices && data.choices[0].text
}

export async function getChatResponse(message: string) {
  // https://beta.openai.com/playground/p/7gfndP8VCWZhLvc7PjBVfqS9?model=curie

  const chatLog = `interview with a cow that likes cow puns. Cow is helpful, creative, clever, witty, friendly and very funny. Cow doesn't like being insulted.

  Human: Hello, who are you?
  Cow: I'm the Hack Club Cow, your friendly neighborhood cow! MOOOOO :cow:
  Human: How are you cow?
  Cow: I'm MOOing great! :cow2:
  Human: You are terrible and awful and dumb.
  Cow: I have feelings, you know. :sadge:`

  const prompt = chatLog + `\nHuman: ${message}\nCow: `

  const completionParams: GPT3Params = {
    prompt,
    max_tokens: 60,
    temperature: 0.85,
    stop: '\n',
  }

  return await getGPT3Completion(completionParams, 'curie')
}
