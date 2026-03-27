import type {
  EmbeddingProvider,
  EmbeddingResult,
  EmbeddingOptions,
} from '@quilltap/plugin-types';
import { createPluginLogger } from '@quilltap/plugin-utils';

const logger = createPluginLogger('qtap-plugin-mistral-ai');

export class MistralEmbeddingProvider implements EmbeddingProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.mistral.ai';
  }

  async generateEmbedding(
    text: string,
    model: string,
    apiKey: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult> {
    logger.debug('Generating embedding', { model, textLength: text.length });

    const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [text],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Embedding failed: ${(error as any).error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return {
      embedding,
      model,
      dimensions: embedding.length,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async generateBatchEmbeddings(
    texts: string[],
    model: string,
    apiKey: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult[]> {
    const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`Batch embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => ({
      embedding: item.embedding,
      model,
      dimensions: item.embedding.length,
    }));
  }

  async getAvailableModels(apiKey: string): Promise<string[]> {
    return ['mistral-embed', 'codestral-embed'];
  }
}
