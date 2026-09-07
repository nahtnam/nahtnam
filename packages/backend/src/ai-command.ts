const COMMAND_PREFIX =
  /^(?:A\d+(?:\s|$)|(?:Y|N|YES|NO|DONE|SNOOZE|IGNORE|NOT_MINE|UNDO)(?:\s|$))/u;

export function normalizeAiCommand(body: string) {
  return body
    .trim()
    .toUpperCase()
    .replaceAll(/NOT\s+MINE/gu, "NOT_MINE");
}

export function isAiCommand(body: string) {
  return COMMAND_PREFIX.test(normalizeAiCommand(body));
}
