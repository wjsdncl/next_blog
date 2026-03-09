export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import { getPostList } from "@/services/post.api";
import { type Post } from "@/types/blogType";
import cn from "@/utils/cn";
import { diffDate } from "@/utils/FormatDate";

export default async function Page() {
  let popularPosts: Post[] = [];
  let recentPosts: Post[] = [];

  try {
    [popularPosts, recentPosts] = await Promise.all([
      getPostList({ limit: 4, order: "like" }).then((res) => res.posts),
      getPostList({ limit: 4, order: "newest" }).then((res) => res.posts),
    ]);
  } catch {
    // 백엔드 다운 시 빈 배열 fallback
  }

  return (
    <div className="mx-auto flex size-full flex-col justify-between px-6 py-4 tablet:w-tablet tablet:max-w-none desktop:w-desktop desktop:px-0">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="ml-3 text-2xl font-bold">인기글</h2>
          <Link href="/blog" className="mr-4 text-base text-gray-900">
            전체보기
          </Link>
        </div>

        <PostSection posts={popularPosts} />
      </section>

      <section>
        <h2 className="ml-3 mt-4 text-2xl font-bold">새로운 글</h2>

        <PostSection posts={recentPosts} />
      </section>
    </div>
  );
}

const PostSection = ({ posts }: { posts: Post[] }) => (
  <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
    {posts.map((post) => (
      <Link
        key={post.id}
        href={`/blog/${post.slug}`}
        className="flex flex-col rounded-md border border-gray-200 bg-gray-100 desktop:w-[280px]"
      >
        {post.cover_image && (
          <div className="relative flex min-h-36 w-full items-center justify-center">
            <Image src={post.cover_image} alt={"thumbnail"} className="rounded-t-md object-cover" fill sizes="300" />
          </div>
        )}
        <div className={cn(`flex max-h-full grow flex-col px-4 pb-4 ${post.cover_image ? "pt-3" : "pt-4"}`)}>
          <div className="size-full max-h-full grow border-b border-gray-400">
            <h3 className="line-clamp-1 text-2xl font-semibold text-gray-800">{post.title}</h3>
            {(post.excerpt || post.content) && (
              <p
                className={cn(`mb-4 mt-2 text-sm text-gray-700 ${post.cover_image ? "line-clamp-2" : "line-clamp-[9]"}`)}
              >
                {removeMarkdown((post.excerpt || post.content || "").slice(0, 500))}
              </p>
            )}
          </div>

          <div className="mt-2">
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-700">
              {diffDate(post.created_at)} <span className="font-extrabold">·</span> {post.comment_count} 개의 댓글
              <span className="font-extrabold">·</span>
              <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
              {post.like_count ?? 0}
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
