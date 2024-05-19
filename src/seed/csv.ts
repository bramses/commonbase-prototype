import { createInterface } from 'readline/promises';
import { stdin, stdout } from 'process';
import { createReadStream } from 'fs';
import CsvReadableStream from 'csv-reader';
import { addRecord } from '../../src/index';

interface CsvRow {
  data: string;
  metadata: any;
}

const readCSV = async (filepath: string): Promise<CsvRow[]> => {
  let inputStream = createReadStream(filepath, 'utf8');
  const rows: CsvRow[] = []

  return new Promise((resolve) => {
    inputStream
      .pipe(new CsvReadableStream({
        trim: true,
        skipEmptyLines: true,
        skipHeader: true,
      }))
      .on('data', function (row: any) {
        rows.push({
          data: row[0],
          metadata: JSON.parse(row[1]),
        })
      })
      .on('end', () => resolve(rows));
  })
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })

  // Add records
  const filepath = await rl.question('Enter path to CSV file: ')
  const csvData = await readCSV(filepath)

  for (const { data, metadata } of csvData) {
    await addRecord(data, metadata, true)
  }
  return
}

main()
