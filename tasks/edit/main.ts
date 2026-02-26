//#region generated meta
type Inputs = {
    imageUrl: string;
    prompt: string;
    aspectRatio: "21:9" | "16:9" | "3:2" | "4:3" | "5:4" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16" | null;
    resolution: "1K" | "2K" | "4K" | null;
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
        imageUrls: [params.imageUrl],
        aspectRatio: params.aspectRatio ?? '3:2',
        resolution: params.resolution ?? '1K',
        outputFormat: 'png',
        numImages: 1
    }, headers)
    if (!imageUrl) {
        throw new Error("Failed to generate image")
    }
    context.preview({ type: 'image', data: imageUrl })
    return { imageUrl }
};
