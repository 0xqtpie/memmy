#! /usr/bin/env node

import { input } from "@inquirer/prompts";
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { recall } from "./lib/recall.js";
import { recordAudio } from "./lib/record.js";
import {
  generateAndStoreEmbedding,
  initStore,
  purge,
  storeExists,
} from "./lib/store.js";
import { transcribeAudio, whisperInit } from "./lib/transcribe.js";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init(skipWhisper: boolean = false) {
  console.log("");
  if (!skipWhisper) {
    await whisperInit();
  }
  await initStore();
  console.log("");
}

async function recallPrompt() {
  const query = await input({
    message: "Enter a query (pass nothing to exit):",
  });
  if (query === "") {
    console.log("Goodbye!");
    return;
  }
  await recall(query);
  await recallPrompt();
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName("memmy")
    .command(
      "remember",
      "Record, transcribe, and store information",
      (yargs) => {
        return yargs.option("save-audio", {
          alias: "s",
          type: "string",
          description: "Optional filepath to save the audio file",
          default: undefined,
        });
      }
    )
    .command("recall", "Recall information")
    .command("purge", "Purge the vector database")
    .demandCommand(1, "You must provide a valid command")
    .help()
    .alias("help", "h").argv;

  try {
    if (argv._[0] === "remember") {
      await init();
      const { file, save } = await recordAudio(
        argv.saveAudio as string | undefined
      );
      const transcription = await transcribeAudio(file);
      console.log("Transcription output:", transcription);
      await generateAndStoreEmbedding(transcription);
    } else if (argv._[0] === "recall") {
      if (!(await storeExists())) {
        console.log(
          "No vector database found. Please run `memmy remember` first."
        );
      }
      await init(true);
      await recallPrompt();
    } else if (argv._[0] === "purge") {
      await purge();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
