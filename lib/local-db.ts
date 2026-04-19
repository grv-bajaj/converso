import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const localDbFilePath = path.join(process.cwd(), "data", "local-db.json");

const seedCompanions = [
  {
    id: "seed-science-1",
    name: "Neura the Brainy Explorer",
    subject: "science",
    topic: "Neural Network of the Brain",
    duration: 45,
    voice: "female",
    style: "formal",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T10:00:00.000Z").toISOString(),
  },
  {
    id: "seed-maths-1",
    name: "Countsy the Number Wizard",
    subject: "maths",
    topic: "Derivatives & Integrals",
    duration: 30,
    voice: "male",
    style: "casual",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T11:00:00.000Z").toISOString(),
  },
  {
    id: "seed-language-1",
    name: "Verba the Vocabulary Builder",
    subject: "language",
    topic: "English Literature",
    duration: 30,
    voice: "female",
    style: "formal",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T12:00:00.000Z").toISOString(),
  },
  {
    id: "seed-coding-1",
    name: "Codey the Logic Hacker",
    subject: "coding",
    topic: "Intro to If-Else Statements",
    duration: 45,
    voice: "male",
    style: "casual",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T13:00:00.000Z").toISOString(),
  },
  {
    id: "seed-history-1",
    name: "Memo the Memory Keeper",
    subject: "history",
    topic: "World Wars: Causes & Consequences",
    duration: 15,
    voice: "female",
    style: "formal",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T14:00:00.000Z").toISOString(),
  },
  {
    id: "seed-economics-1",
    name: "The Market Maestro",
    subject: "economics",
    topic: "The Basics of Supply & Demand",
    duration: 10,
    voice: "male",
    style: "casual",
    author: "seed-user",
    bookmarked: false,
    created_at: new Date("2026-04-01T15:00:00.000Z").toISOString(),
  },
];

type LocalCompanion = {
  id: string;
  name: string;
  subject: string;
  topic: string;
  duration: number;
  voice: string;
  style: string;
  author: string;
  bookmarked: boolean;
  created_at: string;
};

type LocalSessionHistory = {
  id: string;
  companion_id: string;
  user_id: string;
  created_at: string;
};

type LocalBookmark = {
  id: string;
  companion_id: string;
  user_id: string;
  created_at: string;
};

type LocalDbState = {
  companions: LocalCompanion[];
  session_history: LocalSessionHistory[];
  bookmarks: LocalBookmark[];
};

const defaultState = (): LocalDbState => ({
  companions: seedCompanions,
  session_history: [],
  bookmarks: [],
});

const ensureLocalDb = async () => {
  await fs.mkdir(path.dirname(localDbFilePath), { recursive: true });

  try {
    await fs.access(localDbFilePath);
  } catch {
    await fs.writeFile(
      localDbFilePath,
      JSON.stringify(defaultState(), null, 2),
      "utf8",
    );
  }
};

const loadLocalDb = async (): Promise<LocalDbState> => {
  await ensureLocalDb();
  const raw = await fs.readFile(localDbFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<LocalDbState>;

  return {
    companions: Array.isArray(parsed.companions) ? parsed.companions : [],
    session_history: Array.isArray(parsed.session_history)
      ? parsed.session_history
      : [],
    bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
  };
};

const saveLocalDb = async (state: LocalDbState) => {
  await fs.writeFile(localDbFilePath, JSON.stringify(state, null, 2), "utf8");
};

const hydrateCompanion = (companion: LocalCompanion, bookmarked: boolean) => ({
  ...companion,
  bookmarked,
});

const getCompanionBookmarks = (state: LocalDbState, userId?: string) => {
  if (!userId) return new Set<string>();

  return new Set(
    state.bookmarks
      .filter((bookmark) => bookmark.user_id === userId)
      .map((bookmark) => bookmark.companion_id),
  );
};

const toSearchableValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value.join(" ");
  return value ?? "";
};

export const isLocalDbEnabled = process.env.USE_LOCAL_DB === "true";

