'use client';

import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/lib/api';

const emptyProject: Partial<Project> = {
  title: '', description: '', long_description: '',
  tech_stack: [], capabilities: [],
  demo_video_url: '', github_url: '', live_url: '',
  is_featured: true, order_index: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [capInput, setCapInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    projectsApi.getMine().then(setProjects).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyProject);
    setTechInput('');
    setCapInput('');
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({ ...p });
    setTechInput('');
    setCapInput('');
    setShowForm(true);
  }

  function addTag(field: 'tech_stack' | 'capabilities', value: string) {
    if (!value.trim()) return;
    setForm(f => ({ ...f, [field]: [...(f[field] as string[] || []), value.trim()] }));
    if (field === 'tech_stack') setTechInput('');
    else setCapInput('');
  }

  function removeTag(field: 'tech_stack' | 'capabilities', idx: number) {
    setForm(f => ({ ...f, [field]: (f[field] as string[]).filter((_, i) => i !== idx) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        const updated = await projectsApi.update(editing.id, form);
        setProjects(ps => ps.map(p => p.id === editing.id ? updated : p));
      } else {
        const created = await projectsApi.create(form);
        setProjects(ps => [created, ...ps]);
      }
      setShowForm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await projectsApi.delete(id);
    setProjects(ps => ps.filter(p => p.id !== id));
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage what appears on your public portfolio.</p>
        </div>
        <button id="add-project-btn" className="btn-primary" onClick={openCreate} style={{ padding: '12px 24px' }}>
          + Add Project
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No projects yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add your first project to showcase on your portfolio.</p>
          <button className="btn-primary" onClick={openCreate} style={{ padding: '12px 24px' }}>Add your first project</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.map((p) => {
            const tech: string[] = Array.isArray(p.tech_stack) ? p.tech_stack : [];
            const caps: string[] = Array.isArray(p.capabilities) ? p.capabilities : [];
            return (
              <div key={p.id} className="glass-card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</h3>
                    {p.is_featured && <span className="badge" style={{ fontSize: 11 }}>⭐ Featured</span>}
                    {p.view_count && p.view_count > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👁️ {p.view_count} views</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{p.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {tech.map(t => <span key={t} className="tech-pill">{t}</span>)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                    {p.demo_video_url && <span>▶ Demo</span>}
                    {p.github_url && <span>⬡ GitHub</span>}
                    {p.live_url && <span>🚀 Live</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button id={`edit-${p.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => openEdit(p)}>Edit</button>
                  <button id={`delete-${p.id}`} onClick={() => p.id && handleDelete(p.id)}
                    style={{ padding: '8px 16px', fontSize: 13, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', borderRadius: 10, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 640, padding: 40, position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{editing ? 'Edit Project' : 'Add Project'}</h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title *</label>
                <input id="proj-title" className="input-field" type="text" required value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="AI Chatbot Platform" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Short Description *</label>
                <textarea id="proj-desc" className="input-field" required rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Production-grade AI chatbot with RAG..." style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Description</label>
                <textarea id="proj-longdesc" className="input-field" rows={4} value={form.long_description || ''} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} placeholder="Detailed description shown when expanded..." style={{ resize: 'vertical' }} />
              </div>

              {/* Tech stack */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tech Stack</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input id="tech-input" className="input-field" value={techInput} onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('tech_stack', techInput); } }}
                    placeholder="Python (press Enter to add)" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => addTag('tech_stack', techInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(form.tech_stack as string[] || []).map((t, i) => (
                    <span key={i} className="tech-pill" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => removeTag('tech_stack', i)}>
                      {t} <span style={{ color: '#f43f5e', fontSize: 12 }}>×</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capabilities</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input id="cap-input" className="input-field" value={capInput} onChange={e => setCapInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('capabilities', capInput); } }}
                    placeholder="Authentication (press Enter to add)" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => addTag('capabilities', capInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(form.capabilities as string[] || []).map((c, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => removeTag('capabilities', i)}>
                      ✓ {c} <span style={{ color: '#f43f5e', fontSize: 12 }}>×</span>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Video URL</label>
                  <input id="proj-demo" className="input-field" type="url" value={form.demo_video_url || ''} onChange={e => setForm(f => ({ ...f, demo_video_url: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GitHub URL</label>
                  <input id="proj-github" className="input-field" type="url" value={form.github_url || ''} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live URL</label>
                  <input id="proj-live" className="input-field" type="url" value={form.live_url || ''} onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))} placeholder="https://yourapp.vercel.app" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thumbnail URL</label>
                  <input id="proj-thumbnail" className="input-field" type="url" value={form.thumbnail_url || ''} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Index</label>
                  <input id="proj-order" className="input-field" type="number" value={form.order_index ?? 0} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) }))} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input id="proj-featured" type="checkbox" checked={form.is_featured ?? true} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                <label htmlFor="proj-featured" style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show as featured project on portfolio</label>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button id="save-project-btn" className="btn-primary" type="submit" disabled={saving} style={{ flex: 1, padding: '14px', fontSize: 15 }}>
                  {saving ? 'Saving...' : (editing ? 'Update Project' : 'Add Project')}
                </button>
                <button type="button" className="btn-secondary" style={{ padding: '14px 24px' }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
