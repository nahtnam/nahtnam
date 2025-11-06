import { orpcClient } from "@/server/client";

export default async function Page() {
  const { user } = await orpcClient.auth.getUser();

  return <div className="container mx-auto my-8">Hello {user.name}!</div>;
}
