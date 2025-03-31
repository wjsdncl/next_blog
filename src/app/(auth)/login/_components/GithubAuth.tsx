"use client";

import Github from "@/Icons/Github.svg";
import { SignInWithGithub } from "@/services/auth.api";

export default function GithubAuth() {
  const handleSignInWithGithub = async () => {
    await SignInWithGithub();
  };

  return (
    <button
      type="button"
      onClick={handleSignInWithGithub}
      className="flex h-14 w-full flex-1 items-center justify-center rounded-lg bg-gray-200 text-white"
    >
      <Github width={24} height={24} color="#fff" />
      <span className="pl-2 text-lg font-medium">깃허브로 로그인</span>
    </button>
  );
}
