import { ensureCsv, loadCache, appendToCsv } from "./csvCacheTool";
import { fetchCryptoPrice } from "./fetchCryptoPriceTool";

export async function getCryptoPrice(
  crypto?: string,
  date?: string,
): Promise<string> {
  try {
    if (!crypto) {
      return "Error: crypto name/symbol must be specified (e.g., bitcoin, ethereum, solana)";
    }
    const cryptoId = crypto.toLowerCase();

    let targetDate: string;
    if (!date || date.toLowerCase() === "today") {
      targetDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    } else {
      targetDate = date;
    }

    ensureCsv();
    const cache = loadCache();

    const dayCache = cache.get(targetDate);
    if (dayCache && dayCache.has(cryptoId)) {
      const cachedPrice = dayCache.get(cryptoId)!;
      console.log(
        `[CACHE] Retrieved ${cryptoId} price for ${targetDate} from CSV`,
      );
      return `${cryptoId} ${targetDate}: $${cachedPrice.toLocaleString()} (cached)`;
    }

    const price = await fetchCryptoPrice(cryptoId, date);
    if (price === undefined) {
      return `No data for ${cryptoId} on ${targetDate}`;
    }

    console.log(
      `[API] Fetched ${cryptoId} price for ${targetDate} from CoinGecko API`,
    );
    appendToCsv(targetDate, cryptoId, price);

    return `${cryptoId} ${targetDate}: $${price.toLocaleString()}`;
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}
