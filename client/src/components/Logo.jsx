export default function Logo({ dark = false, width = 120, className = "" }) {
  const ink = dark ? "#ffffff" : "#161512";
  // Icon is always 20px tall. Text is always 17px. Width prop scales the whole thing via transform.
  const scale = width / 120;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        transformOrigin: "left center",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        width: scale !== 1 ? 120 + "px" : undefined,
      }}
      aria-label="AsrModa"
    >
      <svg width="20" height="20" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M2.64087 19.1113C1.65588 20.4219 0.813273 21.5156 0.356862 22.7676C-0.0897966 23.9883 -0.271191 24.5488 0.741106 23.2793C1.68514 22.0996 2.5687 20.9512 3.85601 19.8672C3.94574 19.8906 4.04521 19.9082 4.14468 19.9297C15.8222 22.2539 24.3223 16.9961 22.8283 0C13.8405 3.11914 1.1078 1.84961 2.42437 17.8242C2.47508 18.416 2.51994 18.8223 2.64087 19.1113ZM5.40664 16.8164C8.45914 10.2324 16.3 7.97656 20.1893 3.47656C15.9763 11.7031 12.5278 12.1074 5.40664 16.8164Z" fill="#89BF3F" />
        <path d="M5.40672 16.8164C8.45922 10.2324 16.3001 7.97656 20.1894 3.47656C15.9763 11.7031 12.5279 12.1074 5.40672 16.8164Z" fill="#4CA71E" />
      </svg>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "17px", fontWeight: 700, color: ink, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>
        Asr<span style={{ fontWeight: 400 }}>Moda</span>
      </span>
    </span>
  );
}
