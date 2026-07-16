const markdownFiles = import.meta.glob<string>("/content/blog/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

export const availableBlogContentPaths = Object.keys(markdownFiles).map(
  (path) => path.slice(1)
);

export function getBlogMarkdownContent(contentPath: string | undefined) {
  if (!contentPath) {
    return;
  }

  return markdownFiles[`/${contentPath}`];
}
