/**
 * Part 2 demo UI — calls only the 3 assignment endpoints (+ optional /health).
 */
import { useState } from "react";
import "./App.css";
import { apiCall } from "./api";

const DEFAULT_COUPLE = "demo-couple";

function App() {
  const [coupleId, setCoupleId] = useState(DEFAULT_COUPLE);
  const [slot, setSlot] = useState<1 | 2>(1);
  const [text, setText] = useState("");
  const [status, setStatus] = useState(
    "Part 2: same coupleId in two tabs — slot 1 and slot 2 — then fetch alignment.",
  );
  const [responsesJson, setResponsesJson] = useState("");
  const [alignmentJson, setAlignmentJson] = useState("");

  const cid = () => encodeURIComponent(coupleId.trim());

  const submit = async () => {
    try {
      await apiCall("/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleId: coupleId.trim(), slot, text }),
      });
      setStatus(`Saved partner ${slot}.`);
      setText("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Submit failed");
    }
  };

  const fetchResponses = async () => {
    try {
      const data = await apiCall(`/responses/${cid()}`);
      setResponsesJson(JSON.stringify(data, null, 2));
      setStatus("GET /responses/:coupleId ok.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Fetch failed");
    }
  };

  const fetchAlignment = async () => {
    try {
      const data = await apiCall(`/alignment/${cid()}`);
      setAlignmentJson(JSON.stringify(data, null, 2));
      setStatus(data.ready ? "GET /alignment/:coupleId — ready." : "Waiting for both partners.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Fetch failed");
    }
  };

  return (
    <main className="container">
      <h1>PairentAid — Part 2 (minimal)</h1>
      <p className="sub">3 endpoints · SQLite · no auth</p>

      <section className="card">
        <h2>1. Submit response — POST /responses</h2>
        <input
          value={coupleId}
          onChange={(e) => setCoupleId(e.target.value)}
          placeholder="coupleId"
        />
        <select
          value={slot}
          onChange={(e) => setSlot(Number(e.target.value) as 1 | 2)}
          style={{ marginTop: 8 }}
        >
          <option value={1}>slot 1</option>
          <option value={2}>slot 2</option>
        </select>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Response text…"
        />
        <button type="button" onClick={submit} disabled={!text.trim()}>
          Submit
        </button>
      </section>

      <section className="card">
        <h2>2. Retrieve responses — GET /responses/:coupleId</h2>
        <button type="button" onClick={fetchResponses}>
          Fetch responses
        </button>
        {responsesJson && <pre className="json">{responsesJson}</pre>}
      </section>

      <section className="card">
        <h2>3. Alignment state — GET /alignment/:coupleId</h2>
        <button type="button" onClick={fetchAlignment}>
          Fetch alignment
        </button>
        {alignmentJson && <pre className="json">{alignmentJson}</pre>}
      </section>

      <p className="status">{status}</p>
    </main>
  );
}

export default App;
