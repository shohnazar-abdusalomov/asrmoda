import { X } from "lucide-react";

export default function Drawer({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>{title}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        {children}
      </aside>
    </div>
  );
}
