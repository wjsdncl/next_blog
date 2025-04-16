"use server";

import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY, // 환경 변수에 API 키 저장
});

const TextSummarizer = async (description: string): Promise<string[] | undefined> => {
  try {
    const response = await cohere.chat({
      model: "command-r",
      messages: [
        {
          role: "user",
          content: `Please summarize the following text into exactly 3 sentences. Each sentence should be independent, logically complete, and convey distinct key points from the text. Please provide the summary in Korean: ${description}`,
        },
      ],
      returnPrompt: false,
    });

    if (response.message) {
      // 텍스트 추출
      const text = response.message.content?.map((item) => item.text).join("");

      // 줄바꿈으로 나누고 bullet point 제거
      const cleanedSummary = text
        ?.split("\n")
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);

      return cleanedSummary;
    }

    return undefined;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error summarizing text with chat API:", error);
    return undefined;
  }
};

export default TextSummarizer;
