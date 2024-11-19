import axios from "axios";
import { NextResponse } from "next/server";

const CLOVA_SUMMARY_URL = "https://naveropenapi.apigw.ntruss.com/text-summary/v1/summarize";
const CLOVA_CLIENT_ID = process.env.NCP_CLIENT_ID; // 네이버 클라우드 플랫폼 Client ID
const CLOVA_CLIENT_SECRET = process.env.NCP_CLIENT_SECRET; // 네이버 클라우드 플랫폼 Client Secret

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const response = await axios.post<{ summary: string }>(
      CLOVA_SUMMARY_URL,
      {
        document: {
          content: text,
        },
        option: {
          language: "ko", // 한국어 요약
          model: "general", // 일반 모델
          tone: 0, // 원문 그대로
          summaryCount: 3, // 요약 문장 수
        },
      },
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": CLOVA_CLIENT_ID,
          "X-NCP-APIGW-API-KEY": CLOVA_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("Error calling CLOVA Summary API:", error.message);
      return NextResponse.json({ error: error.message });
    } else {
      // eslint-disable-next-line no-console
      console.error("Error calling CLOVA Summary API:", error);
      return NextResponse.json({ error: "Failed to summarize text" }, { status: 500 });
    }
  }
}
