// Served at mobile-<short>.app.withvibe.dev; API at api-<short>.app.withvibe.dev.
// Derive the API base from our own host (Expo web). Falls back to localhost.
function apiBase(): string {
  if (typeof window === "undefined" || !window.location) {
    return "http://localhost:8080";
  }
  const { protocol, host } = window.location;
  if (host.startsWith("localhost") || host.startsWith("127.")) {
    return "http://localhost:8080";
  }
  return `${protocol}//${host.replace(/^[^.-]+-/, "api-")}`;
}

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  assignee: string | null;
  createdAt: string;
};

const base = apiBase();

export async function listTodos(): Promise<Todo[]> {
  const r = await fetch(`${base}/todos`);
  if (!r.ok) throw new Error(`list ${r.status}`);
  return r.json();
}

export async function createTodo(title: string): Promise<Todo> {
  const r = await fetch(`${base}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, assignee: "Me" }),
  });
  if (!r.ok) throw new Error(`create ${r.status}`);
  return r.json();
}

export async function setDone(id: number, done: boolean): Promise<void> {
  await fetch(`${base}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
}

export async function removeTodo(id: number): Promise<void> {
  await fetch(`${base}/todos/${id}`, { method: "DELETE" });
}
