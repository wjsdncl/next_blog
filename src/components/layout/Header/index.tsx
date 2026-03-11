import { getUser } from "@/services/user.api";
import ClientHeader from "./client";

export default async function Header() {
  const user = await getUser();
  return <ClientHeader user={user} />;
}
