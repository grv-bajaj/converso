const STORAGE_KEY = "converso-browser-db-v1";

type BrowserCompanion = {
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

type BrowserSessionHistory = {
  id: string;
  companion_id: string;
  user_id: string;
  created_at: string;
};

type BrowserBookmark = {
  id: string;
  companion_id: string;
  user_id: string;
  created_at: string;
};

type BrowserDbState = {
  companions: BrowserCompanion[];
  session_history: BrowserSessionHistory[];
  bookmarks: BrowserBookmark[];
};

const seedCompanions: BrowserCompanion[] = [
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

const defaultState = (): BrowserDbState => ({
  companions: seedCompanions,
  session_history: [],
  bookmarks: [],
});

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toSearchableValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value.join(" ");
  return value ?? "";
};

const ensureBrowserContext = () => {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is only available in client components.");
  }
};

const loadBrowserDb = (): BrowserDbState => {
  ensureBrowserContext();

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const state = defaultState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BrowserDbState>;

    return {
      companions: Array.isArray(parsed.companions) ? parsed.companions : [],
      session_history: Array.isArray(parsed.session_history)
        ? parsed.session_history
        : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    };
  } catch {
    const state = defaultState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
};

const saveBrowserDb = (state: BrowserDbState) => {
  ensureBrowserContext();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getCompanionBookmarks = (state: BrowserDbState, userId?: string) => {
  if (!userId) return new Set<string>();

  return new Set(
    state.bookmarks
      .filter((bookmark) => bookmark.user_id === userId)
      .map((bookmark) => bookmark.companion_id),
  );
};

const hydrateCompanion = (
  companion: BrowserCompanion,
  bookmarked: boolean,
) => ({
  ...companion,
  bookmarked,
});

export const createBrowserCompanion = (
  formData: CreateCompanion,
  author: string,
  userId?: string,
) => {
  const state = loadBrowserDb();

  const companion: BrowserCompanion = {
    id: createId(),
    name: formData.name,
    subject: formData.subject,
    topic: formData.topic,
    duration: formData.duration,
    voice: formData.voice,
    style: formData.style,
    author,
    bookmarked: false,
    created_at: new Date().toISOString(),
  };

  state.companions.unshift(companion);
  saveBrowserDb(state);

  const bookmarked = getCompanionBookmarks(state, userId).has(companion.id);
  return hydrateCompanion(companion, bookmarked);
};

export const getBrowserAllCompanions = (
  { limit = 10, page = 1, subject, topic }: GetAllCompanions,
  userId?: string,
) => {
  const state = loadBrowserDb();
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

export const getBrowserCompanion = (id: string, userId?: string) => {
  const state = loadBrowserDb();
  const companion = state.companions.find((entry) => entry.id === id);

  if (!companion) return null;

  return hydrateCompanion(
    companion,
    getCompanionBookmarks(state, userId).has(companion.id),
  );
};

export const addBrowserSessionHistory = (
  companionId: string,
  userId: string,
) => {
  const state = loadBrowserDb();

  const entry: BrowserSessionHistory = {
    id: createId(),
    companion_id: companionId,
    user_id: userId,
    created_at: new Date().toISOString(),
  };

  state.session_history.unshift(entry);
  saveBrowserDb(state);

  return entry;
};

export const getBrowserRecentSessions = (limit = 10, userId?: string) => {
  const state = loadBrowserDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  const companions = state.session_history
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit)
    .map((entry) =>
      state.companions.find((companion) => companion.id === entry.companion_id),
    )
    .filter((companion): companion is BrowserCompanion => Boolean(companion));

  return companions.map((companion) =>
    hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
  );
};

export const getBrowserUserSessions = (userId: string, limit = 10) => {
  const state = loadBrowserDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  const companions = state.session_history
    .filter((entry) => entry.user_id === userId)
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, limit)
    .map((entry) =>
      state.companions.find((companion) => companion.id === entry.companion_id),
    )
    .filter((companion): companion is BrowserCompanion => Boolean(companion));

  return companions.map((companion) =>
    hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
  );
};

export const getBrowserUserCompanions = (userId: string) => {
  const state = loadBrowserDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  return state.companions
    .filter((companion) => companion.author === userId)
    .map((companion) =>
      hydrateCompanion(companion, bookmarkedCompanionIds.has(companion.id)),
    );
};

export const addBrowserBookmark = (companionId: string, userId: string) => {
  const state = loadBrowserDb();

  const alreadyBookmarked = state.bookmarks.some(
    (bookmark) =>
      bookmark.companion_id === companionId && bookmark.user_id === userId,
  );

  if (!alreadyBookmarked) {
    state.bookmarks.unshift({
      id: createId(),
      companion_id: companionId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    saveBrowserDb(state);
  }

  return { companion_id: companionId, user_id: userId };
};

export const removeBrowserBookmark = (companionId: string, userId: string) => {
  const state = loadBrowserDb();

  state.bookmarks = state.bookmarks.filter(
    (bookmark) =>
      !(bookmark.companion_id === companionId && bookmark.user_id === userId),
  );

  saveBrowserDb(state);

  return { companion_id: companionId, user_id: userId };
};

export const getBrowserBookmarkedCompanions = (userId: string) => {
  const state = loadBrowserDb();
  const bookmarkedCompanionIds = getCompanionBookmarks(state, userId);

  return state.companions
    .filter((companion) => bookmarkedCompanionIds.has(companion.id))
    .map((companion) => hydrateCompanion(companion, true));
};
