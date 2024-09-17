export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div className="relative mx-auto flex size-full flex-col justify-between px-5 py-8 tablet:w-tablet tablet:px-0">
      <h1>Blog Post {params.id}</h1>
    </div>
  );
}
