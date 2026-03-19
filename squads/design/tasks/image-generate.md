# Generate Image via Nano Banana

> Task ID: image-generate
> Agent: Nano Banana Generator
> Version: 3.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[image-batch, prompt-refine]` · workflow: `any`
> **On Fail:** If Gemini CLI fails → fall back to OpenRouter REST API. If both fail → check GEMINI_API_KEY and Nano Banana extension install.

## Description

Generate a single image using Google Gemini models (Nano Banana) via **Gemini CLI** (primary) or **OpenRouter REST API** (fallback). All prompts MUST follow the SCDS framework (Subject, Setting, Style, Technical). This is the foundational generation task — all other image tasks build on this.

## Output Schema
- **produces:** `{output_dir}/{filename}.png` + `{output_dir}/generation-log.yaml`
- **format:** PNG image + YAML metadata
- **consumed_by:** logo-curate, prompt-refine, image-batch

## Related Checklists
- `squads/design/checklists/design-fidelity-checklist.md`
- `squads/design/checklists/design-handoff-checklist.md`

## Prerequisites

- **Primary:** `gemini` CLI installed (`npm i -g @google/gemini-cli`) + `GEMINI_API_KEY` in `.env`
- **Primary (extension):** Nano Banana extension installed (`gemini extensions install https://github.com/gemini-cli-extensions/nanobanana`)
- **Fallback:** `OPENROUTER_API_KEY` in `.env` (REST API, used only if Gemini CLI fails)
- Structured SCDS prompt (never generate from raw/unstructured input)
- User approval of prompt before generation

## Provider Selection

```
IF gemini CLI available AND GEMINI_API_KEY set
  → use Gemini CLI with Nano Banana extension (primary)
  ON FAIL → IF OPENROUTER_API_KEY set → use OpenRouter REST API (fallback)
ELSE IF OPENROUTER_API_KEY set
  → use OpenRouter REST API (only option)
ELSE
  → ABORT: no provider configured
```

## Workflow

### Interactive Elicitation

1. **Validate SCDS Prompt**
   - Confirm all 4 SCDS components are present: SUBJECT, SETTING, STYLE, TECHNICAL
   - If any component is missing, construct it from context or ask user
   - Display the complete SCDS prompt for approval

2. **Confirm Technical Specs**
   - Aspect ratio (default: 1:1)
   - Resolution (default: 2K)
   - Model selection:
     - `gemini-3.1-flash-image-preview` — Latest, speed-optimized (default)
     - `gemini-2.5-flash-image` — Fast, cost-effective
     - `gemini-3-pro-image-preview` — Best quality, text rendering

3. **User Approval**
   - Show final prompt + specs
   - Wait for explicit GO before generating

### Steps

1. **Validate Environment**
   - Check `gemini` CLI: `which gemini`
   - Check `GEMINI_API_KEY` in `.env` or environment
   - Check Nano Banana extension: `gemini extensions list` (look for `nanobanana`)
   - If extension missing → install: `gemini extensions install https://github.com/gemini-cli-extensions/nanobanana`
   - If CLI not available → fall back to OpenRouter REST API
   - Log selected provider

2. **Construct & Execute — Gemini CLI (Primary)**

   **Option A: Nano Banana Extension `/generate` command (preferred)**
   ```bash
   gemini -p "/generate {scds_prompt}. Negative: {negative_prompt}. \
     --aspect {aspect_ratio} \
     --style flat-vector \
     --output {output_dir}/{filename}.png" \
     --yolo
   ```

   **Option B: Native prompt (if extension unavailable)**
   ```bash
   gemini -p "Generate an image with these specifications:
   [SUBJECT]: {subject}
   [SETTING]: {setting}
   [STYLE]: {style}
   [TECHNICAL]: Aspect ratio {aspect_ratio}, resolution {resolution}
   Negative prompt: {negative_prompt}
   Save the image to {output_dir}/{filename}.png" \
     --yolo
   ```

   **Option C: Pipe pattern (cli-router style)**
   ```bash
   cat squads/design/agents/nano-banana-generator.md | \
     gemini -p "Generate image with SCDS prompt: {scds_prompt}. \
     Aspect ratio: {aspect_ratio}. Resolution: {resolution}. \
     Negative: {negative_prompt}. \
     Save to: {output_dir}/{filename}.png" \
     --yolo
   ```

3. **Execute — OpenRouter REST API (Fallback)**

   Only if Gemini CLI failed or unavailable:
   ```bash
   curl -s -X POST \
     "https://openrouter.ai/api/v1/chat/completions" \
     -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "google/{model}",
       "messages": [{"role": "user", "content": "{scds_prompt}. Negative: {negative_prompt}"}],
       "modalities": ["image", "text"],
       "image_config": {
         "aspect_ratio": "{aspect_ratio}",
         "image_size": "{resolution}"
       }
     }'
   ```
   - Parse response, extract base64 image, decode and save as PNG

