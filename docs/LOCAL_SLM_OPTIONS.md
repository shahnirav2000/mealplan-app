# Local SLM (Small Language Model) Deployment Options

This document outlines options for deploying small language models locally in the MealPlan prototype to minimize API costs.

## Option 1: Transformers.js (Browser-Based) ⭐ RECOMMENDED FOR PROTOTYPE

**Best for**: Quick prototype, no backend needed

### How it works
- Runs ONNX models directly in the browser using WebAssembly
- No server required, 100% client-side
- Models: ~50-500MB download (one-time per user)

### Suitable Models
- **DistilBERT** (~250MB) - Text classification, similarity
- **MobileNet** (~20MB) - Image recognition for food photos
- **Xenova/LaMini-Flan-T5-783M** (~300MB) - Text generation for meal analysis

### Implementation

```javascript
// Install: npm install @xenova/transformers

import { pipeline } from '@xenova/transformers';

// One-time initialization
const classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Use for duplicate detection
async function findSimilarMeals(newMeal, existingMeals) {
  const newEmbedding = await classifier(newMeal, { pooling: 'mean', normalize: true });

  const similarities = await Promise.all(
    existingMeals.map(async (meal) => {
      const embedding = await classifier(meal.name, { pooling: 'mean', normalize: true });
      const similarity = cosineSimilarity(newEmbedding.data, embedding.data);
      return { meal, similarity };
    })
  );

  return similarities.sort((a, b) => b.similarity - a.similarity);
}
```

**Pros:**
- ✅ Zero API costs
- ✅ Works offline
- ✅ No backend infrastructure
- ✅ Privacy-friendly (data never leaves browser)

**Cons:**
- ❌ Initial model download (~300MB)
- ❌ Slower on first run (model loading)
- ❌ Limited to smaller models
- ❌ Requires modern browser with WebAssembly

**Cost:** $0 forever

---

## Option 2: Ollama (Local Server)

**Best for**: Development/testing, personal use

### How it works
- Run models locally on your machine
- Simple REST API
- Models: Llama 3.2 1B/3B, Phi-3 Mini, Gemma 2B

### Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a small model
ollama pull llama3.2:1b  # 1.3GB, very fast

# Run server
ollama serve  # Runs on http://localhost:11434
```

### Integration

```javascript
async function analyzeMealWithOllama(mealName, cuisine, existingMeals) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:1b',
      prompt: `Is "${mealName}" (${cuisine}) a duplicate of any: ${existingMeals.join(', ')}?
               Also estimate calories. Reply with JSON only: {"isDuplicate": bool, "calories": number}`,
      stream: false,
      format: 'json'
    })
  });

  const data = await response.json();
  return JSON.parse(data.response);
}
```

**Pros:**
- ✅ Zero API costs
- ✅ Full privacy
- ✅ Better quality than browser models
- ✅ Easy to swap models

**Cons:**
- ❌ Requires local server running
- ❌ 1-5GB model download
- ❌ Won't work for deployed app (users can't run it)
- ❌ Slower inference (~2-5 seconds)

**Cost:** $0, but requires user to run local server

---

## Option 3: WebLLM (Browser-Based LLM)

**Best for**: Advanced prototype with chat-like interactions

### How it works
- Runs Llama-3.2-1B or Phi-3.5 in browser via WebGPU
- ~1-2GB model download
- Requires GPU support

### Implementation

```javascript
// Install: npm install @mlc-ai/web-llm

import { CreateMLCEngine } from "@mlc-ai/web-llm";

const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC");

const response = await engine.chat.completions.create({
  messages: [
    { role: "system", content: "You are a nutrition expert." },
    { role: "user", content: `Analyze: "${mealName}". Is it duplicate? Estimate calories.` }
  ]
});

