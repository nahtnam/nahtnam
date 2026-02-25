---
name: within-ts
description: within-ts library for typed errors, dependency injection, Result types, structured logging, caching, retry scheduling, and entity models. Activate when working with error handling, services/DI, Result types, logging, caching, retry logic, or domain entities.
---

# within-ts

An Effect-like TypeScript library using async/await instead of generators. Provides typed errors, dependency injection, Result types, structured logging, caching, retry scheduling, and entity models using standard TypeScript patterns.

**Install:** `npm install within-ts`
**Repo:** https://github.com/ludicroushq/within-ts
**Docs:** https://www.within-ts.com

## Core Exports

All imports come from `within-ts`:

```ts
import { Define, Result, Cache, Schedule } from "within-ts";
```

- **Define** — Creates error classes, services, entities, and loggers
- **Result** — Ok/Err union type for safe error handling
- **Cache** — TTL-based function memoization
- **Schedule** — Retry logic with backoff strategies

---

## Tagged Errors

One-line error classes with discriminated unions via `_tag`.

```ts
import { Define } from "within-ts";

class NotFoundError extends Define.Error("NotFound")<{
  readonly id: string;
}>() {}

class ValidationError extends Define.Error("Validation")<{
  readonly field: string;
  readonly message: string;
}>() {}
```

Each error class:

- Extends `Error` (has `.message`, `.stack`)
- Has a `_tag` property with a literal string type
- Takes fields as a single object in the constructor
- Fields are assigned directly onto the instance

Usage:

```ts
const err = new NotFoundError({ id: "123" });
err._tag; // "NotFound" (literal type)
err.id; // "123"
err instanceof Error; // true
err instanceof NotFoundError; // true
```

Discriminated union narrowing with `switch`:

```ts
function handle(err: NotFoundError | ValidationError) {
  switch (err._tag) {
    case "NotFound":
      console.log(`Missing: ${err.id}`);
      break;
    case "Validation":
      console.log(`Bad field: ${err.field}`);
      break;
  }
}
```

---

## Services (Dependency Injection)

Uses Node's AsyncLocalStorage for testable DI without framework overhead.

### Factory approach (recommended)

```ts
class Database extends Define.Service("Database", () =>
  drizzle({ connection: process.env.DATABASE_URL }),
) {}
```

Type is inferred from factory return type.

### Explicit type approach

```ts
class Database extends Define.Service("Database")<{
  query: (sql: string) => Promise<Row[]>;
}>() {
  static default() {
    return new PgDatabase();
  }
}
```

### Usage

```ts
async function getUsers() {
  const db = new Database();
  return db.query("SELECT * FROM users");
}
```

`new Database()` reads from AsyncLocalStorage context (does not construct traditionally). On first access, the factory or `static default()` initializes lazily. If both exist, `static default()` takes priority.

### Testing

```ts
const mockDb = { query: async () => [{ id: "1", name: "Test User" }] };

Database.run(mockDb, async () => {
  const users = await getUsers();
  expect(users).toEqual([{ id: "1", name: "Test User" }]);
});
```

### API

- `new MyService()` — reads from ALS context
- `MyService.enterWith(value)` — sets for current async context (use at app startup)
- `MyService.run(value, fn)` — scoped override (inner `.run()` takes precedence, outer resumes after)

Concurrent async contexts are fully isolated.

---

## Result Type

A union of `Ok<A>` and `Err<E>` for explicit error handling without throwing. The `.ok` boolean enables TypeScript type narrowing.

```ts
import { Result } from "within-ts";

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.err("division by zero");
  return Result.ok(a / b);
}

const result = divide(10, 0);
if (!result.ok) {
  console.log(result.error); // TypeScript knows this is string
  return;
}
console.log(result.value); // TypeScript knows this is number
```

### Wrapping Unsafe Code

Wrap third-party/throwing code at boundaries:

```ts
const result = Result.try(() => JSON.parse(rawInput));
// Result<any, unknown>

const result = await Result.tryPromise(() => fetch("/api/users"));
// Result<Response, unknown>

const result = await Result.tryPromise({
  try: () => fetch("/api/users"),
  catch: (e) => new NetworkError({ cause: e }),
});
// Result<Response, NetworkError>
```

### Three-Layer Architecture

1. **Edges**: Wrap unsafe code with `Result.try` / `Result.tryPromise`
2. **Middle**: Pure business logic accepting and returning `Result`, early-return on `!result.ok`
3. **Route handlers**: Read final `Result`, return HTTP responses

