// lib/ai/providers.ts
import { customProvider, wrapLanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';
import { middleware } from '../../middleware';

// Define the allowed model IDs
export type LanguageModelId =
  | 'chat-model'
  | 'chat-model-reasoning'
  | 'title-model'
  | 'artifact-model';

// Test mode: use mock models
// ... existing code ...
export const myProvider = (() => {
  if (isTestEnvironment) {
    const base = customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    });

    return {
      ...base,
      languageModel: (id: LanguageModelId) => base.languageModel(id),
    };
  }

  // ✅ Production mode with Gemini
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const base = customProvider({
    languageModels: {
      'chat-model': wrapLanguageModel({
        model: google.chat('gemini-2.5-flash'),
        middleware: [],
      }),
      'chat-model-reasoning': wrapLanguageModel({
        model: google.chat('gemini-2.5-flash'),
        middleware: [],
      }),
      'title-model': wrapLanguageModel({
        model: google.chat('gemini-2.5-flash'),
        middleware: [],
      }),
      'artifact-model': wrapLanguageModel({
        model: google.chat('gemini-2.5-flash'),
        middleware: [],
      }),
    },
    imageModels: {},
  });

  return {
    ...base,
    languageModel: (id: LanguageModelId) => base.languageModel(id),
  };
})();
