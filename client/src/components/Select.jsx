import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Custom select dropdown — no native <select> or <option>.
 *
 * Props:
 *   value        – current value
 *   onChange     – (value) => void
 *   options      – [{ value, label, color? }] or ["string", ...]
 *   disabled     – bool
 *   placeholder  – string shown when no value selected
 *   variant      – "default" | "pill"  (pill = compact colored badge style)
 *   className    – extra class on trigger
 */
export default function Select({ value, onChange, options = [], disabled = false, placeholder = "Tanlang", variant = "default", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const normalized = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selected = normalized.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (val) => { onChange(val); setOpen(false); };

  if (variant === "pill") {
    return (
      <div className={`cselect-pill-wrap ${className}`} ref={ref}>
        <button
          type="button"
          className={`cselect-pill ${value || ""} ${open ? "open" : ""}`}
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected?.label || placeholder}
          <ChevronDown className="cselect-chevron" />
        </button>
        {open && (
          <ul className="cselect-menu cselect-menu-pill" role="listbox">
            {normalized.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={opt.value === value ? "active" : ""}
                onMouseDown={() => choose(opt.value)}
              >
                {opt.label}
                {opt.value === value && <Check size={12} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={`cselect ${disabled ? "cselect-disabled" : ""} ${open ? "open" : ""} ${className}`} ref={ref}>
      <button
        type="button"
        className="cselect-trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "cselect-placeholder"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="cselect-chevron" />
      </button>
      {open && (
        <ul className="cselect-menu" role="listbox">
          {normalized.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={opt.value === value ? "active" : ""}
              onMouseDown={() => choose(opt.value)}
            >
              {opt.label}
              {opt.value === value && <Check size={13} className="cselect-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
