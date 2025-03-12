import Image from "next/image";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import { FavoriteEmpty } from "@/Icons/Favorite";
import { getPostList } from "@/services/post.api";
import { type Post } from "@/types/BlogType";
import cn from "@/utils/cn";
import { diffDate } from "@/utils/FormatDate";

export default async function Page() {
  const [popularPosts, recentPosts] = await Promise.all([
    (await getPostList({ limit: 4, order: "like" })).posts,
    (await getPostList({ limit: 4, order: "newest" })).posts,
  ]);

  return (
    <div className="mx-auto flex size-full flex-col justify-between py-4 tablet:w-tablet desktop:w-desktop">
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
        className="flex h-[300px] w-[280px] flex-col rounded-md border border-gray-200 bg-gray-100"
      >
        {post.coverImg && (
          <div className="relative flex min-h-36 w-full items-center justify-center">
            <Image src={post.coverImg} alt={"thumbnail"} className="rounded-t-md object-cover" fill sizes="300" />
          </div>
        )}
        <div className={`flex max-h-full grow flex-col px-4 pb-4 ${post.coverImg ? "pt-3" : "pt-4"}`}>
          <div className="size-full max-h-full grow border-b border-gray-400">
            <h3 className="line-clamp-1 text-2xl font-semibold text-gray-800">{post.title}</h3>
            {post.content && (
              <p className={cn(`mt-2 text-sm text-gray-700 ${post.coverImg ? "line-clamp-2" : "line-clamp-[9]"}`)}>
                {removeMarkdown(post.content.slice(0, 500))}
              </p>
            )}
          </div>

          <div className="mt-2">
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-700">
              {diffDate(post.createdAt)} <span className="font-extrabold">·</span> {post._count?.comments} 개의 댓글
              <span className="font-extrabold">·</span>
              <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
              {post.likes ?? 0}
            </p>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
