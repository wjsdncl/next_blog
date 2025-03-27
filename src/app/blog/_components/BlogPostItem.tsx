import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import removeMarkdown from "remove-markdown";
import { FavoriteEmpty } from "@/Icons/Favorite";
import { type Post } from "@/types/BlogType";
import { diffDate } from "@/utils/FormatDate";

interface BlogPostItemProps {
  blog: Post;
  pageIndex: number;
}

const BlogPostItem = memo(({ blog, pageIndex }: BlogPostItemProps) => {
  return (
    <article key={`${pageIndex}-${blog.id}`} className="flex flex-col gap-4 text-text-primary">
      <Link href={`/blog/${blog.slug}`} className="flex flex-col gap-4">
        {blog.coverImg && (
          <div className="relative flex h-96 w-full items-center justify-center">
            <Image src={blog.coverImg} alt={"coverImage"} className="object-cover" fill sizes="300" />
          </div>
        )}
        <h2 className="text-3xl font-bold">
          {blog.category && <span className="pr-2">[{blog.category}]</span>}
          {blog.title}
        </h2>
        <p className="line-clamp-4 text-lg">{removeMarkdown(blog.content?.slice(0, 500) as string)}</p>
      </Link>

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {blog.tags.map((tag) => (
            <Link key={tag} href={`/blog?tag=${tag}`} className="rounded-md bg-gray-200 px-3 py-2 font-medium">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-gray-500">
        <p>{diffDate(blog.createdAt)}</p>
        <span className="font-extrabold">·</span>
        <p>댓글 {blog._count?.comments || 0}</p>
        <span className="font-extrabold">·</span>
        <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
        {blog.likes ?? 0}
      </div>
    </article>
  );
});

BlogPostItem.displayName = "BlogPostItem";
export default BlogPostItem;
