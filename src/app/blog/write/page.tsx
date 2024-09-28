import MarkdownEditor from "./_components/MarkdownEditor";

export default function Page({ searchParams }: { searchParams: { title: string } }) {
  const slug = searchParams.title;

  return <MarkdownEditor slug={slug} />;
}
