import { appName } from "@repo/config/app";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-center border-base-200 border-t bg-base-100 px-8 py-6 text-base-content/60">
      <aside>
        <p className="text-sm">
          &copy; {year} {appName}
        </p>
      </aside>
    </footer>
  );
}
