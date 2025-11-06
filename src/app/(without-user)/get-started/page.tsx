import { google } from "@/config/auth";
import { Google } from "./_components/form/google";

export default function Page() {
  return (
    <div className="container mx-auto flex h-full flex-col items-center justify-center">
      <div className="card card-lg w-full max-w-md border border-base-300">
        <div className="card-body">
          <div className="prose max-w-none text-center">
            <h2>Get Started</h2>
          </div>

          <hr className="my-2 border-base-300" />

          {google && <Google />}
        </div>
      </div>
    </div>
  );
}
