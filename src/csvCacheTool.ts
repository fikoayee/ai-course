import fs from "fs";
import path from "path";

const CSV_PATH = path.join(__dirname, "..", "crypto_prices.csv");

export function ensureCsv(): void {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, "date,crypto,price_usd\n");
  }
}

export function loadCache(): Map<string, Map<string, number>> {
  const cache = new Map<string, Map<string, number>>();
  if (!fs.existsSync(CSV_PATH)) return cache;
  const lines = fs.readFileSync(CSV_PATH, "utf-8").split("\n");
  for (const line of lines.slice(1)) {
    const [date, crypto, price] = line.split(",").map((s) => s.trim());
    if (date && crypto && price) {
      if (!cache.has(date)) {
        cache.set(date, new Map());
      }
      cache.get(date)!.set(crypto.toLowerCase(), Number(price));
    }
  }
  return cache;
}

export function appendToCsv(date: string, crypto: string, price: number): void {
  const line = `${date},${crypto},${price}\n`;
  fs.appendFileSync(CSV_PATH, line);
}
