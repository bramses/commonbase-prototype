import { PrismaClient } from "@prisma/client";
import { generateEmbedding } from "./embeddings";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("process.env.OPENAI_API_KEY is not defined. Please set it.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.POSTGRES_URL is not defined. Please set it.");
}

const prisma = new PrismaClient();

const addRecord = async (data: string, metadata: any, embedMeta: boolean = false) => {
  console.log("Adding record:", data);
  // if embedMeta is true, we will embed the metadata as well
  let embedData = data;
  if (embedMeta) {
    // merge the metadata with the data
    embedData = JSON.stringify({ data, metadata });
  }
  const embedding = await generateEmbedding(embedData);
  const record = await prisma.schema.create({
    data: {
      data: data,
      metadata: metadata,
      embeddingString: embedding.embedding.map((e) => e.toString()).join(","),
    },
  });

  await prisma.$executeRaw`
    UPDATE schema
    SET embedding = ${embedding.embedding}::vector
    WHERE id = ${record.id}`;

  return record;
}

async function queryRecord(query: string, limit: number = 3) {
  console.log("Querying for:", query);
  const embedding = await generateEmbedding(query);

  const results = await prisma.$queryRaw`
    SELECT id, data, metadata, 1 - (embedding <=> ${embedding.embedding}::vector) AS cosine_similarity
    FROM schema
    ORDER BY cosine_similarity DESC
    LIMIT ${limit}`;
  

  return results;
}

// a function to handle shutdown
async function shutdown(err: any) {
  if (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

async function main(query: string = "") {
  const records = await queryRecord(query, 3);
  console.dir(records, { depth: null });
  await shutdown(null);
}

// main(`personal library science`)


export { addRecord, queryRecord, shutdown };
