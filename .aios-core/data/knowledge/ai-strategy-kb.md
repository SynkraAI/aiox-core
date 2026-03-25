# AI Strategy Knowledge Base
## AIOX Corporation - AI Strategy Department

> **Department Head**: Chief AI Officer (Demis Hassabis Agent)
> **Core Experts**: Andrew Ng, Chip Huyen, Fei-Fei Li, Andrej Karpathy
> **Last Updated**: 2026-03-24
> **Version**: 1.0.0

---

## Table of Contents

1. [LLM Landscape 2025-2026](#1-llm-landscape-2025-2026)
2. [ML System Design](#2-ml-system-design)
3. [AI Safety and Alignment](#3-ai-safety-and-alignment)
4. [Computer Vision](#4-computer-vision)
5. [Data-Centric AI](#5-data-centric-ai)
6. [Scaling Laws and Architecture](#6-scaling-laws-and-architecture)
7. [AI Governance](#7-ai-governance)
8. [AI Engineering](#8-ai-engineering)
9. [Evaluation and Benchmarking](#9-evaluation-and-benchmarking)
10. [Decision Frameworks & Checklists](#10-decision-frameworks--checklists)

---

## 1. LLM Landscape 2025-2026

### 1.1 Major Model Families

| Family | Provider | Key Models (2025-2026) | Strengths |
|--------|----------|----------------------|-----------|
| **GPT** | OpenAI | GPT-4o, GPT-4.5, o1, o3, o4-mini | Reasoning, general purpose, vision |
| **Claude** | Anthropic | Claude 3.5 Sonnet, Claude 4 Opus | Coding, analysis, safety, long context |
| **Gemini** | Google | Gemini 2.0, Gemini 2.5 Pro | Multimodal, search integration, 1M+ context |
| **Llama** | Meta | Llama 3.1, Llama 4 (405B) | Open source, fine-tunable, on-premise |
| **Mistral** | Mistral AI | Mistral Large, Mixtral, Codestral | European, efficient, multilingual |
| **Grok** | xAI | Grok 3 | Real-time data, unfiltered |
| **DeepSeek** | DeepSeek | DeepSeek-V3, DeepSeek-R1 | Cost-efficient, strong reasoning |
| **Command** | Cohere | Command R+, Embed v4 | Enterprise RAG, multilingual embeddings |

### 1.2 Model Selection Framework

```
Decision Tree: Which LLM to Use?

Task Requirements:
├── Need reasoning/chain-of-thought?
│   ├── YES → o1/o3 (OpenAI) or Claude 4 Opus
│   └── NO ↓
├── Need code generation?
│   ├── YES → Claude 3.5/4 Sonnet or GPT-4o
│   └── NO ↓
├── Need multimodal (image/video)?
│   ├── YES → Gemini 2.5 or GPT-4o
│   └── NO ↓
├── Need long context (>100K tokens)?
│   ├── YES → Gemini (1M+) or Claude (200K)
│   └── NO ↓
├── Need on-premise/self-hosted?
│   ├── YES → Llama 4, Mistral, or DeepSeek
│   └── NO ↓
├── Need real-time/streaming?
│   ├── YES → GPT-4o (fast) or Claude 3.5 Sonnet (fast)
│   └── NO ↓
├── Budget constrained?
│   ├── YES → DeepSeek, Llama (self-hosted), Mistral
│   └── NO → Use best model for the task
└── Latency critical?
    ├── YES → Smaller models (GPT-4o-mini, Claude Haiku, Gemini Flash)
    └── NO → Larger models for quality
```

### 1.3 Cost Optimization Strategies

```
LLM Cost Hierarchy (cheapest to most expensive):
1. Cached / pre-computed responses
2. Small fine-tuned model
3. Small general model (GPT-4o-mini, Haiku, Flash)
4. RAG with small model
5. Large general model (GPT-4o, Sonnet, Gemini Pro)
6. Reasoning model (o1, o3, Opus)

Cost Reduction Techniques:
├── Prompt caching (reuse system prompts)
├── Batch API (50% discount, non-real-time)
├── Token reduction (concise prompts, structured output)
├── Model routing (cheap model first, escalate if needed)
├── Fine-tuning (smaller model, domain-specific)
├── Caching layer (Redis for repeated queries)
├── Embedding search before generation (RAG)
└── Output length limits (max_tokens parameter)

Model Router Pattern:
Query → Classifier → Simple? → Small Model (fast, cheap)
                   → Complex? → Large Model (slow, quality)
                   → Reasoning? → Reasoning Model (slowest, best)
```

### 1.4 Emerging Capabilities (2025-2026)

```
Trends:
├── Agent frameworks: Multi-step reasoning with tool use
├── Computer use: Models that operate GUIs (Claude Computer Use)
├── Multimodal generation: Text + Image + Audio + Video
├── Real-time interaction: Voice-to-voice AI (GPT-4o realtime)
├── Memory: Persistent context across sessions
├── Reasoning: Chain-of-thought, tree-of-thought
├── Code execution: Sandboxed code running (o3, Claude)
└── MCP (Model Context Protocol): Standardized tool integration
```

---

## 2. ML System Design

### 2.1 Chip Huyen's ML System Design Framework

#### The ML System Design Process

```
1. Project Setup
   ├── Define business objective
   ├── Define ML objective (what to predict/optimize)
   ├── Define constraints (latency, cost, privacy)
   └── Define success metrics (business + ML)

2. Data Pipeline
   ├── Data collection strategy
   ├── Data labeling approach
   ├── Feature engineering
   ├── Data quality monitoring
   └── Data versioning

3. Model Development
   ├── Model selection (baseline → complex)
   ├── Training infrastructure
   ├── Experiment tracking
   ├── Hyperparameter tuning
   └── Model evaluation

4. Deployment
   ├── Serving infrastructure
   ├── Batch vs real-time
   ├── Model versioning
   ├── A/B testing
   └── Canary deployment

5. Monitoring & Maintenance
   ├── Data drift detection
   ├── Model performance monitoring
   ├── Retraining pipeline
   ├── Feedback loops
   └── Incident response
```

#### ML vs Traditional Software

| Aspect | Traditional Software | ML Systems |
|--------|---------------------|------------|
| Logic | Explicitly programmed | Learned from data |
| Testing | Deterministic tests | Statistical validation |
| Debugging | Stack traces, logs | Data analysis, feature importance |
| Versioning | Code only | Code + Data + Model + Config |
| Monitoring | Errors, latency | Data drift, model performance |
| Failure mode | Crash, wrong output | Gradual degradation |

### 2.2 Feature Store Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Data Sources  │────▶│ Feature      │────▶│ Feature      │
│ (raw data)    │     │ Engineering  │     │ Store        │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │ Training │ │ Serving  │ │ Monitoring│
                              │ Pipeline │ │ Pipeline │ │ Pipeline  │
                              └──────────┘ └──────────┘ └──────────┘

Feature Store Benefits:
├── Feature reuse across models
├── Consistency between training and serving
├── Point-in-time correctness (avoid data leakage)
├── Feature versioning and lineage
└── Feature monitoring and quality checks

Tools: Feast, Tecton, Hopsworks, Databricks Feature Store
```

### 2.3 Model Serving Patterns

```
Pattern 1: Batch Prediction
├── Pre-compute predictions for all inputs
├── Store in database/cache
├── Serve from cache (fast, cheap)
├── Use when: Predictions don't change frequently
└── Example: Product recommendations refreshed daily

Pattern 2: Real-Time Prediction
├── Model loaded in memory
├── Inference on each request
├── Use when: Input changes per request
└── Example: Fraud detection, search ranking

Pattern 3: Streaming Prediction
├── Continuous inference on event stream
├── Use when: Events arrive continuously
└── Example: Anomaly detection, real-time analytics

Pattern 4: Edge Prediction
├── Model runs on device (phone, IoT)
├── Use when: Low latency, privacy, offline needed
└── Example: Face recognition, voice assistant

Serving Infrastructure:
├── TensorFlow Serving / TorchServe
├── NVIDIA Triton Inference Server
├── Seldon Core / KServe (Kubernetes)
├── BentoML (packaging and serving)
├── vLLM (LLM-specific serving)
└── Ollama (local LLM serving)
```

### 2.4 MLOps Maturity Model

| Level | Description | Characteristics |
|-------|-------------|-----------------|
| **0** | No MLOps | Manual everything, notebooks in production |
| **1** | DevOps but no MLOps | CI/CD for code, but manual model management |
| **2** | Automated Training | Automated retraining, experiment tracking |
| **3** | Automated Deployment | CI/CD for models, A/B testing, monitoring |
| **4** | Full MLOps | Automated end-to-end, self-healing, auto-retraining |

---

## 3. AI Safety and Alignment

### 3.1 Core Safety Concepts

```
AI Safety Hierarchy:

1. Robustness
   ├── Adversarial robustness (resist attacks)
   ├── Distribution robustness (handle new data)
   └── Specification robustness (do what we actually mean)

2. Alignment
   ├── Outer alignment: Objective matches human intent
   ├── Inner alignment: Model pursues the objective faithfully
   └── Goal stability: Model doesn't modify its own goals

3. Interpretability
   ├── Feature importance (which inputs matter)
   ├── Attention visualization (what the model focuses on)
   ├── Mechanistic interpretability (how the model works internally)
   └── Chain-of-thought (making reasoning visible)

4. Monitoring
   ├── Behavioral monitoring (detect anomalous outputs)
   ├── Value alignment checks (ensure ethical behavior)
   └── Capability monitoring (detect unexpected capabilities)
```

### 3.2 Safety Evaluation Framework

```
Red Team Checklist:

Harmful Content:
├── Does the model generate violent content?
├── Does it produce discriminatory outputs?
├── Does it create deceptive content?
├── Does it help with dangerous activities?
└── Does it generate CSAM or exploitation content?

Bias and Fairness:
├── Performance across demographics (gender, race, age)
├── Stereotyping in generated content
├── Representation in outputs
├── Equal accuracy across groups
└── Disparate impact analysis

Privacy:
├── Does it memorize training data?
├── Can it be used for surveillance?
├── Does it leak PII?
├── Can it de-anonymize data?
└── Does it respect consent boundaries?

Security:
├── Prompt injection resistance
├── Jailbreak resistance
├── Data poisoning resistance
├── Model extraction resistance
└── Adversarial input handling
```

### 3.3 Constitutional AI (Anthropic's Approach)

```
Principles:
1. Be helpful, harmless, and honest
2. Follow a set of principles (constitution)
3. Self-evaluate and self-correct
4. Prefer to refuse rather than produce harmful content
5. Be transparent about limitations

RLHF Pipeline:
1. Pre-train on large corpus
2. Supervised fine-tuning on curated demonstrations
3. Reward model training on human preferences
4. RL optimization against reward model
5. Constitutional AI: Self-critique and revision

Safety Layers:
├── Pre-training filtering (data curation)
├── Fine-tuning alignment (RLHF/DPO)
├── System prompt guardrails
├── Output filtering (content classifiers)
├── Human review pipeline
└── Monitoring and incident response
```

---

## 4. Computer Vision

### 4.1 State of the Art (2025-2026)

```
Vision Model Evolution:
CNN Era (2012-2020) → ViT Era (2020-2023) → Multimodal Era (2023+)

Current Architecture Landscape:

Image Understanding:
├── ViT (Vision Transformer) - Classification, features
├── DINOv2 (Self-supervised) - Universal features
├── SAM 2 (Segment Anything 2) - Segmentation
├── CLIP/SigLIP - Vision-language alignment
└── Florence 2 - Unified vision tasks

Image Generation:
├── Stable Diffusion 3 / SDXL Turbo
├── DALL-E 3 (via GPT-4o)
├── Midjourney v6+
├── Flux (by Black Forest Labs)
└── Imagen 3 (Google)

Video:
├── Sora (OpenAI) - Video generation
├── Runway Gen-3 - Video generation/editing
├── VideoMAE - Video understanding
└── LLaVA-Video - Video QA

3D:
├── NeRF / Gaussian Splatting - 3D reconstruction
├── Point-E / Shap-E - 3D generation from text
└── DreamFusion - Text-to-3D
```

### 4.2 Fei-Fei Li's Contributions

```
Key Contributions:
├── ImageNet: The dataset that sparked deep learning revolution
├── Spatial AI: Understanding 3D scenes and spatial reasoning
├── Embodied AI: AI that can perceive and act in physical world
├── Human-centered AI: AI that augments human capabilities
└── HAI (Stanford): Human-Centered AI Institute

Principles for AI Development (Fei-Fei Li):
1. AI should enhance human capability, not replace it
2. Diverse teams build better AI (representation matters)
3. We need to think about AI's societal impact from the start
4. AI education should be accessible to everyone
5. Ethics and technical development must go hand-in-hand
```

### 4.3 Vision Application Decision Matrix

| Application | Model | Approach | Data Needed |
|-------------|-------|----------|-------------|
| Image Classification | ViT, ResNet | Fine-tune pretrained | 1K+ labeled images/class |
| Object Detection | YOLO v8+, DETR | Fine-tune on COCO format | 1K+ annotated images |
| Segmentation | SAM 2 | Zero-shot or fine-tune | 500+ masks |
| OCR/Document | PaddleOCR, DocTR | Pre-trained or fine-tune | Domain-specific samples |
| Face Recognition | ArcFace, FaceNet | Fine-tune embeddings | 50+ images per identity |
| Image Search | CLIP, SigLIP | Embed + vector DB | No training needed |
| Image Generation | SD3, DALL-E 3 | Prompt engineering or LoRA | 10-50 images for style |

---

## 5. Data-Centric AI

### 5.1 Andrew Ng's Data-Centric AI Framework

```
Traditional (Model-Centric) AI:
  Fixed data → Iterate on model architecture/hyperparameters

Data-Centric AI:
  Fixed model → Iterate on data quality and labeling

Key Insight:
"Instead of trying to improve the model, improve the data.
80% of AI project time should be on data, not modeling."

Data Quality Dimensions:
├── Accuracy: Are labels correct?
├── Completeness: Are there gaps in coverage?
├── Consistency: Are labeling guidelines followed uniformly?
├── Timeliness: Is the data current?
├── Relevance: Does the data represent the production distribution?
└── Sufficiency: Is there enough data for the task?
```

### 5.2 Data Quality Improvement Process

```
Step 1: Data Audit
├── Sample and manually inspect 100-500 examples
├── Calculate inter-annotator agreement (Cohen's Kappa)
├── Identify systematic labeling errors
├── Check for class imbalance
└── Analyze edge cases

Step 2: Labeling Guidelines
├── Write clear, unambiguous labeling instructions
├── Include edge case examples
├── Define what to do with uncertain cases
├── Create golden set for evaluating labelers
└── Version control the guidelines

Step 3: Iterative Improvement
├── Train baseline model
├── Analyze error cases
├── Fix data issues causing errors
├── Retrain and compare
├── Repeat until diminishing returns

Step 4: Data Augmentation
├── Geometric transforms (rotation, flip, crop)
├── Color augmentation (brightness, contrast)
├── Synthetic data generation
├── Mixup / CutMix
├── Text augmentation (paraphrase, back-translation)
└── LLM-generated synthetic examples
```

### 5.3 Data Flywheel

```
The Data Flywheel:

Better Data → Better Model → Better Product → More Users → More Data
     ↑                                                        │
     └────────────────────────────────────────────────────────┘

How to Build the Flywheel:
1. Launch with minimum viable data
2. Build feedback mechanisms into the product
3. Use model predictions to surface labeling opportunities
4. Prioritize data collection for weak areas
5. Automate data pipeline and quality checks
6. Create tight loop between production and training data
```

---

## 6. Scaling Laws and Architecture

### 6.1 Neural Scaling Laws

```
The Chinchilla Scaling Laws (DeepMind):
"For compute-optimal training, model size and data should scale equally."

L(N, D) = A/N^α + B/D^β + E

Where:
N = number of parameters
D = number of training tokens
L = loss
α ≈ 0.34 (parameter exponent)
β ≈ 0.28 (data exponent)

Practical Implications:
├── 7B model needs ~150B tokens (optimal)
├── 70B model needs ~1.4T tokens (optimal)
├── Most models in 2023 were undertrained (more data helps)
├── Inference cost scales with model size
└── Smaller, better-trained models can match larger ones

Beyond Chinchilla (2025-2026):
├── Over-training is intentional (smaller model, more tokens)
├── Test-time compute scaling (o1/o3 reasoning)
├── Mixture of Experts (MoE) reduces inference cost
├── Distillation transfers large→small effectively
└── Synthetic data extends effective training data
```

### 6.2 Transformer Architecture

```
Core Components:

Input → Embedding → [Transformer Block × N] → Output

Transformer Block:
├── Multi-Head Self-Attention
│   ├── Q (Query), K (Key), V (Value) projections
│   ├── Attention(Q,K,V) = softmax(QK^T / √d_k) × V
│   ├── Multiple heads capture different relationships
│   └── Concatenate heads + linear projection
├── Layer Normalization (Pre-LN or Post-LN)
├── Feed-Forward Network (MLP)
│   ├── Linear → GELU/SwiGLU → Linear
│   └── Typically 4× hidden dimension
├── Residual Connections (around each sub-layer)
└── Repeat for N layers

Modern Improvements (2024-2026):
├── RoPE (Rotary Position Embedding): Better position encoding
├── GQA (Grouped Query Attention): Efficient KV cache
├── SwiGLU activation: Better than ReLU/GELU
├── Flash Attention 2/3: Memory-efficient attention
├── MoE (Mixture of Experts): Conditional computation
├── Ring Attention: Extremely long context
└── SSM hybrids (Mamba): Linear-time sequence modeling
```

### 6.3 Architecture Decision Guide

```
Choosing Model Architecture:

Text-only tasks:
├── Classification → Encoder (BERT-style) or LLM
├── Generation → Decoder (GPT-style)
├── Translation → Encoder-Decoder or LLM
└── Retrieval → Bi-encoder (embedding models)

Multimodal tasks:
├── Image + Text → Vision Encoder + LLM (LLaVA, GPT-4V)
├── Audio + Text → Audio Encoder + LLM (Whisper + LLM)
└── Video + Text → Video Encoder + LLM

Efficiency considerations:
├── < 1B params → Can run on consumer GPU
├── 1-7B params → Single GPU (A100/H100)
├── 7-70B params → Multi-GPU or quantized
├── 70B+ params → Multi-node or API-only
└── MoE → Activates subset of params (efficient)
```

---

## 7. AI Governance

### 7.1 AI Governance Framework

```
Governance Pillars:

1. ACCOUNTABILITY
   ├── Clear ownership of AI systems
   ├── Decision-making authority defined
   ├── Audit trails for model decisions
   └── Incident response procedures

2. TRANSPARENCY
   ├── Model cards for each deployed model
   ├── Data sheets for datasets
   ├── Explainability requirements
   └── Public reporting on AI use

3. FAIRNESS
   ├── Bias testing before deployment
   ├── Ongoing fairness monitoring
   ├── Demographic parity analysis
   ├── Disparate impact assessment
   └── Remediation procedures

4. PRIVACY
   ├── Data minimization
   ├── Purpose limitation
   ├── Consent management
   ├── Right to explanation
   └── Data deletion capabilities

5. SECURITY
   ├── Model access controls
   ├── Adversarial robustness testing
   ├── Data poisoning prevention
   ├── Output monitoring
   └── Incident response for AI-specific threats
```

### 7.2 Regulatory Landscape (2025-2026)

```
EU AI Act (Effective 2025-2026):
├── Prohibited: Social scoring, real-time biometric in public
├── High-Risk: Healthcare, law enforcement, hiring, education
│   ├── Conformity assessment required
│   ├── Risk management system
│   ├── Data governance requirements
│   ├── Technical documentation
│   ├── Record-keeping
│   ├── Transparency obligations
│   ├── Human oversight
│   └── Accuracy and robustness requirements
├── Limited Risk: Chatbots (must disclose AI), deepfakes (must label)
└── Minimal Risk: Spam filters, games (no requirements)

US Executive Order on AI:
├── Safety testing for frontier models
├── Standards from NIST AI Risk Management Framework
├── Reporting requirements for large training runs
└── Watermarking and provenance for AI content

Other Jurisdictions:
├── Brazil: LGPD + AI Bill under discussion
├── China: Generative AI regulations (2023+)
├── UK: Pro-innovation approach (sector-specific)
└── Canada: AIDA (Artificial Intelligence and Data Act)
```

### 7.3 Model Card Template

```
Model Card: [Model Name]

1. Model Details
   - Developer: [Team/Company]
   - Version: [X.Y.Z]
   - Type: [Classification/Generation/etc.]
   - Architecture: [Transformer/CNN/etc.]
   - Training date: [YYYY-MM-DD]
   - License: [MIT/Apache/Proprietary]

2. Intended Use
   - Primary use cases: [...]
   - Users: [Who should use this]
   - Out-of-scope uses: [What it should NOT be used for]

3. Training Data
   - Sources: [Dataset names]
   - Size: [Samples/tokens]
   - Preprocessing: [Steps applied]
   - Known limitations: [Biases, gaps]

4. Evaluation
   - Metrics: [Accuracy, F1, BLEU, etc.]
   - Test sets: [Benchmark names]
   - Results: [Specific numbers]
   - Disaggregated results: [By demographic]

5. Ethical Considerations
   - Bias risks: [Known biases]
   - Mitigation: [Steps taken]
   - Monitoring: [Ongoing checks]

6. Limitations
   - Known failure modes: [...]
   - Performance degradation scenarios: [...]
   - Recommendations for users: [...]
```

---

## 8. AI Engineering

### 8.1 RAG (Retrieval-Augmented Generation)

```
Basic RAG Pipeline:

Query → Embedding → Vector Search → Context Retrieval → LLM + Context → Answer

Advanced RAG Patterns:

1. Naive RAG
   Embed query → Search → Top-K results → Prompt LLM
   Limitation: Poor relevance, no re-ranking

2. Advanced RAG
   Query rewriting → Hybrid search (dense + sparse) → Re-ranking → LLM
   Better: Multi-step retrieval, query decomposition

3. Modular RAG
   Router → Appropriate retrieval strategy → Adaptive prompt → LLM
   Best: Different strategies for different query types

Key Design Decisions:
├── Chunk size: 256-512 tokens (overlap 10-20%)
├── Embedding model: text-embedding-3-large, E5, BGE
├── Vector DB: Pinecone, Weaviate, Qdrant, pgvector
├── Re-ranker: Cohere Rerank, cross-encoder
├── Hybrid search: BM25 + dense vectors
└── Context window: Use as much as budget allows

RAG vs Fine-Tuning:
├── RAG: Dynamic knowledge, fact-heavy, recent data
├── Fine-Tuning: Behavior/style change, task specialization
└── Both: Complex domains needing knowledge + style
```

### 8.2 Agent Architecture

```
AI Agent Components:

┌──────────────────────────────────────────┐
│                 Agent                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Memory  │  │  Tools  │  │ Planning│ │
│  │ (context │  │ (APIs,  │  │ (reason │ │
│  │  history)│  │  code,  │  │  + plan)│ │
│  │         │  │  search)│  │         │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│           ┌──────────┐                   │
│           │   LLM    │                   │
│           │ (brain)  │                   │
│           └──────────┘                   │
└──────────────────────────────────────────┘

Agent Patterns:
├── ReAct: Reasoning + Acting (think → act → observe → repeat)
├── Plan-and-Execute: Make full plan, then execute steps
├── Reflection: Self-evaluate and correct
├── Multi-Agent: Multiple specialized agents collaborating
└── Human-in-the-Loop: Agent proposes, human approves

Agent Frameworks (2025-2026):
├── LangChain / LangGraph
├── CrewAI (multi-agent)
├── AutoGen (Microsoft)
├── Claude MCP (Model Context Protocol)
├── OpenAI Assistants API
└── Haystack (RAG-focused)
```

### 8.3 Prompt Engineering

```
Prompt Engineering Hierarchy:
1. Zero-shot: Direct instruction
2. Few-shot: Examples in the prompt
3. Chain-of-Thought: "Think step by step"
4. Self-Consistency: Multiple reasoning paths, majority vote
5. Tree-of-Thought: Explore multiple branches
6. Constitutional: Self-critique and revise

Prompt Structure Template:
├── System prompt (role, constraints, format)
├── Context (relevant information, RAG results)
├── Instructions (clear, specific task description)
├── Examples (if few-shot)
├── Input (the actual query/data)
└── Output format (JSON, markdown, specific structure)

Prompt Optimization Tips:
├── Be specific, not vague
├── Give the model a role/persona
├── Provide examples of desired output
├── Use structured output (JSON mode)
├── Break complex tasks into steps
├── Add constraints explicitly
├── Use XML tags for section boundaries
└── Test with edge cases
```

---

## 9. Evaluation and Benchmarking

### 9.1 LLM Evaluation Framework

```
Evaluation Dimensions:

1. Task Performance
   ├── Accuracy (classification, QA)
   ├── BLEU/ROUGE (generation quality)
   ├── Pass@k (code generation)
   ├── Human preference (Elo rating)
   └── Task-specific metrics

2. Safety
   ├── Toxicity rate
   ├── Bias metrics (demographic parity)
   ├── Jailbreak resistance
   ├── Privacy leakage
   └── Hallucination rate

3. Efficiency
   ├── Latency (time to first token, total generation time)
   ├── Throughput (tokens per second)
   ├── Cost per token (input/output)
   ├── Memory usage
   └── Energy consumption

4. Robustness
   ├── Performance across paraphrases
   ├── Handling of ambiguous inputs
   ├── Graceful degradation with noise
   └── Calibration (confidence vs accuracy)
```

### 9.2 Evaluation Best Practices

```
Building an Eval Suite:

1. Start with public benchmarks as baseline
   ├── MMLU (knowledge breadth)
   ├── HumanEval (code generation)
   ├── MT-Bench (conversation quality)
   ├── TruthfulQA (hallucination)
   └── BigBench (diverse capabilities)

2. Build domain-specific evals
   ├── Curate 200-500 examples from your use case
   ├── Include edge cases and failure modes
   ├── Use LLM-as-judge for scalable evaluation
   ├── Validate LLM-judge with human agreement (>80%)
   └── Version control your eval suite

3. Continuous evaluation
   ├── Run evals on every model update
   ├── Track regression across versions
   ├── A/B test in production with real users
   ├── Monitor for drift over time
   └── Update evals as requirements change

Anti-patterns:
├── Don't optimize for benchmarks (Goodhart's Law)
├── Don't use training data as eval data
├── Don't rely on single metrics
├── Don't skip human evaluation
└── Don't evaluate once and forget
```

### 9.3 Hallucination Detection

```
Types of Hallucinations:
├── Intrinsic: Contradicts the source material
├── Extrinsic: Adds information not in the source
├── Factual: States incorrect facts
└── Fabrication: Invents citations, names, events

Detection Methods:
├── Retrieval-based: Check claims against knowledge base
├── Self-consistency: Generate multiple responses, compare
├── Confidence-based: Low confidence → likely hallucination
├── Entailment: NLI model checks if output follows from context
└── Human evaluation: Gold standard but expensive

Mitigation:
├── RAG (ground in retrieved documents)
├── "I don't know" training (teach model uncertainty)
├── Citation requirements (force references)
├── Post-generation fact-checking
├── Temperature reduction (less creativity = fewer hallucinations)
└── System prompt: "Only answer based on provided context"
```

---

## 10. Decision Frameworks & Checklists

### 10.1 AI Project Feasibility Checklist

- [ ] Clear business problem defined
- [ ] ML approach justified (vs simpler solutions)
- [ ] Sufficient data available (or plan to acquire)
- [ ] Data quality assessed
- [ ] Success metrics defined (business + technical)
- [ ] Baseline performance established
- [ ] Latency and cost requirements specified
- [ ] Ethical considerations reviewed
- [ ] Regulatory requirements identified
- [ ] Team has necessary skills (or plan to hire/upskill)
- [ ] Infrastructure requirements assessed
- [ ] Maintenance plan for post-deployment

### 10.2 Model Deployment Checklist

- [ ] Model performance meets acceptance criteria
- [ ] Bias and fairness tests passed
- [ ] Safety evaluation completed
- [ ] Model card documented
- [ ] A/B test designed and approved
- [ ] Rollback plan in place
- [ ] Monitoring dashboards configured
- [ ] Alerting thresholds set
- [ ] Data pipeline validated (training ↔ serving parity)
- [ ] Load testing completed
- [ ] Cost estimation validated
- [ ] Security review passed
- [ ] Privacy impact assessment completed
- [ ] Stakeholder sign-off obtained

### 10.3 Build vs API Decision

```
Use API (OpenAI, Anthropic, Google):
├── Rapid prototyping / MVP
├── General-purpose tasks
├── Don't want to manage infrastructure
├── Acceptable latency (100-2000ms)
├── Data can leave your environment
└── Budget: Pay per token

Self-Host (Llama, Mistral, open models):
├── Data privacy / sovereignty requirements
├── Predictable high-volume usage
├── Need fine-tuning control
├── Ultra-low latency requirements
├── Regulatory requirements for on-premise
└── Budget: CapEx for GPU infrastructure

Fine-Tune:
├── Domain-specific language/jargon
├── Specific output format/style
├── Consistent behavior needed
├── RAG alone insufficient
└── Have 1K+ high-quality examples
```

### 10.4 AI Ethics Review Checklist

- [ ] Who benefits from this AI system?
- [ ] Who could be harmed?
- [ ] Have we tested across demographic groups?
- [ ] Is the training data representative?
- [ ] Can users opt out of AI-driven decisions?
- [ ] Is there human oversight for high-stakes decisions?
- [ ] Is the AI system's role disclosed to users?
- [ ] Can decisions be explained?
- [ ] Is there a feedback mechanism for errors?
- [ ] Have we considered dual-use risks?
- [ ] Is there a plan for ongoing monitoring?
- [ ] Have legal/compliance teams reviewed?

---

## References

- Huyen, C. "Designing Machine Learning Systems" (2022)
- Ng, A. "Data-Centric AI" (deeplearning.ai, 2021-2026)
- Sutskever, I. Various research papers on AI safety
- Li, F.F. "The Worlds I See" (2023)
- Karpathy, A. "State of GPT" (2023) and blog posts
- Vaswani, A. et al. "Attention Is All You Need" (2017)
- Hoffmann, J. et al. "Training Compute-Optimal LLMs" (Chinchilla, 2022)
- Bai, Y. et al. "Constitutional AI" (Anthropic, 2022)
- EU AI Act (2024)
- NIST AI Risk Management Framework (2023)

---

*AI Strategy KB v1.0 - AIOX Corporation*
*"The biggest risk is not taking any risk." - Mark Zuckerberg*
*"AI is probably the most important thing humanity has ever worked on." - Sundar Pichai*
