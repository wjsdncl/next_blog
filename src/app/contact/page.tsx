"use client";

import { Metadata } from "next";
import Form from "@/components/Form";

export default function Page() {
  return (
    <div className="mx-auto flex size-full flex-col justify-between py-10 tablet:w-tablet desktop:w-desktop">
      <div>
        <h1 className="text-4xl font-bold">Contact</h1>

        <div className="mt-8" />

        <Form onSubmit={() => {}}>
          <label className="text-lg font-bold">이름</label>
          <div className="mt-2" />
          <Form.Input label="name" />

          <div className="mt-4" />

          <label className="text-lg font-bold">이메일</label>
          <div className="mt-2" />
          <Form.Input label="email" />

          <div className="mt-4" />

          <label className="text-lg font-bold">제목</label>
          <div className="mt-2" />
          <Form.Input label="title" />

          <div className="mt-4" />

          <label className="text-lg font-bold">메시지</label>
          <div className="mt-2" />
          <Form.Textarea label="message" />

          <div className="mt-4" />

          <Form.Submit text="Send" />
        </Form>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    return {
      title: "블로그 게시글 목록 | JMJ's Devlog",
      description: "JMJ의 개발 블로그 게시글 목록입니다.",
      openGraph: {
        title: "블로그 게시글 목록 | JMJ's Devlog",
        description: "JMJ의 개발 블로그 게시글 목록입니다.",
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "블로그 포스트",
      description: "블로그 포스트를 찾을 수 없습니다.",
    };
  }
}
