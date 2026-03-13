import Link from "next/link";
import { getPostList } from "@/services/post.api";
import { type Post } from "@/types/blogType";
import { diffDate } from "@/utils/formatDate";

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
    <div className="mx-auto w-full px-6 py-12 tablet:w-tablet tablet:max-w-none tablet:px-0 desktop:w-desktop desktop:px-5">
      <div className="flex flex-col gap-12 desktop:flex-row desktop:gap-16">
        <section className="flex-1">
          <h2 className="text-sm uppercase tracking-wider text-gray-800 [text-wrap:balance]">인기 글</h2>
          <div className="mt-2 border-t border-gray-300" />

          {popularPosts.length > 0 ? (
            <ol className="mt-4">
              {popularPosts.map((post, index) => (
                <PostItem
                  key={post.id}
                  post={post}
                  metric={`♡ ${post.like_count ?? 0}`}
                  isLast={index === popularPosts.length - 1}
                />
              ))}
            </ol>
          ) : (
            <p className="py-8 text-center text-gray-500">아직 작성된 글이 없습니다.</p>
          )}
        </section>

        <section className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-gray-800 [text-wrap:balance]">최근 글</h2>
            <Link
              href="/blog"
              className="text-sm text-gray-500 transition-colors duration-200 hover:text-brand-tertiary"
            >
              전체보기 →
            </Link>
          </div>
          <div className="mt-2 border-t border-gray-300" />

          {recentPosts.length > 0 ? (
            <ol className="mt-4">
              {recentPosts.map((post, index) => (
                <PostItem
                  key={post.id}
                  post={post}
                  metric={`댓글 ${post.comment_count}개`}
                  isLast={index === recentPosts.length - 1}
                />
              ))}
            </ol>
          ) : (
            <p className="py-8 text-center text-gray-500">아직 작성된 글이 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}

const PostItem = ({ post, metric, isLast }: { post: Post; metric: string; isLast: boolean }) => (
  <li className={isLast ? "" : "border-b border-gray-200"}>
    <Link
      href={`/blog/${post.slug}`}
      className="group block py-4 transition-transform duration-200 hover:translate-x-1"
    >
      <h3 className="line-clamp-1 text-lg font-medium text-gray-900 transition-colors duration-200 group-hover:text-brand-tertiary">
        {post.title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 [font-variant-numeric:tabular-nums]">
        {diffDate(post.created_at)}
        <span className="mx-1.5">·</span>
        {metric}
      </p>
    </Link>
  </li>
);
