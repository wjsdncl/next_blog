import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MarkdownEditor from "./_components/MarkdownEditor";
import { User } from "@/types/AuthType";

export default async function Page({ searchParams }: { searchParams: { title: string } }) {
  const slug = searchParams.title;

  const accessToken = cookies().get("accessToken")?.value ?? "";

  if (accessToken) {
    const res = await axios.get<User>(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.data.isAdmin) redirect("/blog");
  } else {
    redirect("/blog");
  }

  return <MarkdownEditor slug={slug} />;
}