4. **Verify Output**
   - Check: file exists at `{output_dir}/{filename}.png`
   - Check: file size > 0 — retry with simplified prompt if empty
   - Extract any text commentary from Gemini response

5. **Log Generation**
   - Append to `{output_dir}/generation-log.yaml`:
     ```yaml
     - id: "{uuid}"
       timestamp: "{ISO-8601}"
       provider: "gemini-cli|openrouter"
       method: "extension-generate|native-prompt|pipe|rest-api"
       model: "{model}"
       prompt: "{scds_prompt}"
       negative_prompt: "{negative_prompt}"
       aspect_ratio: "{aspect_ratio}"
       resolution: "{resolution}"
       output_file: "{filename}.png"
       file_size_kb: {size}
       status: "success"
       fallback_used: false
     ```

6. **Present Result**
   - Display generated image path
   - Show prompt used for reproducibility
   - Show provider + method used
   - Offer next steps: refine (prompt-refine), batch variations (image-batch), or approve

## API Reference

### Gemini CLI (Primary)

| Property | Value |
|---|---|
| **Binary** | `gemini` (installed via `npm i -g @google/gemini-cli`) |
| **Version** | >= 0.31.0 |
| **Extension** | `nanobanana` (via `gemini extensions install`) |
| **Auth** | `GEMINI_API_KEY` environment variable |
| **Headless mode** | `gemini -p "prompt" --yolo` |
| **Commands** | `/generate`, `/edit`, `/restore`, `/icon`, `/pattern`, `/diagram` |
| **Models** | `gemini-3.1-flash-image-preview` (default), `gemini-2.5-flash-image`, `gemini-3-pro-image-preview` |
| **Aspect Ratios** | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 4:5, 5:4, 21:9, + more |
| **Resolutions** | 0.5K, 1K, 2K, 4K |
| **Free tier** | 1000 requests/day |

### OpenRouter REST API (Fallback)

| Property | Value |
|---|---|
| **Endpoint** | `https://openrouter.ai/api/v1/chat/completions` |
| **Auth** | `Authorization: Bearer $OPENROUTER_API_KEY` |
| **Models** | `google/gemini-2.5-flash-image`, `google/gemini-3-pro-image-preview` |
| **Aspect Ratios** | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3 |
| **Resolutions** | 1K, 2K, 4K |

## Output

| Artifact | Location | Description |
|---|---|---|
| Generated image | `{output_dir}/{filename}.png` | The generated image |
| Generation log | `{output_dir}/generation-log.yaml` | Metadata + prompt + provider for reproducibility |

## Anti-Patterns

- **"Prompt dumping"** — Sending raw user input without SCDS structuring. ALWAYS parse into SCDS first
- **"Resolution gambling"** — Using 4K for exploratory generations. Use 1K for exploration, 2K for refinement, 4K for final only
- **"Single-shot syndrome"** — Generating one image and calling it done. Always offer variations or refinement paths
- **"Negative prompt neglect"** — Skipping negative prompts. ALWAYS include baseline negatives
- **"REST when CLI works"** — Using OpenRouter when Gemini CLI is available. CLI is always preferred
- **"Skipping extension"** — Calling Gemini CLI without the Nano Banana extension. The extension provides better image generation commands

## Failure Handling

- **Gemini CLI not installed:** `npm i -g @google/gemini-cli`, then retry
- **Nano Banana extension missing:** `gemini extensions install https://github.com/gemini-cli-extensions/nanobanana`
- **GEMINI_API_KEY missing:** Fall back to OpenRouter if available
- **Gemini CLI timeout/error:** Fall back to OpenRouter REST API
- **OpenRouter also fails:** Abort with clear error listing both issues
- **Empty/corrupt image:** Simplify prompt, reduce resolution to 1K, retry
- **Rate limit:** Wait 30s, retry up to 3 times

## Success Criteria

- [ ] SCDS prompt validated before generation
- [ ] User approved prompt before execution
- [ ] Gemini CLI attempted first (if available)
- [ ] Image file saved and non-empty
- [ ] Generation log updated with provider + method + full metadata
- [ ] Prompt documented for reproducibility

## Handoff

```yaml
to: "{requesting_agent}"
pass:
  - image_path: "{output_dir}/{filename}.png"
  - prompt_used: "{scds_prompt}"
  - generation_id: "{uuid}"
  - log_path: "{output_dir}/generation-log.yaml"
  - provider_used: "gemini-cli|openrouter"
```
