import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";

const MODELS = {
  flash: "gemini-2.0-flash",
  flashLite: "gemini-2.0-flash-lite",
  pro: "gemini-1.5-pro",
} as const;

export type ModelTier = keyof typeof MODELS;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
}

export interface GeminiResponse {
  text: string;
  usage: TokenUsage;
  model: string;
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in Settings.");
  }
  return new GoogleGenerativeAI(apiKey);
}

function selectModel(tier: ModelTier): string {
  return MODELS[tier];
}

export function estimateCost(usage: TokenUsage, modelName: string): number {
  // Pricing per 1M tokens (approximate, as of 2025)
  const pricing: Record<string, { input: number; output: number; cached: number }> = {
    "gemini-2.0-flash": { input: 0.075, output: 0.30, cached: 0.01875 },
    "gemini-2.0-flash-lite": { input: 0.0375, output: 0.15, cached: 0.01 },
    "gemini-1.5-pro": { input: 1.25, output: 5.0, cached: 0.3125 },
  };
  const p = pricing[modelName] || pricing["gemini-2.0-flash"];
  return (
    (usage.inputTokens / 1_000_000) * p.input +
    (usage.outputTokens / 1_000_000) * p.output +
    (usage.cachedTokens / 1_000_000) * p.cached
  );
}

export async function generateContent(
  prompt: string,
  tier: ModelTier = "flash",
  systemInstruction?: string,
  config?: Partial<GenerationConfig>
): Promise<GeminiResponse> {
  const client = getClient();
  const modelName = selectModel(tier);
  const model: GenerativeModel = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens: 8192,
      ...config,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const usageMetadata = response.usageMetadata;

  const usage: TokenUsage = {
    inputTokens: usageMetadata?.promptTokenCount ?? 0,
    outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
    cachedTokens: usageMetadata?.cachedContentTokenCount ?? 0,
    totalTokens: usageMetadata?.totalTokenCount ?? 0,
  };

  return { text, usage, model: modelName };
}

export async function generateContentStream(
  prompt: string,
  tier: ModelTier = "flash",
  systemInstruction?: string,
  onChunk?: (chunk: string) => void
): Promise<GeminiResponse> {
  const client = getClient();
  const modelName = selectModel(tier);
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
  });

  const result = await model.generateContentStream(prompt);
  let fullText = "";
  let lastUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, cachedTokens: 0, totalTokens: 0 };

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onChunk) onChunk(chunkText);
    if (chunk.usageMetadata) {
      lastUsage = {
        inputTokens: chunk.usageMetadata.promptTokenCount ?? 0,
        outputTokens: chunk.usageMetadata.candidatesTokenCount ?? 0,
        cachedTokens: chunk.usageMetadata.cachedContentTokenCount ?? 0,
        totalTokens: chunk.usageMetadata.totalTokenCount ?? 0,
      };
    }
  }

  // Final usage from aggregated response
  const finalResponse = await result.response;
  if (finalResponse.usageMetadata) {
    lastUsage = {
      inputTokens: finalResponse.usageMetadata.promptTokenCount ?? 0,
      outputTokens: finalResponse.usageMetadata.candidatesTokenCount ?? 0,
      cachedTokens: finalResponse.usageMetadata.cachedContentTokenCount ?? 0,
      totalTokens: finalResponse.usageMetadata.totalTokenCount ?? 0,
    };
  }

  return { text: fullText, usage: lastUsage, model: modelName };
}

export function routeModel(taskComplexity: "simple" | "medium" | "complex"): ModelTier {
  switch (taskComplexity) {
    case "simple": return "flashLite";
    case "medium": return "flash";
    case "complex": return "pro";
  }
}
