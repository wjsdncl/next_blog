"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useFormContext } from "react-hook-form";
import Form from "@/components/Form";
import { SignUp } from "@/services/auth.api";
import { SignUpForm } from "@/types/authType";

export default function RegisterForm() {
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpForm) => SignUp(data),
    onSuccess: () => {
      alert("회원가입이 완료되었습니다.");
      router.push("/login");
    },
    onError: (error) => alert(error),
  });

  const onSubmit: SubmitHandler<SignUpForm> = (data) => {
    if (signUpMutation.isPending) return;
    signUpMutation.mutate({ email: data.email, name: data.name, password: data.password });
  };

  return (
    <Form<SignUpForm> onSubmit={onSubmit}>
      <label htmlFor="email" className="pl-1 text-lg font-semibold">
        이메일
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <Form.Input<SignUpForm>
          label="email"
          placeholder="이메일을 입력해주세요."
          validation={{
            required: { value: true, message: "이메일을 입력해주세요." },
            pattern: { value: /^\S+@\S+$/i, message: "이메일 형식이 올바르지 않습니다." },
          }}
        />
      </div>

      <div className="pt-2" />

      <Form.Error<SignUpForm> name="email" />

      <div className="pt-4" />

      <label htmlFor="name" className="pl-1 text-lg font-semibold">
        닉네임
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <Form.Input<SignUpForm>
          label="name"
          placeholder="닉네임 입력해주세요."
          validation={{
            required: { value: true, message: "닉네임을 입력해주세요." },
            minLength: { value: 2, message: "닉네임은 2자 이상이어야 합니다." },
          }}
        />
      </div>

      <div className="pt-2" />

      <Form.Error<SignUpForm> name="name" />

      <div className="pt-4" />

      <label htmlFor="password" className="pl-1 text-lg font-semibold">
        비밀번호
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <Form.Input<SignUpForm>
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

      <Form.Error<SignUpForm> name="password" />

      <div className="pt-4" />

      <label htmlFor="passwordConfirm" className="pl-1 text-lg font-semibold">
        비밀번호 확인
      </label>

      <div className="pt-2" />

      <div className="h-10">
        <PasswordConfirmInput />
      </div>

      <div className="pt-2" />

      <Form.Error<SignUpForm> name="passwordConfirm" />

      <div className="pt-4" />

      <div className="flex h-12 w-full items-center justify-end">
        <Form.Submit text="회원가입" />
      </div>

      <div className="pt-5" />

      <div className="flex w-full items-center justify-center">
        <p>
          계정이 있다면{"\u00A0"}
          <Link href={"/login"} className="font-semibold text-brand_dark-secondary underline dark:text-brand-secondary">
            로그인하기
          </Link>
        </p>
      </div>
    </Form>
  );
}

// 별도의 컴포넌트로 비밀번호 확인 로직 추가
function PasswordConfirmInput() {
  const { getValues } = useFormContext<SignUpForm>();

  return (
    <Form.Input<SignUpForm>
      label="passwordConfirm"
      placeholder="비밀번호를 다시 입력해주세요."
      type={"password"}
      validation={{
        required: { value: true, message: "비밀번호를 다시 입력해주세요." },
        validate: (value: string) => value === getValues("password") || "비밀번호가 일치하지 않습니다.",
      }}
    />
  );
}
