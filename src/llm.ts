import { fetchWithRetry, guardResponse } from './fetch'

const BASE_URL = 'https://llm.oomol.com'
const ENDPOINT = `${BASE_URL}/v1/chat/completions`

export async function ask(
  messages: readonly { readonly role: 'system' | 'user', readonly content: string }[],
  options: { readonly model: string, readonly temperature: number, readonly max_tokens: number },
  headers: HeadersInit | undefined
): Promise<string> {
  const response = await fetchWithRetry(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ ...options, messages }),
    headers
  })
  await guardResponse(response)
  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error("Received empty response from LLM")
  }
  return text
}
