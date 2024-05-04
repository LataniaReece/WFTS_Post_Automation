// Defines a template for generating answers that align with the style of a motivational Facebook page.
// The template takes context and a question, and constructs a motivational post idea.
import { PromptTemplate } from "@langchain/core/prompts";

const answerTemplate = `I have a motivational social media page, some examples of posts I've written so far can be found in the context. 
You are a writer with expertise in writing motivational content that is unique. Given my question and using my writing style and word choice, give me some more post ideas. Remember to channel the style that 
I already show in the context that I provided. Always speak as if I am a motivational brand and you are a writer on my team coming up with ideas. Each post idea should be numbered sequentially, starting from 1, ensuring that every idea, including the last, is listed with a number in front. 
context: {context}
question: {question}
answer:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

export default answerPrompt;
