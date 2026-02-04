import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";
import { fetchCryptoPrice } from "./fetchCryptoPriceTool";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat(): Promise<void> {
  console.log("Claude Chat");

  const messages: Anthropic.Messages.MessageParam[] = [];

  while (true) {
    const input = await new Promise<string>((resolve) =>
      terminal.question("You: ", resolve),
    );

    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages,
        tools: [
          {
            name: "get_crypto_price",
            description: "Get crypto USD price",
            input_schema: {
              type: "object",
              properties: {
                crypto: {
                  type: "string",
                  description:
                    "Crypto name or symbol (e.g., bitcoin, ethereum, solana)",
                },
                date: { type: "string", description: "YYYY-MM-DD or 'today'" },
              },
              required: [],
            },
          },
        ],
        tool_choice: { type: "auto" },
      });

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use",
      );

      if (toolUseBlocks.length > 0) {
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
        for (const block of toolUseBlocks) {
          if (block.name === "get_crypto_price") {
            const args = block.input as { crypto?: string; date?: string };
            let result: string;
            try {
              result = await fetchCryptoPrice(args.crypto, args.date);
            } catch (error) {
              result = `Tool error: ${(error as Error).message}`;
            }
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
        const followUp = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages,
          tools: [
            {
              name: "get_crypto_price",
              description: "Get crypto USD price",
              input_schema: {
                type: "object",
                properties: {
                  crypto: {
                    type: "string",
                    description:
                      "Crypto name or symbol (e.g., bitcoin, ethereum, solana)",
                  },
                  date: {
                    type: "string",
                    description: "YYYY-MM-DD or 'today'",
                  },
                },
                required: [],
              },
            },
          ],
          tool_choice: { type: "auto" },
        });
        console.log();
        for (const block of followUp.content) {
          if (block.type === "text") {
            process.stdout.write(block.text);
          }
        }
        console.log();
        messages.push({ role: "assistant", content: followUp.content });
        continue;
      }

      for (const block of response.content) {
        if (block.type === "text") {
          process.stdout.write("Claude: " + block.text);
        }
      }
      console.log();

      messages.push({ role: "assistant", content: response.content });
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  }

  terminal.close();
}

chat();