export const createLocalCompanion = async (
  formData: CreateCompanion & { author: string },
  userId?: string,
) => {
  const state = await loadLocalDb();
  const companion: LocalCompanion = {
    id: randomUUID(),
    name: formData.name,
    subject: formData.subject,
    topic: formData.topic,
    duration: formData.duration,
    voice: formData.voice,
    style: formData.style,
    author: formData.author,
    bookmarked: false,
    created_at: new Date().toISOString(),
  };

  state.companions.unshift(companion);
  await saveLocalDb(state);

  const bookmarked = getCompanionBookmarks(state, userId).has(companion.id);
  return hydrateCompanion(companion, bookmarked);
};

export const getLocalAllCompanions = async (
  { limit = 10, page = 1, subject, topic }: GetAllCompanions,
  userId?: string,
) => {
  const state = await loadLocalDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);
  const subjectFilter = toSearchableValue(subject).trim().toLowerCase();
  const topicFilter = toSearchableValue(topic).trim().toLowerCase();

  const filteredCompanions = state.companions.filter((companion) => {
    const matchesSubject =
      !subjectFilter || companion.subject.toLowerCase().includes(subjectFilter);
    const matchesTopic =
      !topicFilter ||
      companion.topic.toLowerCase().includes(topicFilter) ||
      companion.name.toLowerCase().includes(topicFilter);

    return matchesSubject && matchesTopic;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return filteredCompanions
    .slice(startIndex, endIndex)
    .map((companion) =>
      hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
    );
};

export const getLocalCompanion = async (id: string, userId?: string) => {
  const state = await loadLocalDb();
  const companion = state.companions.find((entry) => entry.id === id);

  if (!companion) {
    return null;
  }

  return hydrateCompanion(
    companion,
    getCompanionBookmarks(state, userId).has(companion.id),
  );
};

export const addLocalSessionHistory = async (
  companionId: string,
  userId: string,
) => {
  const state = await loadLocalDb();
  const entry = {
    id: randomUUID(),
    companion_id: companionId,
    user_id: userId,
    created_at: new Date().toISOString(),
  } satisfies LocalSessionHistory;

  state.session_history.unshift(entry);
  await saveLocalDb(state);

  return entry;
};

export const getLocalRecentSessions = async (limit = 10, userId?: string) => {
  const state = await loadLocalDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);
  const companions = state.session_history
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit)
    .map((entry) =>
      state.companions.find((companion) => companion.id === entry.companion_id),
    )
    .filter((companion): companion is LocalCompanion => Boolean(companion));

  return companions.map((companion) =>
    hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
  );
};

export const getLocalUserSessions = async (userId: string, limit = 10) => {
  const state = await loadLocalDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);
  const companions = state.session_history
    .filter((entry) => entry.user_id === userId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit)
    .map((entry) =>
      state.companions.find((companion) => companion.id === entry.companion_id),
    )
    .filter((companion): companion is LocalCompanion => Boolean(companion));

  return companions.map((companion) =>
    hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
  );
};

export const getLocalUserCompanions = async (userId: string) => {
  const state = await loadLocalDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  return state.companions
    .filter((companion) => companion.author === userId)
    .map((companion) =>
      hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
    );
};

export const addLocalBookmark = async (companionId: string, userId: string) => {
  const state = await loadLocalDb();
  const existingBookmark = state.bookmarks.find(
    (bookmark) =>
      bookmark.companion_id === companionId && bookmark.user_id === userId,
  );

  if (!existingBookmark) {
    state.bookmarks.unshift({
      id: randomUUID(),
      companion_id: companionId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    await saveLocalDb(state);
  }

  return state.bookmarks.filter(
    (bookmark) =>
      bookmark.companion_id === companionId && bookmark.user_id === userId,
  );
};

export const removeLocalBookmark = async (
  companionId: string,
  userId: string,
) => {
  const state = await loadLocalDb();
  state.bookmarks = state.bookmarks.filter(
    (bookmark) =>
      !(bookmark.companion_id === companionId && bookmark.user_id === userId),
  );
  await saveLocalDb(state);

  return [];
};

export const getLocalBookmarkedCompanions = async (userId: string) => {
  const state = await loadLocalDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  return state.bookmarks
    .filter((bookmark) => bookmark.user_id === userId)
    .map((bookmark) =>
      state.companions.find(
        (companion) => companion.id === bookmark.companion_id,
      ),
    )
    .filter((companion): companion is LocalCompanion => Boolean(companion))
    .map((companion) =>
      hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
    );
};
