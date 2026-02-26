//#region generated meta
type Inputs = {
    content: string;
    caption: string | null;
};
type Outputs = {
    references: { id: string; visual_intent: string; content: string; path_to_gt_image: string }[];
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import { makeFetchHeaders } from '../../src/token';
import { retrieve } from '../../src/retrieve';

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    const headers = await makeFetchHeaders(context)
    const references = await retrieve(params.caption, params.content, headers)
    context.preview({ type: 'json', data: references })
    return { references }
};
