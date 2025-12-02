import React, { useMemo } from 'react';

/**
 * Search/filter/sort toolbar.
 */
// PUBLIC_INTERFACE
export default function SearchBar({
  query,
  setQuery,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
  allTags = [],
  onAddNote,
}) {
  /** Toolbar to control search and filters. */
  const uniqueTags = useMemo(() => Array.from(new Set(allTags)).sort(), [allTags]);

  return (
    <div className="toolbar">
      <div className="toolbar__left">
        <div className="input-wrap">
          <input
            className="input"
            placeholder="Search title or content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <div className="select-wrap">
          <select
            className="select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {uniqueTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrap">
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort notes"
          >
            <option value="updated_desc">Updated (newest)</option>
            <option value="updated_asc">Updated (oldest)</option>
            <option value="title_asc">Title (A–Z)</option>
            <option value="title_desc">Title (Z–A)</option>
          </select>
        </div>
      </div>
      <div className="toolbar__right">
        <button className="btn btn--primary" onClick={onAddNote}>
          + New Note
        </button>
      </div>
    </div>
  );
}
