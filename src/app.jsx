import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "O jejum intermitente funciona para perder peso?",
  "As vacinas causam autismo?",
  "Beber 8 copos de água por dia é obrigatório?",
  "Suplementos de vitamina C previnem constipações?",
  "O açúcar causa hiperatividade em crianças?",
];

const VERDICT_CONFIG = {
  confirmado: { label: "Confirmado pela ciência", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓", bar: "#22c55e" },
  misto: { label: "Evidência mista", color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: "~", bar: "#f59e0b" },
  refutado: { label: "Refutado pela ciência", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "✗", bar: "#ef4444" },
};

async function queryFactCheck(question) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function ConfidenceBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(value), 100); }, [value]);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Consenso científico</span>
        <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 3, transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </div>
    </div>
  );
}

function ResultCard({ data }) {
  const cfg = VERDICT_CONFIG[data.veredicto] || VERDICT_CONFIG.misto;
  return (
    <div style={{ border: `1.5px solid ${cfg.border}`, borderRadius: 16, background: cfg.bg, padding: "24px 28px", marginTop: 24, animation: "fadeUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{cfg.icon}</div>
        <div style={{ fontSize: 13, color: cfg.color, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{cfg.label}</div>
      </div>
      {data.resumo && <p style={{ fontSize: 16, lineHeight: 1.65, color: "#111827", fontWeight: 500, margin: "0 0 12px" }}>{data.resumo}</p>}
      <ConfidenceBar value={data.confianca} color={cfg.bar} />
      {data.detalhes && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${cfg.border}` }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Detalhes</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#374151", margin: 0 }}>{data.detalhes}</p>
        </div>
      )}
      {data.fontes && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${cfg.border}` }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Baseado em</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#6b7280", margin: 0, fontStyle: "italic" }}>{data.fontes}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef();

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await queryFactCheck(question);
      setResult(data);
      setHistory((h) => [{ question, ...data }, ...h.slice(0, 4)]);
    } catch (e) {
      setResult({ veredicto: "misto", confianca: 0, resumo: "Erro ao processar a pergunta. Tenta novamente.", detalhes: "", fontes: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'Lora', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea:focus { outline: none; box-shadow: 0 0 0 3px rgba(15,118,110,0.15); }
        .example-btn:hover { background: #f0fdf4 !important; border-color: #6ee7b7 !important; }
        .submit-btn:hover:not(:disabled) { background: #0f766e !important; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#14b8a6" }} />
            <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase" }}>Baseado em evidência científica</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, lineHeight: 1.15, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Verifica antes<br /><span style={{ color: "#14b8a6", fontStyle: "italic" }}>de acreditar.</span>
          </h1>
          <p style={{ fontSize: 17, color: "#4b5563", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
            Coloca qualquer dúvida sobre saúde ou ciência e obtém uma resposta baseada em evidências — sem alarmismo, sem sensacionalismo.
          </p>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <textarea ref={textareaRef} value={question} onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Ex: O jejum intermitente funciona para perder peso?" rows={3}
            style={{ width: "100%", border: "none", padding: "20px 24px 12px", fontSize: 16, fontFamily: "'Lora', Georgia, serif", color: "#0f172a", lineHeight: 1.6, resize: "none", boxSizing: "border-box", background: "transparent" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 20px" }}>
            <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#d1d5db" }}>{question.length} / 300</span>
            <button className="submit-btn" onClick={handleSubmit} disabled={loading || !question.trim()}
              style={{ background: "#134e4a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? <><span style={{ animation: "pulse 1s infinite" }}>●</span> A analisar…</> : "Verificar →"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Exemplos frequentes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="example-btn" onClick={() => setQuestion(ex)}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#374151", cursor: "pointer", fontFamily: "'Lora', Georgia, serif", transition: "all 0.15s" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
        {result && <ResultCard data={result} />}
        {result && (
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, lineHeight: 1.5, fontFamily: "'IBM Plex Mono', monospace" }}>
            ⚠ Esta informação é de carácter educativo e não substitui aconselhamento médico profissional.
          </p>
        )}
        {history.length > 1 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Pesquisas anteriores</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.slice(1).map((h, i) => {
                const cfg = VERDICT_CONFIG[h.veredicto] || VERDICT_CONFIG.misto;
                return (
                  <div key={i} onClick={() => setQuestion(h.question)}
                    style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <span style={{ color: cfg.color, fontSize: 14, fontWeight: 700 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{h.question}</span>
                    <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>{h.confianca}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
