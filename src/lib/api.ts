const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface QueryResponse {
  answer: string;
  sources: string[];
}

export async function queryBackend(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Backend error");
  return res.json();
}
