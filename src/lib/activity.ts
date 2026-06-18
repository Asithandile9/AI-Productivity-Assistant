export type ActivityKey =
  | "emails"
  | "meetings"
  | "tasks"
  | "research"
  | "chats";

const STORAGE_KEY = "aiwpa.activity.v1";
const RECENT_KEY = "aiwpa.recent.v1";

export type RecentItem = {
  id: string;
  type: ActivityKey;
  title: string;
  at: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("aiwpa:activity"));
}

export function getCounts(): Record<ActivityKey, number> {
  return read<Record<ActivityKey, number>>(STORAGE_KEY, {
    emails: 0,
    meetings: 0,
    tasks: 0,
    research: 0,
    chats: 0,
  });
}

export function bump(key: ActivityKey, title: string) {
  const counts = getCounts();
  counts[key] = (counts[key] ?? 0) + 1;
  write(STORAGE_KEY, counts);
  const recent = read<RecentItem[]>(RECENT_KEY, []);
  const item: RecentItem = {
    id: crypto.randomUUID(),
    type: key,
    title,
    at: Date.now(),
  };
  write(RECENT_KEY, [item, ...recent].slice(0, 20));
}

export function getRecent(): RecentItem[] {
  return read<RecentItem[]>(RECENT_KEY, []);
}
