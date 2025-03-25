"use server";

import { cookies } from "next/headers";
import { getUser } from "@/services/user.api";
import ClientHeader from "./client";

export default async function Header() {
  const accessToken = cookies().get("accessToken");
  const user = accessToken ? await getUser() : undefined;

  return <ClientHeader user={user} />;
}
