import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trash2, Users, Heart, MessageCircle, Hand } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="admin-stat" data-testid={`stat-${label}`}>
      <div className="admin-stat-icon"><Icon size={20} strokeWidth={2.3} /></div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch {
      toast.error("Could not load users");
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} (${u.email})? This also removes their matches and messages.`)) return;
    setBusy(u.id);
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success("User deleted");
      setUsers((arr) => arr.filter((x) => x.id !== u.id));
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  if (!users) return <div className="empty"><Loader2 size={32} className="spin" /></div>;

  return (
    <ul className="admin-list">
      {users.map((u) => (
        <li key={u.id} className="admin-row" data-testid={`admin-user-${u.id}`}>
          <div className="avatar avatar-sm" style={u.photo ? { backgroundImage: `url("${u.photo}")` } : {}} />
          <div className="admin-row-main">
            <div className="admin-row-title">
              {u.name}, {u.age}
              {u.isAdmin && <span className="admin-tag">ADMIN</span>}
            </div>
            <div className="admin-row-sub">
              {u.email} · {u.gender} → {u.interestedIn}{u.city ? ` · ${u.city}` : ""}
            </div>
          </div>
          {!u.isAdmin && (
            <button
              className="icon-btn admin-delete"
              onClick={() => remove(u)}
              disabled={busy === u.id}
              aria-label={`Delete ${u.name}`}
              data-testid={`admin-delete-${u.id}`}
            >
              {busy === u.id ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function MatchesTab() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.get("/admin/matches").then((r) => setItems(r.data)).catch(() => toast.error("Could not load matches"));
  }, []);
  if (!items) return <div className="empty"><Loader2 size={32} className="spin" /></div>;
  if (items.length === 0) return <div className="empty"><p className="muted">No matches yet.</p></div>;
  return (
    <ul className="admin-list">
      {items.map((m) => (
        <li key={m.matchId} className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-title">{m.user1.name} ↔ {m.user2.name}</div>
            <div className="admin-row-sub">{m.messageCount} messages · {new Date(m.createdAt).toLocaleString("bg-BG")}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MessagesTab() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.get("/admin/messages").then((r) => setItems(r.data)).catch(() => toast.error("Could not load messages"));
  }, []);
  if (!items) return <div className="empty"><Loader2 size={32} className="spin" /></div>;
  if (items.length === 0) return <div className="empty"><p className="muted">No messages yet.</p></div>;
  return (
    <ul className="admin-list">
      {items.map((m) => (
        <li key={m.id} className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-title">{m.sender.name}</div>
            <div className="admin-row-sub">{m.body}</div>
            <div className="admin-row-hint">{new Date(m.createdAt).toLocaleString("bg-BG")}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) return;
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  }, [user]);

  if (!user) return null;
  if (!user.isAdmin) return <Navigate to="/app/swipe" replace />;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/app/swipe" className="icon-btn" aria-label="Back to app">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </Link>
        <div className="admin-title">Admin · crush</div>
        <button className="btn btn-ghost" onClick={logout} style={{ height: 36, padding: "0 14px" }} data-testid="admin-logout-btn">
          Log out
        </button>
      </header>

      <div className="admin-stats">
        <Stat icon={Users} label="users" value={stats?.users ?? "…"} />
        <Stat icon={Heart} label="matches" value={stats?.matches ?? "…"} />
        <Stat icon={MessageCircle} label="messages" value={stats?.messages ?? "…"} />
        <Stat icon={Hand} label="swipes" value={stats?.swipes ?? "…"} />
      </div>

      <div className="admin-tabs">
        {[
          { k: "users", l: "Users" },
          { k: "matches", l: "Matches" },
          { k: "messages", l: "Messages" },
        ].map((t) => (
          <button
            key={t.k}
            className={`admin-tab ${tab === t.k ? "active" : ""}`}
            onClick={() => setTab(t.k)}
            data-testid={`admin-tab-${t.k}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === "users" && <UsersTab />}
        {tab === "matches" && <MatchesTab />}
        {tab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}
