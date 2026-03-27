import type { LLMProviderPlugin } from '@quilltap/plugin-types';
import { MistralProvider } from './provider';
import { MistralEmbeddingProvider } from './embedding-provider';

export const plugin: LLMProviderPlugin = {
  metadata: {
    providerName: 'MISTRAL',
    displayName: 'Mistral AI',
    description:
      'Chat completions, reasoning models, vision, and embeddings via Mistral AI',
    abbreviation: 'MIS',
    colors: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      icon: 'text-orange-600',
    },
  },

  config: {
    requiresApiKey: true,
    requiresBaseUrl: false,
    apiKeyLabel: 'Mistral AI API Key',
  },

  capabilities: {
    chat: true,
    imageGeneration: false,
    embeddings: true,
    webSearch: false,
  },

  attachmentSupport: {
    supportsAttachments: true,
    supportedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    description: 'Images (JPEG, PNG, GIF, WebP)',
    maxBase64Size: 20 * 1024 * 1024,
  },

  createProvider: (baseUrl?: string) => {
    return new MistralProvider(baseUrl);
  },

  createEmbeddingProvider: (baseUrl?: string) => {
    return new MistralEmbeddingProvider(baseUrl);
  },

  getAvailableModels: async (apiKey: string, baseUrl?: string) => {
    try {
      const url = baseUrl || 'https://api.mistral.ai';
      const response = await fetch(`${url}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data
        .filter((m: any) => m.capabilities?.completion_chat)
        .map((m: any) => m.id);
    } catch {
      return [];
    }
  },

  validateApiKey: async (apiKey: string, baseUrl?: string) => {
    try {
      const url = baseUrl || 'https://api.mistral.ai';
      const response = await fetch(`${url}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  getModelInfo: () => [
    // Flagship
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large 3',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsImages: true,
      supportsTools: true,
      pricing: { input: 2.0, output: 6.0 },
    },
    // Medium
    {
      id: 'mistral-medium-latest',
      name: 'Mistral Medium 3.1',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsImages: true,
      supportsTools: true,
      pricing: { input: 0.4, output: 2.0 },
    },
    // Small — hybrid instruct/reasoning/coding
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small 4',
      contextWindow: 256000,
      maxOutputTokens: 8192,
      supportsImages: true,
      supportsTools: true,
      pricing: { input: 0.1, output: 0.3 },
    },
    // Reasoning
    {
      id: 'magistral-medium-latest',
      name: 'Magistral Medium',
      contextWindow: 40000,
      maxOutputTokens: 16384,
      supportsImages: false,
      supportsTools: false,
      pricing: { input: 2.0, output: 5.0 },
    },
    {
      id: 'magistral-small-latest',
      name: 'Magistral Small',
      contextWindow: 40000,
      maxOutputTokens: 16384,
      supportsImages: false,
      supportsTools: false,
      pricing: { input: 0.5, output: 1.5 },
    },
    // Code
    {
      id: 'codestral-latest',
      name: 'Codestral',
      contextWindow: 256000,
      maxOutputTokens: 8192,
      supportsImages: false,
      supportsTools: true,
      pricing: { input: 0.3, output: 0.9 },
    },
    {
      id: 'devstral-latest',
      name: 'Devstral 2',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsImages: false,
      supportsTools: true,
      pricing: { input: 0.2, output: 0.6 },
    },
    // Edge / small models
    {
      id: 'ministral-3b-latest',
      name: 'Ministral 3B',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsImages: false,
      supportsTools: true,
      pricing: { input: 0.04, output: 0.04 },
    },
    {
      id: 'ministral-8b-latest',
      name: 'Ministral 8B',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsImages: false,
      supportsTools: true,
      pricing: { input: 0.1, output: 0.1 },
    },
    // Vision-first
    {
      id: 'pixtral-12b-2409',
      name: 'Pixtral 12B',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsImages: true,
      supportsTools: true,
      pricing: { input: 0.15, output: 0.15 },
    },
  ],

  getEmbeddingModels: () => [
    {
      id: 'mistral-embed',
      name: 'Mistral Embed',
      dimensions: 1024,
      description: 'General-purpose embedding model',
    },
    {
      id: 'codestral-embed',
      name: 'Codestral Embed',
      dimensions: 1024,
      description: 'Code-optimized embedding model',
    },
  ],

  icon: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M2 2h4v4H2zM18 2h4v4h-4z', fill: 'currentColor' },
      { d: 'M2 6h4v4H2zM10 6h4v4h-4zM18 6h4v4h-4z', fill: 'currentColor' },
      {
        d: 'M2 10h4v4H2zM6 10h4v4H6zM10 10h4v4h-4zM14 10h4v4h-4zM18 10h4v4h-4z',
        fill: 'currentColor',
      },
      {
        d: 'M2 14h4v4H2zM10 14h4v4h-4zM18 14h4v4h-4z',
        fill: 'currentColor',
      },
      { d: 'M2 18h4v4H2zM18 18h4v4h-4z', fill: 'currentColor' },
    ],
  },

  toolFormat: 'openai',
  charsPerToken: 4,

  cheapModels: {
    defaultModel: 'ministral-8b-latest',
    recommendedModels: [
      'ministral-3b-latest',
      'ministral-8b-latest',
      'mistral-small-latest',
    ],
  },

  defaultContextWindow: 128000,

  messageFormat: {
    supportsNameField: true,
    supportedRoles: ['user', 'assistant'],
    maxNameLength: 64,
  },
};

export default plugin;
