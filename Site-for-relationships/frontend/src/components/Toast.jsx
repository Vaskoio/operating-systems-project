import { useEffect, useState } from "react";

let push = () => {};

export function toast(message, type = "info") {
  push({ message, type });
}
toast.success = (m) => toast(m, "success");
toast.error = (m) => toast(m, "error");
toast.info = (m) => toast(m, "info");

export default function Toast() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    push = ({ message, type }) => {
      const id = Math.random().toString(36).slice(2);
      setItems((arr) => [...arr, { id, message, type }]);
      setTimeout(() => setItems((arr) => arr.filter((i) => i.id !== id)), 2800);
    };
    return () => { push = () => {}; };
  }, []);

  return (
    <div
      style={{
        position: "fixed", top: 16, left: 0, right: 0, zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        pointerEvents: "none",
      }}
      data-testid="toast-container"
    >
      {items.map((t) => (
        <div
          key={t.id}
          data-testid={`toast-${t.type}`}
          style={{
            pointerEvents: "auto",
            minWidth: 240, maxWidth: 360, padding: "10px 16px",
            borderRadius: 12, fontSize: 14, fontWeight: 600,
            background:
              t.type === "success" ? "#10B981" :
              t.type === "error" ? "#EF4444" : "#1F2937",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            animation: "popIn 0.25s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
