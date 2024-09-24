"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { SubmitHandler } from "react-hook-form";
import Form from "@/components/Form";
import { SignIn } from "@/services/auth.api";
import useUserStore from "@/stores/UserStore";
import { SignInForm, SignInResponse } from "@/types/authType";
import toast from "@/utils/Toast";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const SignInMutation = useMutation<SignInResponse, Error, SignInForm>({
    mutationKey: ["auth"],
    mutationFn: async (data: SignInForm) => SignIn(data),
    onSuccess: (data) => {
      setCookie("accessToken", data.accessToken, { path: "/", secure: true, sameSite: "strict" });
      setCookie("refreshToken", data.refreshToken, { path: "/", secure: true, sameSite: "strict" });

      useUserStore.setState({ isLoggedIn: true });

      // 유저 정보 갱신
      queryClient.refetchQueries({ queryKey: ["user"] });

      router.push("/");
    },
  });

  const onSubmit: SubmitHandler<SignInForm> = (data) => {
    if (SignInMutation.isPending) return;
    toast.promise(SignInMutation.mutateAsync(data), {
      loading: "로그인 중...",
      success: "로그인 성공",
      error: "로그인 실패",
    });
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
          autoComplete="email"
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
          autoComplete="current-password"
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
        <Form.Submit text="로그인" disabled={SignInMutation.isPending} />
      </div>
    </Form>
  );
}
