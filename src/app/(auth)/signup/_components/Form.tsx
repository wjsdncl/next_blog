"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitHandler, useFormContext } from "react-hook-form";
import Form from "@/components/Form";
import { SignUp } from "@/services/auth.api";
import { SignUpForm } from "@/types/authType";
import toast from "@/utils/Toast";

export default function RegisterForm() {
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationKey: ["auth"],
    mutationFn: async (data: SignUpForm) => SignUp(data),
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => alert(error),
  });

  const onSubmit: SubmitHandler<SignUpForm> = (data) => {
    if (signUpMutation.isPending) return;
    toast.promise(signUpMutation.mutateAsync(data), {
      loading: "회원가입 중...",
      success: "회원가입 성공",
      error: "회원가입 실패",
    });
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
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
              message: "이메일 형식이 올바르지 않습니다.",
            },
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
          autoComplete="username"
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
          autoComplete="new-password"
          type={"password"}
          validation={{
            required: { value: true, message: "비밀번호를 입력해주세요." },
            minLength: { value: 6, message: "비밀번호는 6자 이상이어야 합니다." },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
              message: "비밀번호는 영어와 숫자를 포함해야 합니다.",
            },
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
      autoComplete="new-password"
      type={"password"}
      validation={{
        required: { value: true, message: "비밀번호를 다시 입력해주세요." },
        validate: (value: string) => value === getValues("password") || "비밀번호가 일치하지 않습니다.",
      }}
    />
  );
}
