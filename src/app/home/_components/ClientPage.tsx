"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import { FavoriteEmpty } from "@/Icons/Favorite";
import { getPostList } from "@/services/post.api";
import { diffDate } from "@/utils/FormatDate";

export default function ClientPage() {
  const { data: postsLike } = useQuery({
    queryKey: ["posts", "like"],
    queryFn: async () => {
      const response = await getPostList({ limit: 4, order: "like" });
      return response.posts;
    },
  });

  const { data: postsNew } = useQuery({
    queryKey: ["posts", "new"],
    queryFn: async () => {
      const response = await getPostList({ limit: 4, order: "newest" });
      return response.posts;
    },
  });

  return (
    <>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">인기글</h2>
          <Link href="/blog" className="mr-4 text-base text-gray-700">
            전체보기
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {postsLike ? (
            <>
              {postsLike.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex h-[300px] w-[280px] flex-col rounded-md bg-gray-100"
                >
                  {post.coverImg && (
                    <div className="relative flex min-h-40 w-full items-center justify-center">
                      <Image
                        src={post.coverImg}
                        alt={"thumbnail"}
                        className="rounded-t-md object-cover"
                        fill
                        sizes="300"
                      />
                    </div>
                  )}
                  <div className={`flex max-h-full grow flex-col px-4 pb-4 ${post.coverImg ? "pt-4" : "pt-6"}`}>
                    <div className="size-full max-h-full grow border-b border-gray-400">
                      <h3 className="text-2xl font-semibold">{post.title}</h3>

                      {post.content && (
                        <p
                          className={`mt-2 text-sm text-gray-500 ${post.coverImg ? "line-clamp-1" : "line-clamp-[9]"}`}
                        >
                          {removeMarkdown(post.content)}
                        </p>
                      )}
                    </div>

                    <div className="mt-1">
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        {diffDate(post.createdAt)} <span className="font-extrabold">·</span> {post._count?.comments}
                        개의 댓글 <span className="font-extrabold">·</span>
                        <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
                        {post.likes ?? 0}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative flex h-[300px] w-[280px] animate-pulse items-center justify-center rounded-md bg-gray-200"
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mt-4 text-2xl font-bold">새로운 글</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {postsNew ? (
            <>
              {postsNew.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex h-[300px] w-[280px] flex-col rounded-md bg-gray-100"
                >
                  {post.coverImg && (
                    <div className="relative flex min-h-40 w-full items-center justify-center">
                      <Image
                        src={post.coverImg}
                        alt={"thumbnail"}
                        className="rounded-t-md object-cover"
                        fill
                        sizes="300"
                      />
                    </div>
                  )}
                  <div className={`flex max-h-full grow flex-col px-4 pb-4 ${post.coverImg ? "pt-4" : "pt-6"}`}>
                    <div className="size-full max-h-full grow border-b border-gray-400">
                      <h3 className="text-2xl font-semibold">{post.title}</h3>

                      {post.content && (
                        <p
                          className={`mt-2 text-sm text-gray-500 ${post.coverImg ? "line-clamp-1" : "line-clamp-[9]"}`}
                        >
                          {removeMarkdown(post.content)}
                        </p>
                      )}
                    </div>

                    <div className="mt-1">
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        {diffDate(post.createdAt)} <span className="font-extrabold">·</span> {post._count?.comments}
                        개의 댓글 <span className="font-extrabold">·</span>
                        <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
                        {post.likes ?? 0}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative flex h-[300px] w-[280px] animate-pulse items-center justify-center rounded-md bg-gray-200"
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}
