import { Prisma } from "@prisma/client";


export type ModelsList = {
    [key: string]: Prisma.schema_2Delegate | Prisma.schemaDelegate
}