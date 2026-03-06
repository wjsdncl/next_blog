/**
 * Google Gemini 텍스트 요약 (Server Action)
 *
 * 입력 텍스트를 한국어 3문장으로 요약.
 * 문장 분리 시 영문 약어(e.g. Next.js)의 마침표를 보존하기 위해
 * 임시로 @ 치환 후 분리하는 전처리 적용.
 */
"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const textSummarizer = async (description: string): Promise<string[] | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please summarize the following text into exactly 3 sentences. Each sentence should be independent, logically complete, and convey distinct key points from the text. Please ensure that each sentence ends with a period. Please provide the summary in Korean: ${description}`,
    });

    const text = response.text;
    if (!text) return undefined;

    const preprocessed = text.replace(/([A-Za-z]+)\.([A-Za-z]+)/g, "$1@$2");
    const sentences = preprocessed
      .split(/\.(?=\s|$)/)
      .map((sentence) => {
        return sentence
          .replace(/([A-Za-z]+)@([A-Za-z]+)/g, "$1.$2")
          .replace(/^-\s*/, "")
          .trim();
      })
      .filter((sentence) => sentence.length > 0);

    const cleanedSummary = sentences.slice(0, 3).map((sentence) => sentence + ".");

    if (cleanedSummary.length < 3) {
      // eslint-disable-next-line no-console
      console.warn(`API가 ${cleanedSummary.length}개의 문장만 반환했습니다. 3개가 필요합니다.`);
    }

    return cleanedSummary;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("텍스트 요약 실패:", error);
    return undefined;
  }
};

export default textSummarizer;
