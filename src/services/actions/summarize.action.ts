/**
 * Google Gemini 텍스트 요약 (Server Action)
 *
 * Markdown 형식의 입력 텍스트를 한국어 3문장으로 요약.
 * 줄바꿈 구분 출력을 요청하여 후처리를 단순화.
 */
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT = `You are a summarizer. The input is in Markdown format.
Ignore all Markdown syntax (headings, links, images, code blocks, etc.) and focus only on the meaning.
Output exactly 3 sentences in Korean, one per line.
Do not add numbers, bullets, or any prefix.
Each sentence must end with a period.
Do not include any other text.

Text:
`;

const textSummarizer = async (description: string): Promise<string[] | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: PROMPT + description,
    });

    const text = response.text;
    if (!text) return undefined;

    const sentences = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);

    if (sentences.length < 3) {
      // eslint-disable-next-line no-console
      console.warn(`API가 ${sentences.length}개의 문장만 반환했습니다. 3개가 필요합니다.`);
    }

    return sentences;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("텍스트 요약 실패:", error);
    return undefined;
  }
};

export default textSummarizer;
