import { Link } from "@tanstack/react-router";
import type { User } from "better-auth";
import { appName } from "@/config/app";

type LogoProps = {
  user: User | null;
};
export function Logo(props: LogoProps) {
  const { user } = props;

  return (
    <Link className="font-bold text-xl" to={user ? "/app" : "/"}>
      {appName}
    </Link>
  );
}
