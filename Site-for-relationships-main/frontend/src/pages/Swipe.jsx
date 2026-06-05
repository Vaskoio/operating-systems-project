import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Loader2, RefreshCw } from "lucide-react";
import SwipeCard from "../components/SwipeCard";
import { api } from "../lib/api";
import { toast } from "../components/Toast";

function MatchModal({ match, onClose, onOpenChat }) {
  if (!match) return null;
  const photo = match.user?.photos?.[0];
  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="match-dialog">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>It's a match!</h2>
        <p style={{ opacity: 0.9, marginTop: 6 }}>You and {match.user?.name} liked each other.</p>
        {photo && <div className="modal-avatar" style={{ backgroundImage: `url("${photo}")` }} />}
        <div className="modal-actions">
          <button className="btn btn-on-brand" onClick={onClose} data-testid="keep-swiping-btn">Keep swiping</button>
          <button className="btn btn-white" onClick={onOpenChat} data-testid="send-message-btn">Send a message</button>
        </div>
      </div>
    </div>
  );
}

export default function SwipePage() {
  const [cands, setCands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/feed");
      setCands(data);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doSwipe = useCallback(async (targetId, liked) => {
    if (busy) return;
    setBusy(true);
    setCands((cs) => cs.filter((c) => c.id !== targetId));
    try {
      const { data } = await api.post("/swipes", { targetId, liked });
      if (data.match) setMatch(data.matchInfo);
    } catch {
      toast.error("Swipe failed");
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const top = cands[0];

  return (
    <div className="swipe-wrap">
      {loading ? (
        <div className="empty"><Loader2 size={32} className="spin" /><p className="muted">Finding people…</p></div>
      ) : cands.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Heart size={40} strokeWidth={2.3} /></div>
          <h3>You're all caught up</h3>
          <p>No more profiles in your area right now. Check back soon or tweak your filters.</p>
          <div className="row">
            <button className="btn btn-primary" onClick={load} data-testid="refresh-feed-btn">
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-outline" onClick={() => nav("/app/settings")}>Filters</button>
          </div>
        </div>
      ) : (
        <>
          <div className="deck">
            <AnimatePresence>
              {cands.slice(0, 3).reverse().map((p, fromEnd, arr) => {
                const i = arr.length - 1 - fromEnd;
                const isTop = i === 0;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1 - i * 0.04, y: i * 8, opacity: 1 }}
                    exit={{ x: 400, opacity: 0, transition: { duration: 0.25 } }}
                    style={{ position: "absolute", inset: 0, pointerEvents: isTop ? "auto" : "none", zIndex: 10 - i }}
                  >
                    <SwipeCard profile={p} onSwipe={doSwipe} isTop={isTop} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="swipe-actions">
            <button className="swipe-btn nope" onClick={() => top && doSwipe(top.id, false)} data-testid="swipe-nope-btn" aria-label="Nope">
              <X size={28} strokeWidth={3} />
            </button>
            <button className="swipe-btn like" onClick={() => top && doSwipe(top.id, true)} data-testid="swipe-like-btn" aria-label="Like">
              <Heart size={28} strokeWidth={3} fill="currentColor" />
            </button>
          </div>
        </>
      )}

      <MatchModal
        match={match}
        onClose={() => setMatch(null)}
        onOpenChat={() => { const id = match.matchId; setMatch(null); nav(`/app/chat/${id}`); }}
      />
    </div>
  );
}
