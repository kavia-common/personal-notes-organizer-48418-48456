//
// Data service abstraction for notes with graceful fallback to localStorage.
// Reads optional env vars: REACT_APP_API_BASE, REACT_APP_BACKEND_URL
//

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  '';

const STORAGE_KEY = 'notes_app.v1.items';

// Utility to simulate network delay (used for a smoother UX and parity with future backend)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Try a fetch to the backend base URL to determine availability.
 * Returns true if backend is likely reachable, else false.
 */
async function isBackendAvailable() {
  if (!API_BASE) return false;
  try {
    // Light HEAD/GET request to a health or base path; fallback to GET if HEAD blocked
    const res = await fetch(API_BASE, { method: 'GET', mode: 'cors' });
    return res.ok;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export async function initDataService() {
  /** Initialize service, decide storage mode based on backend availability. */
  const backend = await isBackendAvailable();
  return backend ? backendService : localService;
}

/**
 * Normalize tags: take string or array and output array of trimmed lower-cased unique tags.
 */
function normalizeTags(tags) {
  if (!tags) return [];
  const arr = Array.isArray(tags)
    ? tags
    : String(tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
  const unique = Array.from(new Set(arr.map((t) => t.toLowerCase())));
  return unique;
}

/**
 * Generate a simple id for local items.
 */
function genId() {
  return 'n_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const localService = {
  // PUBLIC_INTERFACE
  async listNotes() {
    /** Return all notes sorted by updatedAt desc. */
    await delay(50);
    const items = readLocal();
    return items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  // PUBLIC_INTERFACE
  async createNote(note) {
    /** Create a new note. note: { title, content, tags?: string|string[] } */
    await delay(50);
    const now = Date.now();
    const item = {
      id: genId(),
      title: note.title?.trim() || 'Untitled',
      content: note.content || '',
      tags: normalizeTags(note.tags),
      createdAt: now,
      updatedAt: now,
    };
    const items = readLocal();
    items.push(item);
    writeLocal(items);
    return item;
  },

  // PUBLIC_INTERFACE
  async updateNote(id, updates) {
    /** Update an existing note by id. */
    await delay(50);
    const items = readLocal();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    const now = Date.now();
    const updated = {
      ...items[idx],
      ...updates,
      tags:
        updates.tags !== undefined ? normalizeTags(updates.tags) : items[idx].tags,
      updatedAt: now,
    };
    items[idx] = updated;
    writeLocal(items);
    return updated;
  },

  // PUBLIC_INTERFACE
  async deleteNote(id) {
    /** Delete a note by id. */
    await delay(50);
    const items = readLocal().filter((n) => n.id !== id);
    writeLocal(items);
    return { success: true };
  },
};

// Simple backend service placeholder for future wiring.
// Methods mirror localService shape. If backend fails, callers should re-init to local.
const backendService = {
  async listNotes() {
    const res = await fetch(`${API_BASE}/notes`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch notes');
    const data = await res.json();
    return data;
  },
  async createNote(note) {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  },
  async updateNote(id, updates) {
    const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  },
  async deleteNote(id) {
    const res = await fetch(`${API_BASE}/notes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete note');
    return { success: true };
  },
};
