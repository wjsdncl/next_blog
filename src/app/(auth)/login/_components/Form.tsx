"use client";

import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler } from "react-hook-form";
import Form from "@/components/Form";
import { SignIn } from "@/services/auth.api";
import { SignInForm } from "@/types/authType";

export default function LoginForm() {
  const router = useRouter();

  const SignInMutation = useMutation({
    mutationFn: async (data: SignInForm) => SignIn(data),
    onSuccess: (data) => {
      alert("로그인이 완료되었습니다.");

      setCookie("accessToken", data.accessToken, { path: "/", maxAge: 60 * 60 * 24 * 3 });
      setCookie("refreshToken", data.refreshToken, { path: "/", maxAge: 60 * 60 * 24 * 30 });

      router.push("/");
    },
    onError: (error) => alert(error),
  });

  const onSubmit: SubmitHandler<SignInForm> = (data) => {
    if (SignInMutation.isPending) return;
    SignInMutation.mutate(data);
  };

  return (
    <Form<SignInForm> onSubmit={onSubmit}>
      <label htmlFor="email" className="pl-1 text-lg font-semibold">
        이메일
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <Form.Input<SignInForm>
          label="email"
          placeholder="이메일을 입력해주세요."
          validation={{
            required: { value: true, message: "이메일을 입력해주세요." },
            pattern: { value: /^\S+@\S+$/i, message: "이메일 형식이 올바르지 않습니다." },
          }}
        />
      </div>

      <div className="pt-2" />

      <Form.Error<SignInForm> name="email" />

      <div className="pt-4" />

      <label htmlFor="password" className="pl-1 text-lg font-semibold">
        비밀번호
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <Form.Input<SignInForm>
          label="password"
          placeholder="비밀번호를 입력해주세요."
          type={"password"}
          validation={{
            required: { value: true, message: "비밀번호를 입력해주세요." },
            minLength: { value: 6, message: "비밀번호는 6자 이상이어야 합니다." },
          }}
        />
      </div>

      <div className="pt-2" />

      <Form.Error<SignInForm> name="password" />

      <div className="pt-4" />

      <div className="flex h-12 w-full items-center justify-end">
        <Form.Submit text="로그인" />
      </div>

      <div className="pt-5" />

      <div className="flex w-full items-center justify-center">
        <p>
          계정이 없다면{"\u00A0"}
          <Link
            href={"/signup"}
            className="font-semibold text-brand_dark-secondary underline dark:text-brand-secondary"
          >
            가입하기
          </Link>
        </p>
      </div>
    </Form>
  );
}
