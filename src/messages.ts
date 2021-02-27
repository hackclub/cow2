
export function parseUserMessage(msg: string): string {
  // Filter out mentions
  return msg.replace(/<\@.+>/g, '').trim()
}

export function parseChatResponse(msg: string): string {
  return msg.trim()
}
