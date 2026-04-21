import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices } from 'lucide-react';
import { api, Game, LeaderboardEntry, MostPlayedGame } from '../lib/api';

export default function Dashboard() {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [mostPlayed, setMostPlayed] = useState<MostPlayedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.games.list({ sort: 'date_added', order: 'desc' }),
      api.stats.leaderboard(),
      api.stats.mostPlayed(),
    ]).then(([games, lb, mp]) => {
      setRecentGames(games.slice(0, 5));
      setLeaderboard(lb.slice(0, 5));
      setMostPlayed(mp.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 md:p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground">Home</h1>

      {/* Leaderboard snippet */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Top Players</h2>
          <Link to="/leaderboard" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions logged yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((e, i) => (
                    <tr key={e.player_id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/players/${e.player_id}`} className="hover:text-primary">{e.player_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{e.total_points}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{e.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recently added */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recently Added</h2>
          <Link to="/library" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        {recentGames.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-3">No games yet.</p>
            <Link to="/library/new" className="text-primary hover:underline text-sm">Add your first game →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recentGames.map(g => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        )}
      </section>

      {/* Most played */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Most Played</h2>
        {mostPlayed.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions logged yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {mostPlayed.map(g => (
              <Link key={g.id} to={`/library/${g.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-muted">
                  {g.cover_image_path && (
                    <img src={g.cover_image_path} alt={g.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.session_count} sessions</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Link to={`/library/${game.id}`}
      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-muted flex items-center justify-center">
        {game.cover_image_path ? (
          <img src={game.cover_image_path} alt={game.name} className="w-full h-full object-cover" />
        ) : (
          <Dices size={32} className="text-muted-foreground/40" />
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate">{game.name}</p>
        {game.min_players && game.max_players && (
          <p className="text-xs text-muted-foreground mt-1">{game.min_players}–{game.max_players} players</p>
        )}
      </div>
    </Link>
  );
}
