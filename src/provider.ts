import type {
  LLMProvider,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
  StreamCallback,
} from '@quilltap/plugin-types';
import { createPluginLogger } from '@quilltap/plugin-utils';

const logger = createPluginLogger('qtap-plugin-mistral-ai');

/** Models known to support vision input. */
const VISION_MODELS = [
  'pixtral',
  'mistral-small',
  'mistral-medium',
  'mistral-large',
];

function modelSupportsVision(model: string): boolean {
  return VISION_MODELS.some((v) => model.includes(v));
}

function isReasoningModel(model: string): boolean {
  return model.includes('magistral');
}

export class MistralProvider implements LLMProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.mistral.ai';
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    const { apiKey, model, maxTokens, temperature, tools } = options;

    logger.debug('Starting chat completion', {
      model,
      messageCount: messages.length,
    });

    const body: Record<string, unknown> = {
      model,
      messages: this.formatMessages(messages, model),
      max_tokens: maxTokens,
      temperature,
    };

    if (tools?.length) {
      body.tools = tools;
    }

    // Reasoning effort for Magistral models
    if (isReasoningModel(model) && (options as any).reasoningEffort) {
      body.reasoning_effort = (options as any).reasoningEffort;
    }

    // Mistral-specific: safe_prompt
    if ((options as any).safePrompt) {
      body.safe_prompt = true;
    }

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Chat completion failed', {
        status: response.status,
        error,
      });
      throw new Error(`Mistral API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content || '',
      toolCalls: choice.message.tool_calls,
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  async streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions,
    onChunk: StreamCallback
  ): Promise<void> {
    const { apiKey, model, maxTokens, temperature, tools } = options;

    const body: Record<string, unknown> = {
      model,
      messages: this.formatMessages(messages, model),
      max_tokens: maxTokens,
      temperature,
      stream: true,
    };

    if (tools?.length) {
      body.tools = tools;
    }

    if (isReasoningModel(model) && (options as any).reasoningEffort) {
      body.reasoning_effort = (options as any).reasoningEffort;
    }

    if ((options as any).safePrompt) {
      body.safe_prompt = true;
    }

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta;
            if (delta?.content) {
              onChunk({ content: delta.content });
            }
            // Forward tool call deltas if present
            if (delta?.tool_calls) {
              onChunk({ toolCalls: delta.tool_calls });
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  }

  private formatMessages(messages: ChatMessage[], model: string): unknown[] {
    return messages.map((msg) => {
      const hasImages = msg.images?.length && modelSupportsVision(model);

      if (hasImages) {
        return {
          role: msg.role,
          name: msg.name,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images!.map((img) => ({
              type: 'image_url',
              image_url: {
                url:
                  img.url || `data:${img.mimeType};base64,${img.base64}`,
              },
            })),
          ],
        };
      }

      return {
        role: msg.role,
        content: msg.content,
        name: msg.name,
      };
    });
  }
}
