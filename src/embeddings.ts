import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "text-embedding-3-small";

const generateEmbedding = async (
  text: string,
  user = "default",
  model = MODEL
) => {
  const embedding = await openai.embeddings.create({
    model: model,
    input: text,
    encoding_format: "float",
    user: user,
  });

  // meta is a deep clone with embedding removed
  // copy the object and remove the embedding key
  type EmbeddingOptional = {
    [K in keyof typeof embedding]: K extends "data"
      ? Array<{
          [P in keyof (typeof embedding.data)[0]]: P extends "embedding"
            ? number[] | undefined
            : (typeof embedding.data)[0][P];
        }>
      : (typeof embedding)[K];
  };

  const embeddingData = embedding.data[0].embedding;

  const meta: EmbeddingOptional = { ...embedding };
  delete meta.data[0].embedding;

  return { embedding: embeddingData, meta: meta };
};

export { generateEmbedding };
