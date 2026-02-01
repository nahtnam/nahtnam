import { Link } from "@tanstack/react-router";
import { appName } from "@/config/app";

export function Logo() {
  return (
    <Link className="font-bold text-xl" to="/">
      {appName}
    </Link>
  );
}
