import Link from "next/link";

async function getYear() {
  // "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await getYear();

  return (
    <div className="mt-6 border-t py-6">
      <div className="container mx-auto">
        <footer className="footer">
          <nav>
            <h6 className="footer-title">
              &copy; {year} nahtnam. All rights reserved.
            </h6>
            <div>
              Powered by{" "}
              <Link
                className="link-hover link"
                href="https://www.xnext.dev"
                target="_blank"
                rel="noreferrer"
              >
                xNext
              </Link>
              .
            </div>
          </nav>
        </footer>
      </div>
    </div>
  );
}
