/** Only private app paths can be carried through the administrator sign-in flow. */
export function isAdminPath(path: string) {
  return (
    path.length <= 512 &&
    path === path.trim() &&
    /^\/(?:admin|ai)(?:\/[A-Za-z0-9_-]+)*\/?$/u.test(path)
  );
}

export function adminReturnPath(value?: string | null) {
  return value && isAdminPath(value) ? value : "/admin";
}

export function adminSignInPath(value: string) {
  return `/api/auth/admin?returnTo=${encodeURIComponent(adminReturnPath(value))}`;
}

export function callbackReturnPath(path: string) {
  return path === "/app" || path === "/app/" || isAdminPath(path)
    ? path
    : "/app";
}
