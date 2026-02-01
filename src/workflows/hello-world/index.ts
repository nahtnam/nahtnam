// biome-ignore lint/suspicious/useAwait: workflow
export async function helloWorld() {
  "use workflow";
  return { message: "hello world" };
}
