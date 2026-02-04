import fetch from "node-fetch";

export async function fetchCryptoPrice(
  crypto?: string,
  date?: string,
): Promise<string> {
  try {
    if (!crypto) {
      return "Error: crypto name/symbol must be specified (e.g., bitcoin, ethereum, solana)";
    }
    const cryptoId = crypto.toLowerCase();

    if (!date || date.toLowerCase() === "today") {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
      const resp = await fetch(url);

      const data = (await resp.json()) as Record<string, { usd: number }>;
      const price = data[cryptoId]?.usd;
      return price
        ? `${cryptoId} current: $${price.toLocaleString()}`
        : `No data for ${cryptoId}`;
    }

    // expects DD-MM-YYYY
    const [year, month, day] = date.split("-");
    const dateFormatted = `${day}-${month}-${year}`;
    const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/history?date=${dateFormatted}`;
    const resp = await fetch(url);

    const data = (await resp.json()) as {
      market_data?: { current_price?: { usd: number } };
    };
    const price = data.market_data?.current_price?.usd;
    return price
      ? `${cryptoId} ${date}: $${price.toLocaleString()}`
      : `No data for ${cryptoId} on ${date}`;
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}
