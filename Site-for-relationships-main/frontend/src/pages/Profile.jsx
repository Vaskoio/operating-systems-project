import { useState } from "react";
import { Plus, Trash2, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "../components/Toast";

const SUGGEST_TAGS = ["Coffee", "Hiking", "Photography", "Music", "Movies", "Travel", "Cooking", "Gaming", "Yoga", "Books", "Running", "Pets", "Foodie", "Art"];

export default function ProfilePage() {
  const { user, refresh, logout, setUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [city, setCity] = useState(user?.city || "");
  const [interests, setInterests] = useState(user?.interests || []);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile/me", { bio, city, interests });
      setUser(data);
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

const addPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await api.post("/profile/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await refresh(); 
      toast.success("Photo uploaded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not upload photo");
    }
  };

  const removePhoto = async (url) => {
    try {
      const { data } = await api.get("/profile/photos");
      const p = data.find((x) => x.url === url);
      if (!p) return;
      await api.delete(`/profile/photos/${p.id}`);
      await refresh();
      toast.success("Photo removed");
    } catch (err) {
      console.error("Remove photo failed:", err);
      toast.error("Could not remove photo");
    }
  };

  const toggleTag = (t) => {
    setInterests((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
  };

  return (
    <div>
      <div className="profile-hero">
        <div
          className="avatar avatar-lg"
          style={user.photos?.[0] ? { backgroundImage: `url("${user.photos[0]}")` } : {}}
        />
        <div className="profile-name">{user.name}, {user.age}</div>
        <div className="muted">{user.email}</div>
      </div>

      <div className="section">
        <div className="section-title">Photos <span className="label-hint">({user.photos?.length || 0}/6)</span></div>
        <div className="photos-grid">
          {(user.photos || []).map((url) => (
            <div key={url} className="photo-tile" style={{ backgroundImage: `url("${url}")` }}>
              <button className="photo-delete" onClick={() => removePhoto(url)} aria-label="Delete photo" data-testid={`delete-photo-${(user.photos || []).indexOf(url)}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {(user.photos?.length || 0) < 6 && (
            <div className="photo-tile empty-tile">
              <Plus size={28} strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="btn btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", width: "100%" }}>
            Upload Photo from Device
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={addPhoto} 
              style={{ display: "none" }} 
            />
          </label>
        </div>
        <p className="label-hint" style={{ marginTop: 8, textAlign: "center" }}>
          Tip: You can upload JPG, PNG, or WEBP images.
        </p>
      </div>

      <div className="section">
        <div className="section-title">About</div>
        <div className="form-group">
          <label className="label">Bio</label>
          <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about you…" maxLength={300}
                    data-testid="profile-bio-input" />
        </div>
        <div className="form-group">
          <label className="label">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)}
                 placeholder="Portland" data-testid="profile-city-input" />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Interests</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGEST_TAGS.map((t) => (
            <button key={t} type="button" className={`choice ${interests.includes(t) ? "active" : ""}`}
                    style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
                    onClick={() => toggleTag(t)}
                    data-testid={`tag-${t}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <button className="btn btn-primary btn-block" onClick={save} disabled={saving} data-testid="save-profile-btn">
          {saving && <Loader2 size={16} className="spin" />} Save profile
        </button>
        <button className="btn btn-ghost btn-block" onClick={logout} data-testid="logout-btn" style={{ marginTop: 8 }}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}