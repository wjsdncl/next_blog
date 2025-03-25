import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import components from "@/components/MarkdownComponents";
import { getPost } from "@/services/post.api";
import { getUser } from "@/services/user.api";
import PostHeader from "./_components/PostHeader";

const Navigation = dynamic(() => import("./_components/Navigation"));
const GenerateTOC = dynamic(() => import("./_components/GenerateTOC"));
const Comments = dynamic(() => import("./_components/Comments/Comments"));

export default async function Page({ params }: { params: { title: string } }) {
  const accessToken = cookies().get("accessToken");
  const title = params.title;
  const post = await getPost(title);
  const user = accessToken ? await getUser() : undefined;

  if (!post) {
    return (
      <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
        <h1 className="text-center text-4xl font-bold">게시글을 찾을 수 없습니다.</h1>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 text-lg tablet:w-tablet tablet:px-0">
      <PostHeader post={post} user={user} />

      {/* 목차 */}
      {post.content.trim() && <GenerateTOC content={post.content} />}

      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="rounded-md bg-gray-200 px-2 py-1 text-base font-medium"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* 카테고리 */}
      {post.category && (
        <div className="mb-10 flex h-fit max-h-[200px] w-full rounded-lg bg-gray-200 p-8">
          <div className="grow">
            <Link
              href={`/blog?category=${post.category}`}
              className="text-2xl font-bold text-text-primary hover:underline"
            >
              [ {post.category} ]
            </Link>
          </div>
        </div>
      )}

      {/* 썸네일 */}
      {post.coverImg && (
        <div className="relative h-[400px] w-full max-w-screen-tablet">
          <Image
            src={post.coverImg}
            alt="coverImage"
            className="object-contain px-6"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      )}

      {/* 본문 */}
      <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSlug]} components={components}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-20 hidden rounded-full border-b-4 border-gray-300 desktop:mb-10 desktop:flex" />

      {/* 네비게이션 */}
      <div className="mb-10 mt-20 flex w-full items-center justify-end gap-2 desktop:hidden">
        <hr className="grow-[5] rounded-l-full border-2 border-gray-300" />
        <Navigation post={post} />
        <hr className="w-5 rounded-r-full border-2 border-gray-300" />
      </div>

      {/* 댓글 */}
      <Comments post={post} user={user} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: { title: string } }): Promise<Metadata> {
  const decodedTitle = decodeURIComponent(params.title).replace(/-/g, " ");

  try {
    return {
      title: `${decodedTitle} | JMJ's Devlog`,
      description: `${decodedTitle}에 대한 블로그 게시글`,
      openGraph: {
        title: `${decodedTitle} | JMJ's Devlog`,
        description: `${decodedTitle}에 대한 블로그 게시글`,
        url: `https://wjsdncl-dev-hub.vercel.app/blog/${params.title}`,
        type: "article",
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://wjsdncl-dev-hub.vercel.app/blog/${params.title}`,
      },
    };
  } catch (error) {
    return {
      title: "블로그 게시글을 찾을 수 없습니다. | JMJ's Devlog",
      description: "블로그 게시글을 찾을 수 없습니다.",
    };
  }
}