console.log(response.choices[0].message.content);
```

**Pros:**
- ✅ Zero API costs
- ✅ Works in deployed app
- ✅ Better than simpler browser models
- ✅ Runs on user's GPU

**Cons:**
- ❌ Large model download (1-2GB)
- ❌ Requires WebGPU (Chrome 113+, Edge 113+)
- ❌ Slower on low-end devices
- ❌ High memory usage

**Cost:** $0

---

## Option 4: Cloudflare Workers AI (Cheap Serverless)

**Best for**: Production deployment with minimal cost

### How it works
- Serverless AI inference on Cloudflare's edge
- Pay only for what you use
- Models: Llama 3.2 1B, BERT, Mistral 7B

### Pricing
- $0.011 per 1000 requests (Llama 3.2 1B)
- Free tier: 10,000 neurons/day (~1000 requests)

### Implementation

```javascript
// Cloudflare Worker
export default {
  async fetch(request, env) {
    const { mealName, existingMeals } = await request.json();

    const response = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
      prompt: `Is "${mealName}" duplicate of: ${existingMeals}? Estimate calories. JSON only.`
    });

    return new Response(JSON.stringify(response));
  }
}
```

**Pros:**
- ✅ Very cheap ($0.01 per 1000 requests)
- ✅ No infrastructure management
- ✅ Fast (edge deployment)
- ✅ Free tier available

**Cons:**
- ❌ Not fully free
- ❌ Requires Cloudflare Workers setup
- ❌ Model selection limited

**Cost:** ~$0.011 per 1000 meals analyzed

---

## Option 5: Hugging Face Inference API (Free Tier)

**Best for**: Testing without setup

### How it works
- Free inference for public models
- Rate limited but generous for prototypes
- 1000s of models available

### Implementation

```javascript
async function analyzeMealWithHF(mealName) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: 'POST',
      body: JSON.stringify({
        inputs: mealName,
        parameters: { candidate_labels: ['healthy', 'high-calorie', 'low-calorie'] }
      })
    }
  );

  return await response.json();
}
```

**Pros:**
- ✅ Free tier (rate limited)
- ✅ Many models available
- ✅ No local setup
- ✅ Easy to test

**Cons:**
- ❌ Rate limits (can be strict)
- ❌ Cold start delays
- ❌ Not guaranteed uptime for free tier

**Cost:** Free (with limits)

---

## RECOMMENDATION FOR YOUR PROTOTYPE

### 🎯 Hybrid Approach (Optimal Cost/Performance)

```javascript
// src/utils/mealIntelligence.js - Enhanced version

import { pipeline } from '@xenova/transformers';

let embedder = null;

// Initialize once
async function initLocalSLM() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
}

export async function analyzeMealHybrid(mealName, mealType, cuisine, taste, existingMeals) {
  // LAYER 1: Browser SLM for semantic duplicate detection (FREE)
  await initLocalSLM();
  const semanticCheck = await semanticDuplicateCheck(mealName, existingMeals);

  if (semanticCheck.confidence > 85) {
    return { ...semanticCheck, method: 'browser_slm', cost: 0 };
  }

  // LAYER 2: Local rules for calories (FREE)
  const calorieEstimate = estimateCaloriesLocal(mealName, mealType, cuisine, taste);

  // LAYER 3: Only if confidence low, use Nutritionix (1000 free/day)
  if (semanticCheck.confidence < 70) {
    const nutritionData = await getCaloriesNutritionix(mealName);
    if (nutritionData) {
      return { ...nutritionData, isDuplicate: false, cost: 0 };
    }
  }

  // LAYER 4: Last resort - Claude Haiku (paid, but rarely needed)
  // Only ~1-5% of requests should reach here
  return { ...calorieEstimate, isDuplicate: false, cost: 0 };
}

async function semanticDuplicateCheck(mealName, existingMeals) {
  const newEmbed = await embedder(mealName, { pooling: 'mean', normalize: true });

  for (const meal of existingMeals) {
    const existingEmbed = await embedder(meal.name, { pooling: 'mean', normalize: true });
    const similarity = cosineSimilarity(newEmbed.data, existingEmbed.data);

    if (similarity > 0.9) {
      return {
        isDuplicate: true,
        matchedMeal: meal.name,
        confidence: Math.round(similarity * 100),
        calories: meal.calories
      };
    }
  }

  return { isDuplicate: false, confidence: 50 };
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

### Expected Costs with Hybrid Approach:
- **95% of requests**: $0 (browser SLM + local rules)
- **4% of requests**: $0 (Nutritionix free tier)
- **1% of requests**: ~$0.0002 each (Claude Haiku)

**Total for 1000 meals: ~$0.20**

---

## Quick Start Guide

1. **Install Transformers.js**
   ```bash
   npm install @xenova/transformers
   ```

2. **Test locally** (no API keys needed)

3. **Add Nutritionix** (optional, 1000 free/day)
   - Sign up: https://www.nutritionix.com/business/api
   - Get API key

4. **Add Claude Haiku** (optional, for edge cases)
   - Get key: https://console.anthropic.com/

5. **Deploy** with 99% free inference!
