import ProfanityFilter from 'bad-words' 

const filter = new ProfanityFilter()

export function parseUserMessage(msg: string): string {
  // Filter out mentions
  return msg.replace(/<\@.+>/g, '').trim()
}

export function parseChatResponse(msg: string): string {
  return filter.clean(msg.trim())
}

export function isUserMessageOffTopic(msg: string): boolean {
  if (filter.isProfane(msg)) return true
}
