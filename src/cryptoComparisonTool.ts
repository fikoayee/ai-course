import { getCryptoPrice } from "./cryptoPriceTool";

export async function compareCryptoPrices(
  crypto?: string,
  startDate?: string,
  endDate?: string,
): Promise<string> {
  try {
    const startResult = await getCryptoPrice(crypto, startDate);
    const endResult = await getCryptoPrice(crypto, endDate);

    const startMatch = startResult.match(/\$([0-9,]+)/);
    const endMatch = endResult.match(/\$([0-9,]+)/);

    if (!startMatch || !endMatch) {
      return `Error: could not retrieve prices for ${crypto} on the given dates`;
    }

    const startPrice = parseFloat(startMatch[1].replace(/,/g, ""));
    const endPrice = parseFloat(endMatch[1].replace(/,/g, ""));

    const change = endPrice - startPrice;
    const percentChange = (change / startPrice) * 100;

    const sign = percentChange >= 0 ? "+" : "";

    return `${crypto} from ${startDate} to ${endDate}: $${startPrice.toLocaleString()} → $${endPrice.toLocaleString()} (${sign}$${Math.abs(change).toLocaleString()}, ${sign}${percentChange.toFixed(2)}%)`;
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}
