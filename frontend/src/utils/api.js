const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const analyzeCode = ({ code, language, userId }) =>
  request("/analyze", {
    method: "POST",
    body: JSON.stringify({ code, language, user_id: userId }),
  });

export const sendChatMessage = ({ message, code, language, userId, history }) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, code, language, user_id: userId, history }),
  });

export const fetchMemory = (userId) =>
  request(`/memory/${userId}`);

export const fetchHistory = (userId) =>
  request(`/history/${userId}`);

export const clearMemory = (userId) =>
  request(`/memory/${userId}`, { method: "DELETE" });
