import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

export default function ChatPage() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/matches/${matchId}/messages`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error("Match not found");
      nav("/app/matches");
    } finally {
      setLoading(false);
    }
  }, [matchId, nav]);

  useEffect(() => { load(); }, [load]);

  const messagesLen = data?.messages?.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesLen]);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await api.get(`/matches/${matchId}/messages`);
        setData(res.data);
      } catch (err) {
        console.warn("Chat poll failed:", err?.message);
      }
    }, 4000);
    return () => clearInterval(t);
  }, [matchId]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const { data: msg } = await api.post(`/matches/${matchId}/messages`, { body });
      setData((d) => ({ ...d, messages: [...d.messages, msg] }));
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="empty"><Loader2 size={32} className="spin" /></div>;
  }

  const other = data.user;
  const photo = other.photos?.[0];
  const avatarStyle = photo ? { backgroundImage: `url("${photo}")` } : undefined;

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <Link to="/app/matches" className="icon-btn" aria-label="Back" data-testid="chat-back-btn">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </Link>
        <div className="avatar avatar-sm" style={avatarStyle} />
        <div>
          <div className="chat-header-name">{other.name}</div>
          <div className="chat-header-sub">Say something nice</div>
        </div>
      </div>

      <div className="chat-messages" data-testid="chat-messages">
        {data.messages.length === 0 ? (
          <div className="empty" style={{ minHeight: "auto", marginTop: 40 }}>
            <p className="muted">No messages yet — send the first one.</p>
          </div>
        ) : data.messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.sender_id === user.id ? "me" : "them"}`}>
            <div className="msg">{m.body}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={send}>
        <input
          className="input" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…" data-testid="chat-input"
          maxLength={1000}
        />
        <button type="submit" className="swipe-btn like" style={{ width: 44, height: 44 }}
                disabled={sending || !text.trim()} data-testid="chat-send-btn" aria-label="Send">
          {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} strokeWidth={2.5} />}
        </button>
      </form>
    </div>
  );
}
