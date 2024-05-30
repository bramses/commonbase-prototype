import express from "express";
import { addRecord, queryRecord, shutdown, randomRecords } from ".";
import CsvReadableStream from "csv-reader";
import { createReadStream } from "fs";
import multer from "multer";

interface CsvRow {
  data: string;
  metadata: any;
}

const upload = multer({ dest: "uploads/" }); // specify the folder to save uploaded files

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  // get root url from env var or use default
  const ROOT_URL = process.env.ROOT_URL || "http://localhost:3550";
  res.send(`
  <form action="${ROOT_URL}/upload" method="post" enctype="multipart/form-data">
  <input type="text" name="tableName" placeholder="Table Name">
  <input type="file" name="file" accept=".csv">
  <button type="submit">Upload</button>`);
});

const readCSV = async (filepath: string): Promise<CsvRow[]> => {
  let inputStream = createReadStream(filepath, "utf8");
  const rows: CsvRow[] = [];

  return new Promise((resolve) => {
    inputStream
      .pipe(
        new CsvReadableStream({
          trim: true,
          skipEmptyLines: true,
          skipHeader: true,
        })
      )
      .on("data", function (row: any) {
        console.log("A row arrived: ", row);
        let metadata = {};
        // split metadata each line by ; and each key value by :
        if (row[1]) {
          metadata = row[1].split(";").reduce((acc: any, item: string) => {
            const [key, value] = item.split(":");
            acc[key.trim()] = value.trim();
            return acc;
          }, {});
        }
        rows.push({
          data: row[0],
          metadata: metadata,
        });
      })
      .on("end", () => resolve(rows));
  });
};

// upload csv file
app.post("/upload", upload.single("file"), async (req, res) => {
  const tableName = req.body.tableName;
  const file = req.file; // multer adds a 'file' object to the request
  try {
    if (!file) {
      throw new Error("No file uploaded");
    }
    const csvData = await readCSV(file.path);

    for (const { data, metadata } of csvData) {
      console.log("Adding record:", data);
      const record = await addRecord(data, metadata, false, tableName);
      console.log("Record added");
    }
    res.status(200).send({ message: "Upload successful" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// add record with json body { data, metadata, embedMeta }
app.post("/record", async (req, res) => {
  const data = req.body.data;
  const metadata = req.body.metadata;
  const embedMeta = req.body.embedMeta;
  const tableName = req.body.tableName;
  try {
    const result = await addRecord(data, metadata, embedMeta, tableName);
    res.status(200).json({ result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/random", async (req, res) => {
  const n = req.body.n;
  const table = req.body.table;
  try {
    const result = await randomRecords(n, table);
    res.send(result);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// query record with json body { query , limit }
app.post("/query", async (req, res) => {
  const query = req.body.query;
  const limit = req.body.limit;
  const table = req.body.table;
  console.log(req.body);
  const filter = JSON.parse(req.body.filter);
  try {
    const result = await queryRecord(query, limit, filter, table);
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
