// A QR may only open the private action app. Exclude URL escapes, traversal,
// query strings, fragments and encoded separators, even from machine callers.
const ACTION_PATH = /^\/ai(?:\/[A-Za-z0-9_-]+)*\/?$/u;

export function isPrintActionPath(path: string) {
  return path.length <= 200 && ACTION_PATH.test(path);
}
