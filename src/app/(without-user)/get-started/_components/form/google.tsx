"use client";
import { authClient } from "@/lib/auth-client";

export function Google() {
  return (
    <button
      className="btn border-[#e5e5e5] bg-white text-black"
      onClick={() => {
        authClient.signIn.social({
          callbackURL: "/app",
          provider: "google",
        });
      }}
      type="button"
    >
      <svg
        aria-label="Google logo"
        height="16"
        viewBox="0 0 512 512"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Google logo</title>
        <g>
          <path d="m0 0H512V512H0" fill="#fff" />
          <path
            d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
            fill="#34a853"
          />
          <path
            d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
            fill="#4285f4"
          />
          <path
            d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
            fill="#fbbc02"
          />
          <path
            d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
            fill="#ea4335"
          />
        </g>
      </svg>
      Login with Google
    </button>
  );
}
