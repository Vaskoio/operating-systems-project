import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/matches");
        setMatches(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="page-title">Matches</h1>
      {loading ? (
        <div className="empty"><Loader2 size={32} className="spin" /></div>
      ) : matches.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><MessageCircle size={40} strokeWidth={2.3} /></div>
          <h3>No matches yet</h3>
          <p>Start swiping to find people who like you back.</p>
          <Link to="/app/swipe" className="btn btn-primary">Start swiping</Link>
        </div>
      ) : (
        <ul className="match-list" data-testid="match-list">
          {matches.map((m) => {
            const photo = m.user.photos?.[0];
            const last = m.lastMessage;
            const preview = last ? last.body : "You matched! Say hi 👋";
            return (
              <li key={m.matchId}>
                <Link to={`/app/chat/${m.matchId}`} className="match-row" data-testid={`match-row-${m.matchId}`}>
                  <div className="avatar" style={photo ? { backgroundImage: `url("${photo}")` } : {}} />
                  <div className="match-meta">
                    <div className="match-name">
                      {m.user.name}, {m.user.age}
                      {!last && <span className="match-badge">NEW</span>}
                    </div>
                    <div className="match-preview">{preview}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
