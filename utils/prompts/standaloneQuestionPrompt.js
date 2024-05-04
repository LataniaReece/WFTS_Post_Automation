// This script serves as the foundational chain for initializing an OpenAI Chat model with LangChain, critical for converting questions into a standalone format.

import { PromptTemplate } from "@langchain/core/prompts";

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

export default standaloneQuestionPrompt;
