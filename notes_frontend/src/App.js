import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import NavBar from './components/NavBar';
import SearchBar from './components/SearchBar';
import NotesList from './components/NotesList';
import NoteFormModal from './components/NoteFormModal';
import { initDataService } from './services/dataService';

// PUBLIC_INTERFACE
function App() {
  /** Notes Manager single-page app with Ocean Professional styling. */
  const [svc, setSvc] = useState(null);
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  // Initialize data service and load notes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await initDataService();
        if (!mounted) return;
        setSvc(s);
        const data = await s.listNotes();
        if (!mounted) return;
        setNotes(data);
      } catch (e) {
        setError('Failed to load notes. Falling back to local storage.');
        // If init fails, fallback to local by reinvoking
        const sLocal = await initDataService();
        if (!mounted) return;
        setSvc(sLocal);
        const data = await sLocal.listNotes();
        if (!mounted) return;
        setNotes(data);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const allTags = useMemo(
    () => notes.flatMap((n) => n.tags || []),
    [notes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = notes.filter((n) => {
      const matchesQ =
        !q ||
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q);
      const matchesTag =
        !selectedTag || (n.tags || []).map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase());
      return matchesQ && matchesTag;
    });

    switch (sortBy) {
      case 'updated_asc':
        res = res.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
        break;
      case 'title_asc':
        res = res.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title_desc':
        res = res.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'updated_desc':
      default:
        res = res.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return res;
  }, [notes, query, selectedTag, sortBy]);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async (payload) => {
    if (!svc) return;
    try {
      if (editing) {
        const updated = await svc.updateNote(editing.id, payload);
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await svc.createNote(payload);
        setNotes((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (e) {
      setError('Save failed. Please try again.');
    }
  };

  const handleDelete = async (note) => {
    if (!svc) return;
    try {
      await svc.deleteNote(note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (e) {
      setError('Delete failed. Please try again.');
    }
  };

  return (
    <div className="app">
      <NavBar />
      <main className="main">
        <div className="container">
          <SearchBar
            query={query}
            setQuery={setQuery}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            sortBy={sortBy}
            setSortBy={setSortBy}
            allTags={allTags}
            onAddNote={openCreate}
          />

          {error ? <div className="alert">{error}</div> : null}

          <NotesList notes={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </main>

      <NoteFormModal
        open={showModal}
        onClose={closeModal}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}

export default App;
