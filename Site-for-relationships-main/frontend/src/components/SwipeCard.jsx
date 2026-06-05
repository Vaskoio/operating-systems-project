import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { MapPin } from "lucide-react";

export default function SwipeCard({ profile, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [40, 160], [0, 1]);
  const nopeOpacity = useTransform(x, [-160, -40], [1, 0]);

  const photos = profile.photos?.length ? profile.photos : [];
  const [idx, setIdx] = useState(0);

  const onDragEnd = (_, info) => {
    if (info.offset.x > 120) onSwipe(profile.id, true);
    else if (info.offset.x < -120) onSwipe(profile.id, false);
  };

  const tap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    if (e.clientX < mid) setIdx((i) => Math.max(0, i - 1));
    else setIdx((i) => Math.min(photos.length - 1, i + 1));
  };

  const bg = photos[idx] || "";

  return (
    <motion.div
      className="card"
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      style={{ x, rotate }}
      whileTap={isTop ? { cursor: "grabbing" } : undefined}
      data-testid={`swipe-card-${profile.id}`}
    >
      <div
        className="card-photo"
        style={{ backgroundImage: bg ? `url("${bg}")` : "linear-gradient(135deg, #6366F1, #EC4899)" }}
        onClick={isTop ? tap : undefined}
      />
      {photos.length > 1 && (
        <div className="card-photo-dots">
          {photos.map((url, i) => (
            <div key={url} className={`card-photo-dot ${i === idx ? "active" : ""}`} />
          ))}
        </div>
      )}
      <motion.div className="stamp stamp-like" style={{ opacity: likeOpacity }}>LIKE</motion.div>
      <motion.div className="stamp stamp-nope" style={{ opacity: nopeOpacity }}>NOPE</motion.div>
      <div className="card-overlay">
        <div className="card-name-row">
          <span className="card-name">{profile.name}</span>
          <span className="card-age">{profile.age}</span>
        </div>
        {profile.city && (
          <div className="card-meta">
            <MapPin size={14} strokeWidth={2.5} /> <span>{profile.city}</span>
          </div>
        )}
        {profile.bio && <p className="card-bio">{profile.bio}</p>}
        {profile.interests?.length > 0 && (
          <div className="card-tags">
            {profile.interests.slice(0, 4).map((t) => (
              <span className="card-tag" key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
