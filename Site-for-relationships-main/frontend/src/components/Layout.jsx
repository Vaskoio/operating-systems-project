import { Outlet, useLocation, NavLink, Link } from "react-router-dom";
import { Heart, Settings, User, MessageCircle } from "lucide-react";

function Header() {
  return (
    <header className="header" data-testid="app-header">
      <Link to="/app/swipe" className="brand">
        <Heart className="brand-icon" size={24} strokeWidth={2.5} fill="currentColor" />
        <span>HeadOverHeels</span>
      </Link>
      <div className="header-right">
        <Link to="/app/settings" className="icon-btn" aria-label="Settings" data-testid="settings-link">
          <Settings size={20} strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const items = [
    { to: "/app/swipe", label: "Discover", Icon: Heart, id: "nav-swipe" },
    { to: "/app/matches", label: "Matches", Icon: MessageCircle, id: "nav-matches" },
    { to: "/app/profile", label: "Profile", Icon: User, id: "nav-profile" },
  ];
  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(({ to, label, Icon, id }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={id}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={24} strokeWidth={2.3} />
            <span className="nav-item-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function Layout() {
  const loc = useLocation();
  const isChat = loc.pathname.startsWith("/app/chat/");
  if (isChat) return <Outlet />;
  return (
    <div className="app-shell with-nav">
      <Header />
      <Outlet />
      <BottomNav />
    </div>
  );
}
