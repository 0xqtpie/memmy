import axios from "axios";
import fs from "fs";
import { LocalIndex } from "vectra";

let index: LocalIndex;

async function generateEmbedding(text: string) {
  const response = await axios.post("http://localhost:11434/api/embeddings", {
    model: process.env.EMBEDDING_MODEL,
    prompt: text,
  });
  return response.data.embedding;
}

async function storeEmbedding(embedding: number[], transcription: string) {
  await index.insertItem({
    vector: embedding,
    metadata: { text: transcription },
  });
}

async function retrieveEmbedding(query: string) {
  const embedding = await generateEmbedding(query);
  const results = await index.queryItems(embedding, 3);
  return results;
}

async function generateAndStoreEmbedding(text: string) {
  const embedding = await generateEmbedding(text);
  await storeEmbedding(embedding, text);
}

async function initStore() {
  const dbPath = process.env.VECTOR_DB_PATH;
  if (!dbPath) {
    throw new Error("VECTOR_DB_PATH is not set");
  }
  index = new LocalIndex(dbPath);
  if (!(await index.isIndexCreated())) {
    console.log("Creating vector database...");
    await index.createIndex();
    console.log("Vector database created.");
  }
  console.log("Vector database loaded.");
}

async function storeExists() {
  const dbPath = process.env.VECTOR_DB_PATH;
  if (!dbPath) {
    throw new Error("VECTOR_DB_PATH is not set");
  }
  return fs.existsSync(dbPath);
}

async function purge() {
  const dbPath = process.env.VECTOR_DB_PATH;
  if (!dbPath) {
    throw new Error("VECTOR_DB_PATH is not set");
  }
  fs.rmSync(dbPath, { recursive: true, force: true });
  console.log("Vector database purged");
}

export {
  generateAndStoreEmbedding,
  initStore,
  purge,
  retrieveEmbedding,
  storeExists,
};
