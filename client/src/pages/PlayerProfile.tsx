import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, Player, Session } from '../lib/api';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const [player, setPlayer] = useState<Player | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.players.get(pid),
      api.sessions.list(),
    ]).then(([p, ss]) => {
      setPlayer(p);
      // Filter sessions where this player participated (we'll show them via session results later)
      setSessions(ss);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [pid]);

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>;
  if (!player) return <div className="p-8 text-gray-500">Player not found.</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/players" className="hover:text-gray-700">Players</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{player.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {player.avatar_path ? (
            <img src={player.avatar_path} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-3xl">◉</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Member since {player.created_at?.slice(0, 10)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Points" value={player.total_points ?? 0} />
        <StatCard label="Sessions" value={player.total_sessions ?? 0} />
        <StatCard label="Wins" value={player.wins ?? 0} />
        <StatCard label="Win Rate" value={`${player.win_rate ?? 0}%`} />
      </div>

      {/* Session history placeholder */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400">No sessions found.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Game</th>
                  <th className="px-4 py-3 text-right">Players</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.slice(0, 20).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.played_at}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <Link to={`/library/${s.game_id}`} className="hover:text-brand-600">{s.game_name}</Link>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{s.player_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
