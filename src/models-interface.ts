import { Prisma } from "@prisma/client";

export type ModelsList = {
    [key: string]: Prisma.schemaDelegate
}