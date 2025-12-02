import React, { useEffect, useState } from 'react';

/**
 * Modal for adding or editing a note.
 */
// PUBLIC_INTERFACE
export default function NoteFormModal({ open, onClose, onSave, initial }) {
  /** Render modal form for creating or editing a note. */
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') || '');

  useEffect(() => {
    setTitle(initial?.title || '');
    setContent(initial?.content || '');
    setTags(initial?.tags?.join(', ') || '');
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'Untitled',
      content,
      tags,
    });
  };

  return (
    <div className="modal__backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal__header">
          <h3 className="modal__title">{initial ? 'Edit Note' : 'New Note'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <form className="modal__body" onSubmit={handleSubmit}>
          <label className="label">
            <span className="label__text">Title</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </label>
          <label className="label">
            <span className="label__text">Content</span>
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note…"
              rows={8}
            />
          </label>
          <label className="label">
            <span className="label__text">Tags (comma separated)</span>
            <input
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. work, ideas, personal"
            />
          </label>
          <footer className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {initial ? 'Save Changes' : 'Create'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
