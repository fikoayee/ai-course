import fetch from "node-fetch";

export async function fetchCryptoPrice(
  crypto: string,
  date?: string,
): Promise<number | undefined> {
  let price: number | undefined;
  if (!date || date.toLowerCase() === "today") {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return undefined;
    }
    const data = (await resp.json()) as Record<string, { usd: number }>;
    price = data[crypto]?.usd;
  } else {
    const [year, month, day] = date.split("-"); // DD-MM-YYYY
    const dateFormatted = `${day}-${month}-${year}`;
    const url = `https://api.coingecko.com/api/v3/coins/${crypto}/history?date=${dateFormatted}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return undefined;
    }
    const data = (await resp.json()) as {
      market_data?: { current_price?: { usd: number } };
    };
    price = data.market_data?.current_price?.usd;
  }
  return price;
}
