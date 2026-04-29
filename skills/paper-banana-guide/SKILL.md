---
name: paper-banana-guide
description: Guide users through the local Paper Banana blocks for academic illustration generation. Use when the user wants to create mechanism diagrams, decide between `generate`, `retrieve`, `plan`, `visualize`, and `edit`, or learn how to chain the current project's built-in blocks.
metadata:
  title: Paper Banana Guide
---

# Paper Banana Guide

## Scope

Use this skill when the task is about producing or refining academic figures with the current local `paper-banana` project.

This skill helps with:
- choosing the right local block for the job
- deciding whether to use the full pipeline or step-by-step blocks
- explaining the expected inputs and outputs of each local block
- suggesting practical block combinations for iterative figure creation

This skill should stay within the capabilities already present in the workspace. It should not invent extra local blocks or claim unsupported editing features.

## Local Blocks In This Project

### `oo::self::generate`

Use this when the user wants the fastest end-to-end path from research text to a finished illustration file.

What it does:
1. passes `content` and optional `caption` into `retrieve`
2. sends the retrieved references into `plan`
3. sends the generated prompt and reference image URLs into `visualize`
4. downloads the final generated image into a local file output

Inputs:
- `content` (required): the research mechanism, process, or result to illustrate
- `caption` (optional): short title or extra context

Output:
- `filePath`: local generated image file

Recommended when:
- the user wants a publication-style figure quickly
- the user does not need to inspect intermediate prompt or reference results first

### `oo::self::retrieve`

Use this when the user wants reference diagrams before generation.

What it does:
- searches a curated diagram collection
- returns matched references with IDs, visual intent, text content, and ground-truth image paths
- previews the references as JSON

Inputs:
- `content` (required)
- `caption` (optional)

Output:
- `references`: array of reference objects

Recommended when:
- the user wants to understand what visual examples the system found
- the user wants stronger style grounding before prompt planning
- the user wants to debug retrieval quality separately

### `oo::self::plan`

Use this when the user already has research content and optionally retrieved references, and wants a detailed image-generation prompt.

What it does:
- converts `content`, optional `caption`, and optional `references` into a structured prompt
- extracts usable reference image URLs from the references
- previews the generated prompt and reference images as markdown

Inputs:
- `content` (required)
- `caption` (optional)
- `references` (optional)

Outputs:
- `prompt`: detailed illustration prompt
- `imageUrls`: reference image URL array

Recommended when:
- the user wants to inspect or revise the prompt before image generation
- the user wants to reuse the prompt outside the full pipeline
- the user wants to run planning with or without retrieval results

### `oo::self::visualize`

Use this when the user already has a prompt and optionally reference images, and wants a newly generated illustration.

What it does:
- generates one image from `prompt`
- can use `imageUrls` as visual guidance
- previews the image directly

Inputs:
- `prompt` (required)
- `imageUrls` (optional)

Output:
- `imageUrl`: generated image URL

Recommended when:
- the user already prepared a prompt manually
- the user wants to regenerate images from a revised prompt
- the user wants to isolate the rendering stage from retrieval and planning

### `oo::self::edit`

Use this when the user already has an image and wants targeted edits instead of regenerating from scratch.

What it does:
- takes an existing `imageUrl`
- applies a text edit instruction in `prompt`
- supports optional `aspectRatio` and `resolution`
- previews the edited image directly

Inputs:
- `imageUrl` (required)
- `prompt` (required)
- `aspectRatio` (optional): one of `21:9`, `16:9`, `3:2`, `4:3`, `5:4`, `1:1`, `4:5`, `3:4`, `2:3`, `9:16`
- `resolution` (optional): `1K`, `2K`, or `4K`

Output:
- `imageUrl`: edited image URL

Recommended when:
- the image is close but needs local fixes
- the user wants to add labels, adjust composition, or refine emphasis
- the user wants to preserve the overall visual structure from an earlier result

## Recommended Usage Patterns

### 1. Fastest path

Use `oo::self::generate`.

Best for:
- first draft generation
- quick validation of whether the research text can already produce a useful figure

### 2. Controlled step-by-step generation

Use:
1. `oo::self::retrieve`
2. `oo::self::plan`
3. `oo::self::visualize`

Best for:
- inspecting retrieved references
- checking whether the generated prompt matches the paper content
- diagnosing where output quality drops

### 3. Iterative polishing

Use:
1. `oo::self::generate` or `oo::self::visualize`
2. `oo::self::edit`

Best for:
- small revisions after the first image is generated
- preserving a good draft while updating details

### 4. Prompt-first workflow

Use:
1. `oo::self::plan`
2. review `prompt`
3. `oo::self::visualize`
4. optional `oo::self::edit`

Best for:
- users who care about prompt quality and want to inspect wording before rendering

## How To Decide Which Block To Use

- If the user says "just make the figure": start with `oo::self::generate`.
- If the user says "show me the references first": start with `oo::self::retrieve`.
- If the user says "let me review the prompt": start with `oo::self::plan`.
- If the user already has a final prompt: use `oo::self::visualize`.
- If the user says "keep this image but modify X": use `oo::self::edit`.

## Response Behavior

When this skill is active:
1. map the user's request onto one of the local blocks or usage patterns above
2. recommend the smallest effective path first
3. mention the exact required inputs the user should prepare
4. if the request is iterative, prefer `edit` over full regeneration when reasonable
5. if output quality is uncertain, recommend the step-by-step route so the user can inspect `references` and `prompt`

## Dependencies

- `oo::self::generate`
- `oo::self::retrieve`
- `oo::self::plan`
- `oo::self::visualize`
- `oo::self::edit`

## Examples

### Example: Generate a mechanism diagram quickly

User intent:
- "Based on this paragraph, make a publishable mechanism figure."

Suggested path:
- use `oo::self::generate`
- provide `content`
- optionally provide `caption`

### Example: Debug weak output quality

User intent:
- "The figure is too generic. I want to see what references and prompt were used."

Suggested path:
1. run `oo::self::retrieve`
2. inspect `references`
3. run `oo::self::plan`
4. inspect `prompt` and `imageUrls`
5. run `oo::self::visualize`

### Example: Edit an existing result

User intent:
- "Keep the current figure, but add clearer labels and make the tumor-macrophage interaction more prominent."

Suggested path:
- use `oo::self::edit`
- pass the existing `imageUrl`
- write a precise editing `prompt`

## Edge Cases

- If the user only gives a rough topic, ask for a more specific mechanism, process, or result description before generation.
- If the user wants maximal control over prompt wording, avoid `generate` first and route to `plan`.
- If the user wants a minor revision to an existing image, prefer `edit` instead of rerunning the full pipeline.
- If retrieval results look off-topic, recommend the manual route so the user can inspect references before visualization.
