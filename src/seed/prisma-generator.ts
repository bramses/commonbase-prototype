const fs = require('fs');
const { execSync } = require('child_process');

function addModel(tableName: string) {
  const schemaPath = './prisma/schema.prisma';
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const newModel = `
model ${tableName} {
  id              String   @id @default(cuid())
  data            String
  metadata        Json
  embedding       Unsupported("vector(1536)")?
  embeddingString String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
`;

  fs.writeFileSync(schemaPath, schema + newModel);
}

function generatePrismaClient() {
  execSync('npx prisma generate', { stdio: 'inherit' });
}

const tableName = process.argv[2];
if (!tableName) {
  console.error('Please provide a table name');
  process.exit(1);
}

addModel(tableName);
generatePrismaClient();