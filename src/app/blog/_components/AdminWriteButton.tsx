"use client";

import Link from "next/link";
import { memo } from "react";

const AdminWriteButton = memo(({ isOwner }: { isOwner: boolean }) => {
  if (!isOwner) return null;

  return (
    <div className="fixed bottom-[70px] right-[16px] z-40 flex h-[48px] w-[130px] items-center justify-center overflow-hidden rounded-full tablet:right-[24px] desktop:right-[calc((100%-1200px)/2)]">
      <Link
        href={"/blog/write"}
        className="flex size-full items-center justify-center bg-gray-200 text-text-primary hover:bg-gray-300 active:bg-gray-400"
      >
        <span>새 글 작성하기</span>
      </Link>
    </div>
  );
});

AdminWriteButton.displayName = "AdminWriteButton";
export default AdminWriteButton;
