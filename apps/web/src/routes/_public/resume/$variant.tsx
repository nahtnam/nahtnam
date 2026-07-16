import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { createFileRoute } from "@tanstack/react-router";

import { defaultResumeVariant, isResumeVariant } from "@/lib/resume/variants";

export const Route = createFileRoute("/_public/resume/$variant")({
  server: {
    handlers: {
      // TanStack Start names HTTP method handlers with uppercase keys.
      // oxlint-disable-next-line sonarjs/function-name
      async GET({ request }) {
        const variant = getVariantFromRequest(request);

        if (!isResumeVariant(variant)) {
          return Response.redirect(
            new URL(`/resume/${defaultResumeVariant}`, request.url),
            307
          );
        }

        const pdf = await readResumePdf({ variant });
        if (!pdf) {
          return Response.redirect(
            new URL(`/resume/${variant}.pdf`, request.url),
            307
          );
        }

        return new Response(pdf, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": `inline; filename="manthan-mallikarjun-${variant}.pdf"`,
            "Content-Type": "application/pdf",
          },
        });
      },
    },
  },
});

function getResumeCandidates(options: { variant: string }) {
  const fileName = `${options.variant}.pdf`;
  const cwd = process.cwd();

  return [
    path.join(cwd, "apps", "web", "public", "resume", fileName),
    path.join(cwd, "public", "resume", fileName),
    path.join(cwd, "apps", "web", ".output", "public", "resume", fileName),
    path.join(cwd, ".output", "public", "resume", fileName),
    path.join(cwd, "..", "public", "resume", fileName),
  ];
}

async function readResumePdf(options: { variant: string }) {
  const results = await Promise.allSettled(
    getResumeCandidates(options).map(
      async (candidate): Promise<ArrayBuffer> => {
        const pdf = await readFile(candidate);

        return pdf.buffer.slice(
          pdf.byteOffset,
          pdf.byteOffset + pdf.byteLength
        ) as ArrayBuffer;
      }
    )
  );
  const match = results.find(
    (result): result is PromiseFulfilledResult<ArrayBuffer> =>
      result.status === "fulfilled"
  );

  return match?.value;
}

function getVariantFromRequest(request: Request) {
  const { pathname } = new URL(request.url);

  return decodeURIComponent(pathname.split("/").filter(Boolean).at(1) ?? "");
}
