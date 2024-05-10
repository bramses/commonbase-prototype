import { PrismaClient } from "@prisma/client";
import { generateEmbedding } from "./embeddings";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("process.env.OPENAI_API_KEY is not defined. Please set it.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.POSTGRES_URL is not defined. Please set it.");
}

const prisma = new PrismaClient();

async function main() {
  const embedding = await generateEmbedding("Hello, world!");
  const meta = { author: "John Doe", title: "Hello, world, the novel!" };
  const record = await prisma.schema.create({
    data: {
      data: "Hello, world!",
      metadata: meta,
      embeddingString: embedding.embedding.map((e) => e.toString()).join(","), // convert to string
    },
  });

  // Add the embedding
  await prisma.$executeRaw`
    UPDATE schema
    SET embedding = ${embedding.embedding}::vector
    WHERE id = ${record.id}`;

  // const allData = await prisma.schema.findMany()
  // console.dir(allData, { depth: null })

  const allData =
    await prisma.$queryRaw`SELECT id, data, metadata, embedding::text FROM schema`;
  console.dir(allData, { depth: null });
}

const addRecord = async (data: string, metadata: any) => {
  const embedding = await generateEmbedding(data);
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

addRecord("making my way downtown", { author: "Vanessa Carlton", title: "A Thousand Miles" });
addRecord("I'm blue da ba dee da ba daa", { author: "Eiffel 65", title: "Blue" });
addRecord("wake up! grab a brush and put a little makeup", { author: "System of a Down", title: "Chop Suey!" });

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
