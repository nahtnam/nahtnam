import { logger } from "@/logger";
import urlMetadata from "url-metadata";

export async function getMetadata(url: string) {
  try {
    const metadata = await urlMetadata(url);
    return {
      title: metadata.title as string,
      description: metadata.description as string,
      image: (metadata["og:image"] || metadata["twitter:image"]) as string,
    };
  } catch (err) {
    logger.error(err);
    return null;
  }
}
