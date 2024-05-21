/*
 * Import data contained in a csv file.
 * To run the script, execute `npm run import`.
 * It will ask for the path to the csv file, import it to the database and then
 * request the user to enter any kind of transformations they want.
 */

import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { createReadStream } from "fs";
import CsvReadableStream from "csv-reader";
import { addRecord, listTables, cloneTable } from "../../src/index";

interface CsvRow {
  data: string;
  metadata: any;
}

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

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  const tableName = await rl.question("Enter table name: ");
  console.log(`Table name: ${tableName}`);

  // Check if table exists
  const tables = await listTables();
  if (tables.includes(tableName)) {
    console.log("Table already exists -- appending to existing table");
  }

  // Add records
  const filepath = await rl.question("Enter path to CSV file: ");
  const csvData = await readCSV(filepath);

  for (const { data, metadata } of csvData) {
    await addRecord(data, metadata, false, tableName);
  }
  
  // alert user that the import is complete
  console.log("Import complete");
  // exit the process
  process.exit(0);

  // Store transformations
  // const noOfTransformations = parseInt(
  //   await rl.question("Enter number of transformations to support (integer): ")
  // );
  // const transformations: string[] = [];
  // for (let i = 0; i < noOfTransformations; i++) {
  //   const t = await rl.question(`Transformation ${i + 1}: `);
  //   transformations.push(t);
  // }

  // console.log(transformations);
  return;
}

main();
