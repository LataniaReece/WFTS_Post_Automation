import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import standaloneQuestionPrompt from "./prompts/standaloneQuestionPrompt.js";
import {
  answerPrompt,
  getPostTypeInstructions,
} from "./prompts/answerPrompt.js";
import retriever from "./retriever.js";
import combineDocuments from "./combineDocuments.js";

function getLlm(provider, model) {
  if (provider === "anthropic") {
    return new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      model,
    });
  }

  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model,
  });
}

function getModelCandidates() {
  const candidates = [];

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL) {
    candidates.push({
      provider: "anthropic",
      model: process.env.ANTHROPIC_MODEL,
    });
  }

  if (process.env.OPENAI_API_KEY) {
    candidates.push({
        provider: "openai",
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      });
  }

  if (candidates.length) {
    return candidates;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is set, but ANTHROPIC_MODEL is missing. Add ANTHROPIC_MODEL or keep OPENAI_API_KEY available as a fallback."
    );
  }

  throw new Error(
    "Missing model credentials. Set OPENAI_API_KEY, or set both ANTHROPIC_API_KEY and ANTHROPIC_MODEL."
  );
}

function stripCarouselLabel(line) {
  return line
    .replace(/^\s*[*_`#>\-\d.\s]*/g, "")
    .replace(
      /^(?:slide\s*\d+|last\s*slide)\s*(?:\([^)]+\))?\s*[:.\-]\s*/i,
      "",
    )
    .replace(/^(?:slide\s*\d+|last\s*slide)\s*(?:\([^)]+\))?\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function parseCarouselSlides(output) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(stripCarouselLabel)
    .filter(Boolean);
}

export async function generatePost({ question, postType, slideCount }) {
  const candidates = getModelCandidates();
  let rawOutput;
  let lastError;
  const normalizedSlideCount =
    postType === "carousel"
      ? Math.max(3, Math.min(10, Number.parseInt(slideCount, 10) || 6))
      : null;

  for (const candidate of candidates) {
    try {
      const llm = getLlm(candidate.provider, candidate.model);

      const standaloneQuestionChain = standaloneQuestionPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());

      const retrieverChain = RunnableSequence.from([
        (prevResult) => prevResult.standalone_question,
        retriever,
        combineDocuments,
      ]);

      const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

      const chain = RunnableSequence.from([
        {
          standalone_question: standaloneQuestionChain,
          original_input: new RunnablePassthrough(),
        },
        {
          context: retrieverChain,
          question: ({ original_input }) => original_input.question,
          postType: ({ original_input }) => original_input.postType,
          postTypeInstructions: ({ original_input }) =>
            original_input.postTypeInstructions,
        },
        answerChain,
      ]);

      rawOutput = await chain.invoke({
        question,
        postType,
        postTypeInstructions: getPostTypeInstructions(
          postType,
          normalizedSlideCount
        ),
      });

      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!rawOutput) {
    throw lastError;
  }

  if (postType === "carousel") {
    return {
      postType,
      slideCount: normalizedSlideCount,
      rawOutput,
      slides: parseCarouselSlides(rawOutput).slice(0, normalizedSlideCount),
    };
  }

  const standaloneText = rawOutput
    .replace(/^\s*1\.\s*/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
  return {
    postType,
    rawOutput,
    slides: [standaloneText],
  };
}
