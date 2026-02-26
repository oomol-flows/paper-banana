//#region generated meta
type Inputs = {
    prompt: string;
    imageUrls: string[] | null;
};
type Outputs = {
    imageUrl: string;
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import { makeFetchHeaders } from '../../src/token';
import { generateImage } from '../../src/banana';

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    const headers = await makeFetchHeaders(context)
    const [imageUrl] = await generateImage(params.prompt, {
        imageUrls: params.imageUrls || [],
        aspectRatio: '3:2',
        resolution: '1K',
        outputFormat: 'png',
        numImages: 1
    }, headers)
    if (!imageUrl) {
        throw new Error("Failed to generate image")
    }
    context.preview({ type: 'image', data: imageUrl })
    return { imageUrl }
};
