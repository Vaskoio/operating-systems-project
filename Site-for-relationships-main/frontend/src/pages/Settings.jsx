import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "../components/Toast";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  
  const [minAge, setMinAge] = useState(user?.minAge ?? user?.MinAge ?? 18);
  const [maxAge, setMaxAge] = useState(user?.maxAge ?? user?.MaxAge ?? 60);
  const [maxDistance, setMaxDistance] = useState(user?.maxDistanceKm ?? user?.MaxDistanceKm ?? 100);
  const [interestedIn, setInterestedIn] = useState(user?.interestedIn ?? user?.InterestedIn ?? "male");
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const save = async () => {
    if (minAge > maxAge) return toast.error("Min age must be ≤ max age");
    setSaving(true);
    try {
      const { data } = await api.put("/profile/me", {
        minAge, maxAge, maxDistanceKm: maxDistance, interestedIn,
        MinAge: minAge, MaxAge: maxAge, InterestedIn: interestedIn
      });
      setUser(data);
      toast.success("Filters saved");
      
      nav("/app/swipe"); 
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    const confirmed = window.confirm(
      "CRITICAL: Are you sure? This will permanently delete all your data."
    );
    
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await api.delete('/profile');
      alert("Your account has been successfully deleted.");
      if (logout) logout(); 
    } catch (error) {
      const message = error.response?.data?.message || "Server error. Please try again later.";
      console.error("Delete Account Error:", error);
      alert(`Failed to delete account: ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <button
          className="icon-btn"
          onClick={() => nav("/app/swipe")}
          aria-label="Back"
          data-testid="settings-back-btn"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="page-title-inline">Filters</h1>
      </div>

      <div className="section">
        <div className="section-title">Show me</div>
        <div className="choice-grid">
          {[
            { v: "female", l: "Women" },
            { v: "male", l: "Men" },
            { v: "everyone", l: "Everyone" },
          ].map((o) => (
            <button key={o.v} type="button"
                    className={`choice ${interestedIn === o.v ? "active" : ""}`}
                    onClick={() => setInterestedIn(o.v)}
                    data-testid={`filter-interested-${o.v}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>
        
      <div className="section">
        <div className="section-title">Age range</div>
        <div className="range-row">
          <div className="range-label">
            <span>Minimum</span><span className="value">{minAge}</span>
          </div>
          <input type="range" min="18" max="80" value={minAge}
                 onChange={(e) => setMinAge(+e.target.value)} data-testid="filter-min-age" />
        </div>
        <div className="range-row">
          <div className="range-label">
            <span>Maximum</span><span className="value">{maxAge}</span>
          </div>
          <input type="range" min="18" max="80" value={maxAge}
                 onChange={(e) => setMaxAge(+e.target.value)} data-testid="filter-max-age" />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Distance</div>
        <div className="range-row">
          <div className="range-label">
            <span>Max distance</span><span className="value">{maxDistance} km</span>
          </div>
          <input type="range" min="1" max="500" value={maxDistance}
                 onChange={(e) => setMaxDistance(+e.target.value)} data-testid="filter-distance" />
        </div>
      </div>

      <div className="section">
        <button className="btn btn-primary btn-block" onClick={save} disabled={saving} data-testid="save-filters-btn">
          {saving && <Loader2 size={16} className="spin" />} Save filters
        </button>
      </div>

      <div className="p-4" style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Settings</h1>

      <div style={{ marginTop: 40, borderTop: "1px solid #eee", paddingTop: 24 }}>
         <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)" }}>Danger Zone</h2>
         <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 16 }}>
           Once you delete your account, there is no going back. Please be certain.
         </p>
         <button 
           className="btn btn-outline" 
           style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
           onClick={handleDeleteAccount}
           disabled={isDeleting}
         >
           {isDeleting ? "Deleting..." : "Delete Account"}
         </button>
      </div>
    </div>
    </div>
  );
}