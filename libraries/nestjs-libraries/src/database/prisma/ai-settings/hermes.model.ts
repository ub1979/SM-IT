import { createOpenAI } from '@ai-sdk/openai';
import { HermesBridge } from './hermes.bridge';

// Reuse the existing SDK's message/tool serialization and response parsing.
// This fetch never contacts an HTTP endpoint: Hermes owns the real transport,
// including subscription refresh, native APIs and external CLI accounts.
export function hermesModel(
  bridge: HermesBridge,
  provider: string,
  model: string,
  effort: string
): ReturnType<ReturnType<typeof createOpenAI>['chat']> {
  return createOpenAI({
    apiKey: 'local-hermes-bridge',
    baseURL: 'http://hermes.internal/v1',
    fetch: async (_url, init) => {
      const request = JSON.parse(String(init?.body || '{}'));
      const result = await bridge.request(
        'infer',
        { provider, model, effort, request },
        init?.signal || undefined
      );
      if (!request.stream) return Response.json(result);
      const choices = result.choices.map((choice: any, index: number) => ({
        index: choice.index ?? index,
        delta: {
          ...choice.message,
          tool_calls: choice.message.tool_calls?.map(
            (call: any, toolIndex: number) => ({ index: toolIndex, ...call })
          ),
        },
        finish_reason: choice.finish_reason,
      }));
      const chunk = { ...result, object: 'chat.completion.chunk', choices };
      return new Response(
        `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`,
        {
          headers: { 'Content-Type': 'text/event-stream' },
        }
      );
    },
  }).chat(model);
}
