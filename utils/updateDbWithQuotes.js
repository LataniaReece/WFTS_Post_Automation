import "dotenv/config";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import client from "./supabaseClient.js";
import text from "../quotes_samples.js";

async function updateDbWithQuotes() {
  try {
    // Update quotes_samples, if you use the same quotes from last time there will be duplicates in your quotes.
    const quotes = text.split(/\d+\.\s/).filter((quote) => quote.trim() !== "");
    const splitter = new RecursiveCharacterTextSplitter();
    const output = await splitter.createDocuments(quotes);

    await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { client }
    );

    console.log("Quotes successfully updated in the database.");
  } catch (error) {
    console.error("Failed to update quotes:", error);
  }
}

updateDbWithQuotes();
