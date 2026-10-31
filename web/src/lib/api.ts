export type ReadingStatus =
  | "want_to_read"
  | "reading"
  | "paused"
  | "finished"
  | "dropped";

export type Title = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  sourceUrl: string;
  status: ReadingStatus;
  currentChapter: number;
  totalChapters: number | null;
  genres: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
};

type ApiError = {
  error?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as ApiError).error)
        : "Request failed";
    throw new Error(message);
  }
  return body as T;
}

export function getTitles() {
  return request<{ titles: Title[] }>("/api/v1/titles");
}

export function createTitle(input: Partial<Title>) {
  return request<Title>("/api/v1/titles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTitle(id: string, input: Partial<Title>) {
  return request<Title>(`/api/v1/titles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTitle(id: string) {
  return request<void>(`/api/v1/titles/${id}`, {
    method: "DELETE",
  });
}
