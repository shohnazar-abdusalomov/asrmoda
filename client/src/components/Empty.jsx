import { createElement } from "react";

export default function Empty({ icon: Icon, text }) {
  return (
    <div className="empty">
      {createElement(Icon)}
      <h3>{text}</h3>
      <p>Mahsulotlarni katalogdan tanlashingiz mumkin.</p>
    </div>
  );
}
