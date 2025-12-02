import React from 'react';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString();
}

/**
 * Render a grid of note cards.
 */
// PUBLIC_INTERFACE
export default function NotesList({ notes, onEdit, onDelete }) {
  /** List of note cards with actions. */
  if (!notes || notes.length === 0) {
    return (
      <div className="empty">
        <div className="empty__card">
          <div className="empty__icon">🌊</div>
          <div className="empty__title">No notes yet</div>
          <div className="empty__desc">Start by creating your first note.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {notes.map((n) => (
        <article key={n.id} className="card">
          <header className="card__header">
            <h3 className="card__title" title={n.title}>{n.title || 'Untitled'}</h3>
            <div className="card__meta">Updated {formatTime(n.updatedAt)}</div>
          </header>
          <div className="card__body">
            <p className="card__excerpt">
              {n.content?.length > 160 ? `${n.content.slice(0, 160)}…` : n.content}
            </p>
            {n.tags?.length ? (
              <div className="tags">
                {n.tags.map((t) => (
                  <span key={`${n.id}-${t}`} className="tag">#{t}</span>
                ))}
              </div>
            ) : null}
          </div>
          <footer className="card__footer">
            <button className="btn btn--secondary" onClick={() => onEdit(n)}>Edit</button>
            <button
              className="btn btn--danger"
              onClick={() => onDelete(n)}
              aria-label={`Delete note ${n.title}`}
            >
              Delete
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}
