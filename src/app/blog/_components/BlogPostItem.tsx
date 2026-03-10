import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import removeMarkdown from "remove-markdown";
import FavoriteEmpty from "@/Icons/FavoriteEmpty.svg";
import { type Post } from "@/types/blogType";
import { diffDate } from "@/utils/formatDate";

interface BlogPostItemProps {
  blog: Post;
  pageIndex: number;
}

const BlogPostItem = memo(({ blog, pageIndex }: BlogPostItemProps) => {
  return (
    <article key={`${pageIndex}-${blog.id}`} className="flex flex-col gap-4 text-text-primary">
      <Link href={`/blog/${blog.slug}`} className="flex flex-col gap-4">
        {blog.cover_image && (
          <div className="relative flex h-96 w-full items-center justify-center">
            <Image src={blog.cover_image} alt={"coverImage"} className="object-cover" fill sizes="300" />
          </div>
        )}
        <h2 className="text-3xl font-bold">
          {blog.category && <span className="pr-2">[{blog.category.name}]</span>}
          {blog.title}
        </h2>
        <p className="line-clamp-4 text-lg">{removeMarkdown((blog.excerpt || blog.content || "").slice(0, 500))}</p>
      </Link>

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {blog.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/blog?tag=${tag.slug}`}
              className="rounded-md bg-gray-200 px-3 py-2 font-medium"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-gray-500">
        <p>{diffDate(blog.created_at)}</p>
        <span className="font-extrabold">·</span>
        <p>댓글 {blog.comment_count ?? 0}</p>
        <span className="font-extrabold">·</span>
        <FavoriteEmpty width={14} height={14} color="var(--color-gray-500)" />
        {blog.like_count ?? 0}
      </div>
    </article>
  );
});

BlogPostItem.displayName = "BlogPostItem";
export default BlogPostItem;
