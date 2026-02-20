"use server";

import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

const textSummarizer = async (description: string): Promise<string[] | undefined> => {
  try {
    const response = await cohere.chat({
      model: "command-r",
      messages: [
        {
          role: "user",
          content: `Please summarize the following text into exactly 3 sentences. Each sentence should be independent, logically complete, and convey distinct key points from the text. Please ensure that each sentence ends with a period. Please provide the summary in Korean: ${description}`,
        },
      ],
      returnPrompt: false,
    });

    if (response.message) {
      const text = response.message.content?.map((item) => item.text).join("");
      const preprocessed = text?.replace(/([A-Za-z]+)\.([A-Za-z]+)/g, "$1@$2");
      const sentences = preprocessed
        ?.split(/\.(?=\s|$)/)
        .map((sentence) => {
          return sentence
            .replace(/([A-Za-z]+)@([A-Za-z]+)/g, "$1.$2")
            .replace(/^-\s*/, "")
            .trim();
        })
        .filter((sentence) => sentence.length > 0);

      const cleanedSummary = sentences?.slice(0, 3).map((sentence) => sentence + ".");

      if (cleanedSummary && cleanedSummary.length < 3) {
        console.warn(`API가 ${cleanedSummary.length}개의 문장만 반환했습니다. 3개가 필요합니다.`);
      }

      return cleanedSummary;
    }

    return undefined;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error summarizing text with chat API:", error);
    return undefined;
  }
};

export default textSummarizer;
