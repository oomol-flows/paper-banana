//#region generated meta
type Inputs = {
    content: string;
    caption: string | null;
    references: any[] | null;
};
type Outputs = {
    prompt: string;
    imageUrls: string[];
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import { makeFetchHeaders } from '../../src/token';
import { plan } from '../../src/plan';

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    const headers = await makeFetchHeaders(context)
    const result = await plan(params.caption, params.content, params.references || [], headers)
    context.preview({
        type: 'markdown',
        data: `## Generated Prompt\n\n${result.prompt}\n\n## Reference Images\n\n` + result.imageUrls.map(url => `![](${url})\n\n`).join('')
    })
    return { prompt: result.prompt, imageUrls: result.imageUrls }
};
