import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat() {
  console.log("Claude Chat");

  while (true) {
    const input = await new Promise<string>((resolve) =>
      terminal.question("You: ", resolve),
    );

    if (input.toLowerCase() === "exit") break;

    console.log("Claude is thinking...");

    const response = query({
      prompt: input,
    });

    for await (const message of response) {
      if (message.type === "assistant") {
        const content = message.message.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "text") {
              console.log("Claude:", block.text);
            }
          }
        }
      }
    }
  }

  terminal.close();
}

chat();
