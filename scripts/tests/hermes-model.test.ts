import { describe, expect, it, vi } from 'vitest';
import { hermesModel } from '../../libraries/nestjs-libraries/src/database/prisma/ai-settings/hermes.model';
import type { HermesBridge } from '../../libraries/nestjs-libraries/src/database/prisma/ai-settings/hermes.bridge';

const prompt = [
  {
    role: 'user' as const,
    content: [{ type: 'text' as const, text: 'List channels' }],
  },
];
const completion = (tool = false) => ({
  id: 'reply-1',
  object: 'chat.completion',
  created: 1700000000,
  model: 'chosen-model',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: tool ? null : 'OK',
        ...(tool
          ? {
              tool_calls: [
                {
                  id: 'call-1',
                  type: 'function',
                  function: { name: 'listChannels', arguments: '{}' },
                },
              ],
            }
          : {}),
      },
      finish_reason: tool ? 'tool_calls' : 'stop',
    },
  ],
  usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
});
const setup = (tool = false) => {
  const request = vi.fn().mockResolvedValue(completion(tool));
  return {
    request,
    model: hermesModel(
      { request } as unknown as HermesBridge,
      'openai-codex',
      'chosen-model',
      'high'
    ),
  };
};

describe('Hermes language model bridge', () => {
  it('uses the selected account and effort without an HTTP request', async () => {
    const { request, model } = setup();
    const result = await model.doGenerate({ prompt });
    expect(result.content).toContainEqual({ type: 'text', text: 'OK' });
    expect(request.mock.calls[0][0]).toBe('infer');
    expect(request.mock.calls[0][1]).toMatchObject({
      provider: 'openai-codex',
      model: 'chosen-model',
      effort: 'high',
    });
  });
  it('preserves tool calls for the existing Mastra tool loop', async () => {
    const { model } = setup(true);
    const result = await model.doGenerate({ prompt });
    expect(result.content).toContainEqual({
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName: 'listChannels',
      input: '{}',
    });
    expect(result.finishReason).toBe('tool-calls');
  });
  it('delivers tool calls and usage through the streaming interface', async () => {
    const { model } = setup(true);
    const { stream } = await model.doStream({ prompt });
    const parts = [];
    const reader = stream.getReader();
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      parts.push(next.value);
    }
    expect(
      parts.some(
        (part) => part.type === 'tool-call' && part.toolName === 'listChannels'
      )
    ).toBe(true);
    expect(parts.find((part) => part.type === 'finish')).toMatchObject({
      finishReason: 'tool-calls',
      usage: { inputTokens: 3, outputTokens: 2 },
    });
  });
  it('forwards cancellation and surfaces provider errors', async () => {
    const { request, model } = setup();
    request.mockRejectedValue(new Error('Account needs reconnecting'));
    const controller = new AbortController();
    await expect(
      model.doGenerate({ prompt, abortSignal: controller.signal })
    ).rejects.toThrow('Account needs reconnecting');
    expect(request.mock.calls[0][2]).toBe(controller.signal);
  });
});
