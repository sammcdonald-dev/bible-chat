import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Replace xai usage with Gemini
        'chat-model': async (prompt: string) => {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          return result.response.text();
        },
        'chat-model-reasoning': async (prompt: string) => {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          // Optionally apply reasoning middleware here if needed
          return result.response.text();
        },
        'title-model': async (prompt: string) => {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          return result.response.text();
        },
        'artifact-model': async (prompt: string) => {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          return result.response.text();
        },
      },
      // Gemini does not support image generation yet, so remove or update imageModels accordingly
      imageModels: {
        // If Gemini supports image models in the future, add here
      },
    });
