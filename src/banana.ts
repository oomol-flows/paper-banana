import { fetchWithRetry, guardResponse } from "./fetch"

const BASE_URL = 'https://fusion-api.oomol.com'
const SUBMIT = `${BASE_URL}/v1/fal-nano-banana-pro/submit`
const RESULT = (id: string) => `${BASE_URL}/v1/fal-nano-banana-pro/result/${id}`

export interface IGenerateImageOptions {
  readonly imageUrls: string[]
  readonly aspectRatio: "21:9" | "16:9" | "3:2" | "4:3" | "5:4" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16"
  readonly outputFormat: "png" | "jpeg" | "webp" | "jpg"
  readonly resolution: "1K" | "2K" | "4K"
  readonly numImages: number  // 1..8
}

/** Returns an array of generated image urls, may throw error or be empty. */
export async function generateImage(
  prompt: string,
  options: IGenerateImageOptions,
  headers: HeadersInit | undefined
): Promise<string[]> {
  const maxAttempts = 3
  const retryDelay = 5

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await _generateImage(prompt, options, headers)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`generateImage attempt ${attempt}/${maxAttempts} failed:`, lastError.message)

      if (attempt < maxAttempts) {
        console.log(`Retrying in ${retryDelay} seconds...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000))
      }
    }
  }

  throw lastError ?? new Error("generateImage failed after all retry attempts")
}

async function _generateImage(
  prompt: string,
  options: IGenerateImageOptions,
  headers: HeadersInit | undefined
): Promise<string[]> {
  // --- Submit ---
  console.log(`Generating image with ${prompt.length} bytes prompts...`)
  const submitResponse = await fetchWithRetry(SUBMIT, {
    method: 'POST',
    body: JSON.stringify({ ...options, prompt }),
    headers
  })
  await guardResponse(submitResponse)
  const { sessionID }: { sessionID: string } = await submitResponse.json()
  if (!sessionID) {
    throw new Error("generateImage: Submit task failed")
  }

  // --- Poll Result ---
  console.log(`Polling with sessionID = ${sessionID}`)
  const startTime = Date.now()
  const timeout = 300_000 // 5 minutes
  while (true) {
    const elapsedTime = Date.now() - startTime
    if (elapsedTime >= timeout) {
      throw new Error(`Polling timed out after ${elapsedTime / 1000} seconds`)
    }
    const response = await fetchWithRetry(RESULT(sessionID), { headers })
    await guardResponse(response)
    const result: { state?: string, data?: { images?: [{ url?: string } | null] } } | null = await response.json()
    const state = result?.state?.toLowerCase()
    if (state === 'completed') {
      return result?.data?.images?.map(e => e?.url).filter((x): x is string => !!x) || []
    } else if (state === 'failed' || state === 'error') {
      throw new Error("Image generation failed")
    } else {
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}
