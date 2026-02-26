import template from './retrieve.txt'
import ref from './data/PaperBananaBench/diagram/ref.json'
import { jsonrepair } from 'jsonrepair'
import { ask } from './llm'

// 这几个参数乱调容易爆接口，所以写死
// 选出多少张参考图，考虑 nano banana 接口限制
const N = 1
// 输入多少个备选项，考虑 llm 上下文限制
const M = 20
// 这个模型输入上下文要尽可能大
const MODAL_OPTIONS = {
  model: 'deepseek-chat',
  temperature: 1,
  max_tokens: 4096
}

const systemPrompt = () => template.replaceAll('{{m}}', String(M)).replaceAll('{{n}}', String(N))

function parseResponse(text: string): string[] {
  const json = text.replace("```json", "").replace("```", "").trim()
  let result: string[] = []
  try {
    const data = JSON.parse(jsonrepair(json))
    if (typeof data === 'object' && data !== null) {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && typeof value[0] === 'string') {
          result = value
          break
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse retrieval result: ' + e)
    console.warn('Raw response:', text)
  }
  return result
}

export interface RefItem {
  readonly id: string
	readonly visual_intent: string // description
	readonly content: string // very long
	readonly path_to_gt_image: string
}

let _refIds: readonly string[] | undefined
function refIds() {
  if (!_refIds) {
    _refIds = (ref as readonly RefItem[]).map(e => e.id)
  }
  return _refIds
}

let _refMap: Map<string, RefItem> | undefined
function refMap() {
  if (!_refMap) {
    _refMap = new Map()
    for (const a of ref as readonly RefItem[]) {
      _refMap.set(a.id, a)
    }
  }
  return _refMap
}

function getCandidates(m: number): RefItem[] {
  if (m === 0) return []

  const all = refIds().slice()
  const map = refMap()
  if (M >= all.length) return Array.from(map.values());

  // Shuffle all
  let i = all.length, j: number, temp: string;
  while (i > 0) {
    j = Math.floor(Math.random() * i)
    i--
    temp = all[i]
    all[i] = all[j]
    all[j] = temp
  }

  // Pick first m items
  return all.slice(m).map(id => map.get(id)).filter((x): x is RefItem => !!x)
}

export async function retrieve(caption: string | null, content: string | null, headers: HeadersInit | undefined): Promise<RefItem[]> {
  if (!caption && !content) {
    throw new Error("Either caption or content must be provided")
  }

  const userPrompt: string[] = ['**Target Input**']
  if (caption) userPrompt.push(`- Caption: ${caption}`);
  if (content) userPrompt.push(`- Methodology section: ${content}`);

  const candidates = getCandidates(M)
  if (candidates.length) {
    userPrompt.push('')
    userPrompt.push('**Candidate Pool**')
    for (const [i, ref] of candidates.entries()) {
      userPrompt.push(`Candidate Diagram ${i + 1}:`)
      userPrompt.push(`- Diagram ID: ${ref.id}`)
      userPrompt.push(`- Caption: ${ref.visual_intent}`)
      userPrompt.push(`- Methodology section: ${ref.content.slice(0, 150).replaceAll('\n', ' ')}...`)
      userPrompt.push('')
    }
  }

  userPrompt.push(`Now, based on the Target Input and the Candidate Pool, select the Top ${N} most relevant diagrams according to the instructions provided. Your output should be a strictly valid JSON object containing a single list of the exact ids of the top ${N} selected diagrams.`)

  const prompt = userPrompt.join('\n')
  console.log('Retrieving examples with', prompt.length, 'bytes prompts...')

  const text = await ask([
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: prompt }
  ], MODAL_OPTIONS, headers)

  const ids = parseResponse(text)
  const map = refMap()
  return ids.map(id => map.get(id)).filter((x): x is RefItem => !!x)
}
