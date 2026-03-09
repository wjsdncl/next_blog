/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import Form from "@/components/ui/Form";

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
