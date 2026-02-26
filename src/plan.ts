import type { RefItem } from './retrieve'
import style_guide from './neurips2025_diagram_style_guide.txt'
import { ask } from './llm'

const CDN_BASE = 'https://static.oomol.com/PaperBananaBench'
const getImageUrl = (path: string): string => `${CDN_BASE}/diagram/${encodeURI(path)}`

const MODEL_OPTIONS = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 512
}

const systemPrompt = 'You are an expert at crafting prompts for scientific diagram image generation. Based on the provided target input, examples, and style guide, create a concise, effective prompt (under 200 words) that captures the essence for generating the desired scientific diagram. Focus on visual elements, layout, and key features described in the methodology. Do not include instructions about titles or output format.'

export interface PlanResponse {
  prompt: string
  imageUrls: string[]
}

export async function plan(caption: string | null, content: string | null, references: readonly RefItem[], headers: HeadersInit | undefined): Promise<PlanResponse> {
  const userPrompt: string[] = ['You are an expert scientific diagram illustrator. Generate high-quality scientific diagrams based on user requests.']
  userPrompt.push('')
  userPrompt.push(`I am working on a task: given the 'Methodology' section of a paper, and the caption of the desired figure, automatically generate a corresponding illustrative diagram. I will input the text of the 'Methodology' section, the figure caption, and your output should be an illustrative figure that effectively represents the methods described in the text.`)
  userPrompt.push('')
  userPrompt.push(`To help you understand the task better, and grasp the principles for generating such figures, I will also provide you with several examples. You should learn from these examples to provide your figure illustration.`)
  userPrompt.push('')
  userPrompt.push('**Target Input**')
  if (caption) userPrompt.push(`- Caption: ${caption}`);
  if (content) userPrompt.push(`- Methodology section: ${content}`);

  const imageUrls: string[] = []
  if (references.length > 0) {
    userPrompt.push('')
    userPrompt.push('**Examples**')
    for (const ref of references) {
      userPrompt.push(`Example ${ref.id}:`)
      userPrompt.push(`- Caption: ${ref.visual_intent}`);
      userPrompt.push(`- Methodology section: ${ref.content}`);
      imageUrls.push(getImageUrl(ref.path_to_gt_image))
    }
  }
  userPrompt.push('')
  userPrompt.push(`Now, render an image based on the target caption and methodology section.`);
  userPrompt.push(`Note that do not include figure titles in the image.`)
  userPrompt.push('')
  userPrompt.push('Here is the style guide:')
  userPrompt.push('')
  userPrompt.push(style_guide)

  const prompt = userPrompt.join('\n')
  console.log('Generating concise prompt with', prompt.length, 'bytes input...')

  const text = await ask([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ], MODEL_OPTIONS, headers)

  return { prompt: text, imageUrls }
}
