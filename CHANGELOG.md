# Changelog for qtap-plugin-mistral-ai

## 1.0.0

- Initial implementation of Mistral AI provider plugin for Quilltap
- Chat completions with streaming (SSE) support
- Vision/image input for supported models (Pixtral, Small 3.1+, Medium 3+, Large 3+)
- Tool/function calling in OpenAI-compatible format
- Reasoning model support (Magistral) with configurable `reasoning_effort`
- Embedding provider for `mistral-embed` and `codestral-embed`
- Mistral-specific `safe_prompt` parameter support
- 10 models registered with pricing: Large 3, Medium 3.1, Small 4, Magistral Medium/Small, Codestral, Devstral 2, Ministral 3B/8B, Pixtral 12B
- Dynamic model listing and API key validation via `/v1/models`
- Cheap model recommendations (Ministral 3B/8B, Small) for background tasks
