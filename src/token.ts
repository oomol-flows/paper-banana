export interface IFetchContext {
  getOomolToken: () => Promise<string>
}

export async function makeFetchHeaders(ctx: IFetchContext): Promise<HeadersInit> {
  const token = await ctx.getOomolToken()

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}
