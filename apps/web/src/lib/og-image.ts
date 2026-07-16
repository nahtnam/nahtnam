export type OgImageInput = {
  readonly title: string;
};

export async function generateOgImagePng(input: OgImageInput) {
  const { renderOgImagePng } = await import("./og-image-renderer");

  return renderOgImagePng({ input });
}
