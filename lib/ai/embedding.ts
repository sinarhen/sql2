import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/drizzle/schema';

const embeddingModel = openai.embedding('text-embedding-3-small');

// Generate chunks from text - split by sentences for this simple implementation
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i.trim() !== '')
    .map(i => i.trim() + '.');
};

// Generate embeddings for multiple chunks
export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

// Generate embedding for a single string
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ').trim();
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  
  return embedding;
};

// Find relevant content based on similarity to the query
export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedding = await generateEmbedding(userQuery);
  
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedding,
  )})`;
  
  const similarContents = await db
    .select({ 
      content: embeddings.content, 
      similarity 
    })
    .from(embeddings)
    .where(gt(similarity, 0.5))  // Only return results with more than 50% similarity
    .orderBy(desc(similarity))
    .limit(4);  // Get top 4 most similar chunks
  
  return similarContents;
}; 