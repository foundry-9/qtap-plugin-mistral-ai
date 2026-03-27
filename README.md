# qtap-plugin-mistral-ai

Mistral AI support for Quilltap

## Plugin 1: Mistral AI (`qtap-plugin-mistral`)

### Summary

Connect to Mistral's API at `api.mistral.ai/v1` using the `@mistralai/mistralai` SDK or the OpenAI SDK with base URL override. Mistral offers the strongest value proposition of any new plugin: reasoning models, vision, tool calling, OCR, audio transcription, and the cheapest high-quality models in the market.

### API Details

| Field          | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| **Base URL**   | `https://api.mistral.ai/v1`                                   |
| **Auth**       | `Authorization: Bearer {MISTRAL_API_KEY}`                     |
| **SDK**        | `@mistralai/mistralai` (preferred) or `openai` with `baseURL` |
| **API format** | Chat Completions (`/v1/chat/completions`)                     |
| **Streaming**  | SSE via `stream: true`                                        |
| **Docs**       | <https://docs.mistral.ai/api>                                 |

### Supported Capabilities

| Capability                | Support | Notes                                                                                                  |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| **Chat completions**      | ✅      | Standard chat completions format                                                                       |
| **Streaming**             | ✅      | SSE with `stream: true`                                                                                |
| **Tool/function calling** | ✅      | Standard OpenAI format; `tool_choice: "any"` forces tool use; `parallel_tool_calls` supported          |
| **Vision/image input**    | ✅      | `image_url` content parts (URL or base64); supported on Mistral Small 3.1+, Pixtral, Mistral Medium 3+ |
| **JSON mode**             | ✅      | `response_format: { type: "json_object" }` and `{ type: "json_schema" }` (structured outputs)          |
| **Reasoning models**      | ✅      | Magistral models with `reasoning_effort` param (`"high"`, `"medium"`, `"none"`)                        |
| **Embeddings**            | ✅      | `mistral-embed` and `codestral-embed` models                                                           |
| **Image generation**      | ❌      | Not available via API                                                                                  |
| **Web search**            | ⚠️      | Available via Agents API connector (server-side), not standard chat completions                        |
| **File attachments**      | ✅      | Via vision (images) and Document Library (PDFs, for Agents API)                                        |

### Models (current as of March 2026)

**Chat/General:**

- `mistral-large-latest` (Mistral Large 3) — flagship, 675B MoE, 128K context
- `mistral-medium-latest` (Mistral Medium 3.1) — GPT-4 class, $0.40/$2.00 per M tokens
- `mistral-small-latest` (Mistral Small 4) — hybrid instruct/reasoning/coding, 256K context, multimodal
- `ministral-3b-latest`, `ministral-8b-latest`, `ministral-14b-latest` — edge/small models

**Reasoning:**

- `magistral-medium-latest` — reasoning with configurable effort
- `magistral-small-latest` — lighter reasoning model

**Code:**

- `codestral-latest` — code-optimized
- `devstral-latest` (Devstral 2) — agentic coding

**Specialized:**

- `pixtral-12b-2409` — vision-first model
- `mistral-ocr-latest` — document OCR (not chat completions; separate endpoint)
- `voxtral-small-latest` — audio chat
- `voxtral-mini-latest` — audio transcription

### Plugin-Specific Implementation Notes

1. **SDK choice:** Use `@mistralai/mistralai` for the primary implementation. The Mistral SDK handles token counting, streaming, and tool calling natively. The OpenAI SDK works as a fallback but misses Mistral-specific features like `reasoning_effort` and `safe_prompt`.

2. **Reasoning model detection:** Check for `magistral` prefix in model name. When detected:
   - Support `reasoning_effort` parameter (map from Quilltap's UI toggle)
   - Stream reasoning content separately if the SDK exposes it

3. **Vision support:** Use the standard `image_url` content type. Detection: models with `pixtral`, `mistral-small` (3.1+), `mistral-medium` (3+), or `mistral-large` (3+) in the name support vision.

4. **`safe_prompt` parameter:** Mistral supports a `safe_prompt: true` option that injects a safety preamble. Expose this in the connection profile as a toggle (default: false for roleplay use cases).

5. **`prefix` feature:** Mistral supports assistant message prefilling via a `prefix` parameter. This is useful for locking character voice. Expose in connection profile advanced settings.

6. **Cheap LLM candidates:** `ministral-3b-latest`, `ministral-8b-latest`, `mistral-small-latest`

7. **Embedding models:** Register `mistral-embed` and `codestral-embed` as embedding providers.

### Estimated Scope

- ~400 lines for `provider.ts` (based on existing OpenAI plugin complexity)
- ~50 lines for `index.ts`
- Mistral SDK is an additional dependency (~2MB bundled)
