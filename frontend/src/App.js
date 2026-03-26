import React, { useState, useEffect, useCallback } from "react";
import { getNotes, createNote, updateNote, deleteNote, uploadToS3 } from "./api";
import "./App.css";

// ── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!window.confirm("Delete this note?")) return;
    setDeleting(true);
    await onDelete(note.id);
  };
  return (
    <div className={`card ${deleting ? "card--deleting" : ""}`}>
      <div className="card__header">
        <h3 className="card__title">{note.title}</h3>
        <span className="card__date">
          {new Date(note.created_at).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </span>
      </div>
      {note.description && <p className="card__desc">{note.description}</p>}
      {note.file_url && (
        <a className="card__file" href={note.file_url} target="_blank" rel="noreferrer">
          📎 Attachment
        </a>
      )}
      <div className="card__actions">
        <button className="btn btn--ghost" onClick={() => onEdit(note)}>Edit</button>
        <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ── NoteModal ─────────────────────────────────────────────────────────────────
function NoteModal({ note, onClose, onSaved }) {
  const isEdit = Boolean(note?.id);
  const [title, setTitle] = useState(note?.title || "");
  const [description, setDescription] = useState(note?.description || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      if (file) fd.append("file", file);
      if (isEdit) {
        await updateNote(note.id, fd);
      } else {
        await createNote(fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.title?.[0] || "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{isEdit ? "Edit Note" : "New Note"}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          {error && <p className="form-error">{error}</p>}
          <label className="form-label">
            Title <span className="required">*</span>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              autoFocus
            />
          </label>
          <label className="form-label">
            Description
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={4}
            />
          </label>
          <label className="form-label">
            Attachment (uploads to S3)
            <input
              className="form-input form-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── S3 Upload Demo ────────────────────────────────────────────────────────────
function S3Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setResult(null); setError("");
    try {
      const res = await uploadToS3(file);
      setResult(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="s3-panel">
      <h3 className="s3-panel__title">⚡ Direct S3 Upload Demo</h3>
      <p className="s3-panel__sub">Uploads directly to AWS S3 bucket (separate from note attachments)</p>
      <div className="s3-panel__row">
        <input type="file" className="form-input form-file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn--primary" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading…" : "Upload to S3"}
        </button>
      </div>
      {result && (
        <p className="s3-panel__result">
          ✅ Uploaded: <a href={result} target="_blank" rel="noreferrer">{result}</a>
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | noteObject

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotes();
      setNotes(res.data.results || res.data);
      setError("");
    } catch {
      setError("Could not connect to the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSaved = () => { setModal(null); fetchNotes(); };
  const handleDelete = async (id) => { await deleteNote(id); fetchNotes(); };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <span className="header__logo">📝</span>
            <div>
              <h1 className="header__title">NoteVault</h1>
              <p className="header__sub">AWS Cloud Engineer Assessment · CRUD App</p>
            </div>
          </div>
          <button className="btn btn--primary btn--lg" onClick={() => setModal("new")}>
            + New Note
          </button>
        </div>
      </header>

      <main className="main">
        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat">
            <span className="stat__val">{notes.length}</span>
            <span className="stat__label">Total Notes</span>
          </div>
          <div className="stat">
            <span className="stat__val">{notes.filter(n => n.file_url).length}</span>
            <span className="stat__label">With Files</span>
          </div>
          <div className="stat">
            <span className="stat__val">
              {notes.length > 0
                ? new Date(notes[0].created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : "–"}
            </span>
            <span className="stat__label">Latest</span>
          </div>
        </div>

        {/* S3 demo panel */}
        <S3Upload />

        {/* Notes grid */}
        {loading && <div className="spinner-wrap"><div className="spinner" /></div>}
        {!loading && error && <div className="alert alert--error">{error}</div>}
        {!loading && !error && notes.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">📭</span>
            <p>No notes yet. Create your first one!</p>
            <button className="btn btn--primary" onClick={() => setModal("new")}>Create Note</button>
          </div>
        )}
        {!loading && notes.length > 0 && (
          <div className="grid">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} onEdit={(note) => setModal(note)} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {modal && (
        <NoteModal
          note={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
