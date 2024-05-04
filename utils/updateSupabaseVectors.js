import text from "../quotes_samples.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import client from "./supabaseClient.js";

const quotes = text.split(/\d+\.\s/);
const filteredQuotes = quotes.filter((quote) => quote.trim() !== "");

const splitter = new RecursiveCharacterTextSplitter();
const output = await splitter.createDocuments(filteredQuotes);

await SupabaseVectorStore.fromDocuments(
  output,
  new OpenAIEmbeddings({ openAIApiKey }),
  {
    client,
  }
);
