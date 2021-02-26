
export function parseUserMessage(msg: string): string {
  // Filter out mentions
  return msg.replace(/<\@.+>/g, '')
}