```ts
// Edge
async function findUser(id: string): Promise<Result<User, DbError>> {
  return Result.tryPromise({
    try: () => db.query("SELECT * FROM users WHERE id = $1", [id]),
    catch: (e) => new DbError({ cause: e }),
  })
}

// Middle
async function getDisplayName(id: string): Promise<Result<string, DbError | NotFoundError>> {
  const result = await findUser(id)
  if (!result.ok) return result
  if (!result.value) return Result.err(new NotFoundError({ id }))
  return Result.ok(`${result.value.first} ${result.value.last}`)
}

// Handler
app.get("/user/:id", async (req, res) => {
  const result = await getDisplayName(req.params.id)
  if (!result.ok) {
    if (result.error._tag === "NotFound") return res.status(404).json(...)
    return res.status(500).json(...)
  }
  return res.json({ name: result.value })
})
```

---

## Logger

Structured logging with typed context flowing through AsyncLocalStorage.

```ts
const Logger = Define.Logger<{
  requestId?: string;
  userId?: string;
  jobId?: string;
}>({
  trace(entry) {
    pino.trace(entry);
  },
  debug(entry) {
    pino.debug(entry);
  },
  info(entry) {
    pino.info(entry);
  },
  warn(entry) {
    pino.warn(entry);
  },
  error(entry) {
    pino.error(entry);
  },
  fatal(entry) {
    pino.fatal(entry);
  },
});
```

- Handlers receive `LogEntry` with ALS context already merged
- Log methods accept plain strings or structured objects with message, data, and typed context fields
- Use `Logger.with()` to accumulate context through ALS scopes
- The type parameter enforces consistent field naming across the codebase

---

## Cache

TTL-based function memoization:

```ts
import { Cache } from "within-ts";

const getUser = Cache.memoize((id: string) => db.findUser(id), {
  ttl: "5m",
});

const user = await getUser("123"); // cache miss
const user2 = await getUser("123"); // cache hit
```

For complex arguments, provide a `key` function:

```ts
const getReport = Cache.memoize(
  (date: Date, filters: Filters) => generateReport(date, filters),
  {
    ttl: "1h",
    key: (date, filters) => `${date.toISOString()}:${filters.type}`,
  },
);
```

- In-memory storage
- TTL formats: `"5m"`, `"1h"`, `"30s"`, or numeric milliseconds

---

## Schedule

Retry logic integrated with Result types.

```ts
import { Schedule, Result } from "within-ts";

const result = await Schedule.retry(() => callApi(), {
  times: 3,
  delay: "100ms",
});
```

Exponential backoff:

```ts
const result = await Schedule.retry(() => callApi(), {
  times: 5,
  delay: Schedule.exponential("100ms"), // 100, 200, 400, 800, 1600
});
```

With jitter and max delay:

```ts
const result = await Schedule.retry(() => callApi(), {
  times: 5,
  delay: Schedule.exponential("100ms", { jitter: true, max: "5s" }),
});
```

Conditional retry:

```ts
const result = await Schedule.retry(() => callApi(), {
  times: 3,
  delay: "1s",
  while: (error) => error instanceof RateLimitError,
});
```

Flow:

1. Call the function
2. If `Result.ok` — done
3. If `Result.err` — pass error to `while` (if provided)
4. If `while` returns `true` (or no `while`) — wait, retry
5. If `while` returns `false` or retries exhausted — return last `Result.err`

No exceptions thrown. Entire flow stays within the `Result` type.

---

## Entity

Rich domain models that access services without DI.

```ts
import { Define } from "within-ts";

class User extends Define.Entity<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}>() {
  get fullName() {
    return `${this.entity.firstName} ${this.entity.lastName}`;
  }

  get formattedEmail() {
    return `${this.fullName} <${this.entity.email}>`;
  }

  async orders() {
    const db = new Database();
    return db.query("SELECT * FROM orders WHERE user_id = $1", [
      this.entity.id,
    ]);
  }

  async save() {
    const db = new Database();
    Logger.info({ message: "saving user", data: { id: this.entity.id } });
    await db.update("users", this.entity);
  }
}
```

Usage:

```ts
const user = new User({
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});
user.entity.firstName; // "John"
user.entity.firstName = "Jane"; // simple mutation
user.entity; // grab the whole data object
user.fullName; // "Jane Doe"
await user.orders(); // queries via ALS-provided Database
await user.save();
```

- Entity data lives in `this.entity`
- Entity methods can call `new Database()`, `new Logger()`, etc. without arguments — AsyncLocalStorage provides them
- `this.entity` keeps all data grouped for easy access, update, or passing to other functions
