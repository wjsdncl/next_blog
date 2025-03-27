import { memo } from "react";
import cn from "@/utils/cn";

// 기본 스켈레톤 아이템 컴포넌트
export const SkeletonItem = memo(({ width, height }: { width: string; height: string }) => (
  <div className={cn(`inline-block rounded-md bg-gray-200 ${width} ${height}`)} />
));
SkeletonItem.displayName = "SkeletonItem";

// 스켈레톤 포스트 아이템 컴포넌트
export const SkeletonPostItem = memo(() => (
  <article className="flex flex-col gap-4 text-text-primary">
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-96 w-full rounded-md bg-gray-200" />
      <div className="h-8 w-80 rounded-md bg-gray-200" />
      <div className="flex flex-wrap gap-2">
        {["w-20", "w-60", "w-40", "w-24", "w-36", "w-52", "w-32", "w-20", "w-56"].map((width, idx) => (
          <SkeletonItem key={idx} width={width} height="h-5" />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["w-20", "w-32", "w-24", "w-36"].map((width, idx) => (
          <SkeletonItem key={idx} width={width} height="h-8" />
        ))}
      </div>
    </div>
  </article>
));
SkeletonPostItem.displayName = "SkeletonPostItem";
