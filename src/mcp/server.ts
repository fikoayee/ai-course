#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getCryptoPrice } from "../cryptoPriceTool.js";
import { compareCryptoPrices } from "../cryptoComparisonTool.js";

const server = new Server(
  {
    name: "crypto-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_crypto_price",
      description:
        "Get the current or historical USD price of a cryptocurrency. Supports major cryptocurrencies like bitcoin, ethereum, solana, etc.",
      inputSchema: {
        type: "object",
        properties: {
          crypto: {
            type: "string",
            description:
              "Cryptocurrency name or symbol (e.g., bitcoin, ethereum, solana)",
          },
          date: {
            type: "string",
            description:
              "Date in YYYY-MM-DD format, or 'today' for current price. Defaults to today if not specified.",
          },
        },
        required: ["crypto"],
      },
    },
    {
      name: "compare_crypto_prices",
      description:
        "Compare cryptocurrency prices between two dates and calculate the price change, absolute difference, and percentage change.",
      inputSchema: {
        type: "object",
        properties: {
          crypto: {
            type: "string",
            description:
              "Cryptocurrency name or symbol (e.g., bitcoin, ethereum, solana)",
          },
          startDate: {
            type: "string",
            description: "Start date in YYYY-MM-DD format",
          },
          endDate: {
            type: "string",
            description: "End date in YYYY-MM-DD format",
          },
        },
        required: ["crypto", "startDate", "endDate"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_crypto_price") {
      const { crypto, date } = args as { crypto?: string; date?: string };
      const result = await getCryptoPrice(crypto, date);
      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "compare_crypto_prices") {
      const { crypto, startDate, endDate } = args as {
        crypto?: string;
        startDate?: string;
        endDate?: string;
      };
      const result = await compareCryptoPrices(crypto, startDate, endDate);
      return {
        content: [{ type: "text", text: result }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
