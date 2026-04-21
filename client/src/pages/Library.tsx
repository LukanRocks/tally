import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Plus } from 'lucide-react';
import { api, Game } from '../lib/api';

export default function Library() {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [minPlayers, setMinPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.games.list({
      search: search || undefined,
      sort,
      order,
      minPlayers: minPlayers ? Number(minPlayers) : undefined,
      maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
    }).then(data => {
      setGames(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, sort, order, minPlayers, maxPlayers]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Game Library</h1>
        <Link to="/library/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
          <Plus size={14} /> Add Game
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search games…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="name">Name</option>
          <option value="date_added">Date Added</option>
          <option value="most_played">Most Played</option>
          <option value="price">Price</option>
        </select>
        <select value={order} onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <input type="number" placeholder="Min players" value={minPlayers}
          onChange={e => setMinPlayers(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <input type="number" placeholder="Max players" value={maxPlayers}
          onChange={e => setMaxPlayers(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Dices size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-3">{search ? 'No games match your search.' : 'Your library is empty.'}</p>
          {!search && (
            <Link to="/library/new" className="text-brand-600 hover:underline text-sm">Add your first game →</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {games.map(game => (
            <Link key={game.id} to={`/library/${game.id}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                {game.cover_image_path ? (
                  <img src={game.cover_image_path} alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                ) : (
                  <Dices size={36} className="text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm leading-tight truncate">{game.name}</p>
                {game.min_players && game.max_players && (
                  <p className="text-xs text-gray-500 mt-1">{game.min_players}–{game.max_players} players</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{game.session_count ?? 0} sessions</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
