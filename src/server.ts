import express from "express";
import { addRecord, queryRecord, shutdown } from ".";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// add record with json body { data, metadata, embedMeta }
app.post("/record", async (req, res) => {
  const data = req.body.data;
  const metadata = req.body.metadata;
  const embedMeta = req.body.embedMeta;
  const tableName = req.body.tableName;
  try {
    const result = await addRecord(data, metadata, embedMeta, tableName);
    res.status(200).send(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// query record with json body { query , limit }
app.post("/query", async (req, res) => {
  const query = req.body.query;
  const limit = req.body.limit;
  const table = req.body.table;
  const filter = {"class": "1999"}
  try {
    const result = await queryRecord(query, limit, filter, table);
    console.log(result);
    res.send(result);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});


// TODO
// list tables
// create table
// switch table
// read and write access to table

app.listen(3550, () => {
  console.log("Server is running on http://localhost:3550");
});

// on server shutdown, we will close the prisma connection
process.on("SIGINT", async () => {
  await shutdown(null);
  process.exit();
});