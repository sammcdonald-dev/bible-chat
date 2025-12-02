// scripts/embed_bible_gemini.ts
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

//Prevents non-null assertion
const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error(
    'GOOGLE_GENERATIVE_AI_API_KEY environment variable is required',
  );
}

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is required');
}

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY);

// --- CONFIG ---
const BIBLE_PATH = path.resolve('./bible.json');
const MODEL_ID = process.env.MODEL_ID || 'text-embedding-004';
const EMBEDDING_DIM = Number.parseInt(process.env.EMBEDDING_DIM || '1536', 10);
const db = new Client({
  connectionString: POSTGRES_URL,
});

async function embedBible() {
  const db = new Client({
    connectionString: POSTGRES_URL,
  });
  await db.connect();

  const data = JSON.parse(fs.readFileSync(BIBLE_PATH, 'utf-8'));
  console.log(`📖 Loaded ${data.length} verses.`);

  for (const verse of data) {
    const { book, chapter, verse: verseNum, text } = verse;

    // Skip if already embedded
    const existing = await db.query(
      `SELECT id FROM bible_verses WHERE book=$1 AND chapter=$2 AND verse=$3`,
      [book, chapter, verseNum],
    );

    //Assert non-null
    const existingCount = existing?.rowCount ?? 0;
    if (existingCount > 0) {
      console.log(`⏩ Skipping ${book} ${chapter}:${verseNum} (already in DB)`);
      continue;
    }

    // Generate embedding from Gemini
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

    const result = await model.embedContent({
      content: {
        role: 'user',
        parts: [{ text }],
      },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    const embedding = result.embedding?.values;
    if (!embedding) {
      console.warn(
        `⚠️ No embedding returned for ${book} ${chapter}:${verseNum}`,
      );
      continue;
    }

    const vector_literal = `[${embedding.join(',')}]`;
    console.log('Sending to DB:', JSON.stringify(embedding).slice(0, 200));
    // Store verse + embedding in DB
    await db.query(
      `INSERT INTO bible_verses (book, chapter, verse, text, embedding)
       VALUES ($1, $2, $3, $4, $5)`,
      [book, chapter, verseNum, text, vector_literal],
    );

    console.log(`✅ Inserted ${book} ${chapter}:${verseNum}`);
  }

  await db.end();
  console.log('Done embedding all verses!');
}

embedBible().catch((err) => {
  console.error('Error embedding Bible:', err);
});
