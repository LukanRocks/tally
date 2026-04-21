import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Game, HeadToHead, LeaderboardEntry, MostPlayedGame, Player } from '../lib/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [mostPlayed, setMostPlayed] = useState<MostPlayedGame[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGame, setSelectedGame] = useState<number>(0);
  const [gameLeaderboard, setGameLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [p1, setP1] = useState<number>(0);
  const [p2, setP2] = useState<number>(0);
  const [h2h, setH2H] = useState<HeadToHead | null>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.stats.leaderboard(),
      api.stats.mostPlayed(),
      api.games.list(),
      api.players.list(),
    ]).then(([lb, mp, g, p]) => {
      setLeaderboard(lb);
      setMostPlayed(mp);
      setGames(g);
      setPlayers(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedGame) { setGameLeaderboard([]); return; }
    api.stats.leaderboardByGame(selectedGame).then(setGameLeaderboard);
  }, [selectedGame]);

  async function fetchH2H() {
    if (!p1 || !p2 || p1 === p2) return;
    setH2hLoading(true);
    const data = await api.stats.headToHead(p1, p2).catch(() => null);
    setH2H(data);
    setH2hLoading(false);
  }

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-5xl space-y-12">
      <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>

      {/* Global rankings */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Global Rankings</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400">No sessions logged yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-right">Points</th>
                  <th className="px-4 py-3 text-right">Wins</th>
                  <th className="px-4 py-3 text-right">Sessions</th>
                  <th className="px-4 py-3 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((e, i) => (
                  <tr key={e.player_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {e.avatar_path && (
                          <img src={e.avatar_path} alt={e.player_name} className="w-7 h-7 rounded-full object-cover" />
                        )}
                        <Link to={`/players/${e.player_id}`} className="font-medium hover:text-brand-600">{e.player_name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{e.total_points}</td>
                    <td className="px-4 py-3 text-right">{e.wins}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{e.total_sessions}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{e.win_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Most played */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Most Played Games</h2>
        {mostPlayed.length === 0 ? (
          <p className="text-sm text-gray-400">No sessions yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Game</th>
                  <th className="px-4 py-3 text-right">Sessions</th>
                  <th className="px-4 py-3 text-right">Unique Players</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mostPlayed.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {g.cover_image_path && (
                          <img src={g.cover_image_path} alt={g.name} className="w-8 h-10 rounded object-cover" />
                        )}
                        <Link to={`/library/${g.id}`} className="font-medium hover:text-brand-600">{g.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{g.session_count}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{g.unique_players}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Per-game leaderboard */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Per-Game Leaderboard</h2>
        <select value={selectedGame} onChange={e => setSelectedGame(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value={0}>Select a game…</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {selectedGame > 0 && (
          gameLeaderboard.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions for this game.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right">Wins</th>
                    <th className="px-4 py-3 text-right">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gameLeaderboard.map((e, i) => (
                    <tr key={e.player_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/players/${e.player_id}`} className="hover:text-brand-600">{e.player_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{e.total_points}</td>
                      <td className="px-4 py-3 text-right">{e.wins}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{e.total_sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {/* Head-to-head */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Head-to-Head</h2>
        <div className="flex gap-3 mb-4">
          <select value={p1} onChange={e => setP1(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value={0}>Player 1…</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span className="flex items-center text-gray-400 font-bold">vs</span>
          <select value={p2} onChange={e => setP2(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value={0}>Player 2…</option>
            {players.filter(p => p.id !== p1).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={fetchH2H} disabled={!p1 || !p2 || h2hLoading}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
            Compare
          </button>
        </div>

        {h2h && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="font-bold text-lg">{h2h.player1.name}</p>
                <p className="text-3xl font-black text-brand-600 mt-1">{h2h.p1_wins}</p>
                <p className="text-xs text-gray-500">wins</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">{h2h.shared_sessions} shared sessions</p>
              </div>
              <div>
                <p className="font-bold text-lg">{h2h.player2.name}</p>
                <p className="text-3xl font-black text-brand-600 mt-1">{h2h.p2_wins}</p>
                <p className="text-xs text-gray-500">wins</p>
              </div>
            </div>
            {h2h.sessions.length > 0 && (
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="pb-2 text-left">Date</th>
                    <th className="pb-2 text-left">Game</th>
                    <th className="pb-2 text-center">{h2h.player1.name}</th>
                    <th className="pb-2 text-center">{h2h.player2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {h2h.sessions.map(s => (
                    <tr key={s.session_id}>
                      <td className="py-2">{s.played_at}</td>
                      <td className="py-2 text-gray-700">{s.game_name}</td>
                      <td className="py-2 text-center">
                        <span className={s.p1_rank < s.p2_rank ? 'font-bold text-green-600' : 'text-gray-500'}>
                          #{s.p1_rank} ({s.p1_points}pts)
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <span className={s.p2_rank < s.p1_rank ? 'font-bold text-green-600' : 'text-gray-500'}>
                          #{s.p2_rank} ({s.p2_points}pts)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
