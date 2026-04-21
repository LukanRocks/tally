import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, Game } from '../lib/api';

type FormData = {
  name: string;
  description: string;
  quick_rules: string;
  min_players: string;
  max_players: string;
  purchase_at: string;
  price: string;
};

const empty: FormData = {
  name: '',
  description: '',
  quick_rules: '',
  min_players: '',
  max_players: '',
  purchase_at: '',
  price: '',
};

export default function GameForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(empty);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.games.get(Number(id)).then((g: Game) => {
      setForm({
        name: g.name,
        description: g.description ?? '',
        quick_rules: g.quick_rules ?? '',
        min_players: g.min_players != null ? String(g.min_players) : '',
        max_players: g.max_players != null ? String(g.max_players) : '',
        purchase_at: g.purchase_at ?? '',
        price: g.price != null ? String(g.price) : '',
      });
    });
  }, [id, isEdit]);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setError('');
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      quick_rules: form.quick_rules || null,
      min_players: form.min_players ? Number(form.min_players) : null,
      max_players: form.max_players ? Number(form.max_players) : null,
      purchase_at: form.purchase_at || null,
      price: form.price ? Number(form.price) : null,
    };

    try {
      if (isEdit) {
        await api.games.update(Number(id), payload);
        navigate(`/library/${id}`);
      } else {
        const game = await api.games.create(payload as Parameters<typeof api.games.create>[0]);
        navigate(`/library/${game.id}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/library" className="hover:text-gray-700">Library</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{isEdit ? 'Edit Game' : 'Add Game'}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Game' : 'Add Game'}</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Name *" htmlFor="name">
          <input id="name" type="text" value={form.name} onChange={set('name')} required
            className="input" placeholder="Wingspan" />
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea id="description" value={form.description} onChange={set('description')} rows={3}
            className="input resize-none" placeholder="A beautiful engine-builder about birds…" />
        </Field>

        <Field label="Quick Rules" htmlFor="quick_rules">
          <textarea id="quick_rules" value={form.quick_rules} onChange={set('quick_rules')} rows={4}
            className="input resize-none" placeholder="Brief rules summary…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Min Players" htmlFor="min_players">
            <input id="min_players" type="number" min={1} value={form.min_players} onChange={set('min_players')}
              className="input" placeholder="1" />
          </Field>
          <Field label="Max Players" htmlFor="max_players">
            <input id="max_players" type="number" min={1} value={form.max_players} onChange={set('max_players')}
              className="input" placeholder="5" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Purchase Date" htmlFor="purchase_at">
            <input id="purchase_at" type="date" value={form.purchase_at} onChange={set('purchase_at')}
              className="input" />
          </Field>
          <Field label="Price" htmlFor="price">
            <input id="price" type="number" min={0} step="0.01" value={form.price} onChange={set('price')}
              className="input" placeholder="49.99" />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="px-6 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Game'}
          </button>
          <Link to={isEdit ? `/library/${id}` : '/library'}
            className="px-6 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
