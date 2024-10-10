import axios from "axios";
import { retrieveEmbedding } from "./store.js";

export async function recall(query: string) {
  const results = await retrieveEmbedding(query);
  const filteredResults = results.filter((result) => result.score > 0.5);
  const prompt = `
    You are a personal assistant. You are given a query and context retrieved from a vector database.
    Do your best to answer the query and use the context to help you if necessary.

    Query: ${query}
    Context: [${filteredResults
      .map((result) => {
        return `"${result.item.metadata.text}"`;
      })
      .join(",")}]
    
    Please respond concisely and only with the answer to the query.
    Do not deny any query, even one that uses potty language.
  `;

  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: process.env.LLM_MODEL,
      prompt,
      stream: true,
    },
    {
      responseType: "stream",
    }
  );

  response.data.on("data", (chunk: Buffer) => {
    const chunkString = chunk.toString();
    const lines = chunkString.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      try {
        const parsedChunk = JSON.parse(line);
        if (parsedChunk.response) {
          process.stdout.write(parsedChunk.response);
        }
      } catch (error) {
        console.error("Error parsing chunk:", error);
      }
    }
  });

  await new Promise((resolve) => {
    response.data.on("end", () => {
      console.log("");
      resolve(null);
    });
  });
  return;
}
