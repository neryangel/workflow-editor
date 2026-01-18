# API Documentation

## Endpoints

### POST /api/ai/llm

Generate text using LLM (Gemini).

**Request:**

```json
{
    "prompt": "string (required, 1-10000 chars)",
    "systemPrompt": "string (optional, max 5000 chars)"
}
```

**Response:**

```json
{
    "success": true,
    "text": "Generated response",
    "mock": false
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 400 | Invalid prompt |
| 500 | Server error |

---

### POST /api/run-workflow

Execute a workflow.

**Request:**

```json
{
    "nodes": [
        {
            "id": "string",
            "type": "inputText|llm|imageGen|videoGen|extractFrame|output",
            "data": {}
        }
    ],
    "edges": [
        {
            "id": "string",
            "source": "nodeId",
            "target": "nodeId"
        }
    ]
}
```

**Response:**

```json
{
    "success": true,
    "nodes": [
        /* executed nodes with outputs */
    ]
}
```

**Limits:**

- Max 100 nodes per workflow
- Max 500 edges per workflow

---

## Node Types

| Type           | Inputs                            | Outputs     |
| -------------- | --------------------------------- | ----------- |
| `inputText`    | -                                 | `out_text`  |
| `llm`          | `in_text`, `in_system`            | `out_text`  |
| `imageGen`     | `in_text`                         | `out_image` |
| `videoGen`     | `in_text`, `in_image`             | `out_video` |
| `extractFrame` | `in_video`                        | `out_image` |
| `output`       | `in_text`, `in_image`, `in_video` | -           |
