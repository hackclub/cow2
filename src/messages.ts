import ProfanityFilter from 'bad-words' 
import getGenericResponse from './genericMessages'

const filter = new ProfanityFilter()

export function parseUserMessage(msg: string): string {
  // Filter out mentions
  return msg.replace(/<\@.+>/g, '').trim()
}

export function parseChatResponse(msg: string): string {
  const fallback = getGenericResponse('fallbackResponse')
  try {
    return filter.clean(msg.replace(/<\@.+>/g, '').trim()) || fallback
  } catch (err) {
    console.error(err)
    return fallback
  }
}

export function isUserMessageOffTopic(msg: string): boolean {
  // if (filter.isProfane(msg)) return true
  return false
}
