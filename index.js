import "dotenv/config";

import readline from "readline";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import standaloneQuestionPrompt from "./utils/prompts/standaloneQuestionPrompt.js";
import answerPrompt from "./utils/prompts/answerPrompt.js";
import retriever from "./utils/retriever.js";
import combineDocuments from "./utils/combineDocuments.js";

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runChat() {
  try {
    // Display an introductory line before asking for user input
    console.log("\n");
    console.log("Welcome to the WFTS Motivational Post Generator!");
    console.log("\n");

    rl.question(
      "Please enter the theme for today's motivational post: ",
      async (input) => {
        const openAIApiKey = process.env.OPENAI_API_KEY;
        const llm = new ChatOpenAI({ openAIApiKey });

        // Chains
        const standaloneQuestionChain = standaloneQuestionPrompt
          .pipe(llm)
          .pipe(new StringOutputParser());

        const retrieverChain = RunnableSequence.from([
          (prevResult) => prevResult.standalone_question,
          retriever,
          combineDocuments,
        ]);

        const answerChain = answerPrompt
          .pipe(llm)
          .pipe(new StringOutputParser());

        const chain = RunnableSequence.from([
          {
            standalone_question: standaloneQuestionChain,
            original_input: new RunnablePassthrough(),
          },
          {
            context: retrieverChain,
            question: ({ original_input }) => original_input.question,
          },
          answerChain,
        ]);

        const response = await chain.invoke({
          question: input,
        });

        console.log("\n");
        console.log(`Here goes your post for: "${input}"`);
        console.log("\n");
        console.log(response);

        // Close the readline interface after processing is complete
        rl.close();
      }
    );
  } catch (error) {
    console.error(error);
  }
}

runChat();
