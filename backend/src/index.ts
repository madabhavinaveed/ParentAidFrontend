/**
 * Part 2 — Light implementation (optional assignment scope)
 * 3 endpoints: submit response, retrieve responses, alignment state.
 * Minimal DB: SQLite + Prisma. No auth.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);

const inferAlignment = (a: string, b: string) => {
  const words = (txt: string) =>
    new Set(
      txt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  const overlap = [...words(a)].filter((x) => words(b).has(x)).length;
  if (overlap >= 4) {
    return {
      state: "AGREEMENT",
      summary: "Similar themes — largely aligned this week.",
      followup: "Spend 10 minutes appreciating something each of you did well.",
    };
  }
  if (overlap === 0) {
    return {
      state: "MISMATCH",
      summary: "Different focus areas between partners.",
      followup: "Talk for 15 minutes: “What mattered most to me this week was…”",
    };
  }
  return {
    state: "MIXED",
    summary: "Partial overlap.",
    followup: "Ask: “What support would help you next week?”",
  };
};

async function maybeWriteAlignment(coupleId: string) {
  const rows = await prisma.partnerResponse.findMany({
    where: { coupleId },
    orderBy: { slot: "asc" },
  });
  if (rows.length < 2) return;
  const t1 = rows.find((r) => r.slot === 1)?.text;
  const t2 = rows.find((r) => r.slot === 2)?.text;
  if (!t1 || !t2) return;
  const { state, summary, followup } = inferAlignment(t1, t2);
  await prisma.alignment.upsert({
    where: { coupleId },
    create: { coupleId, state, summary, followup },
    update: { state, summary, followup },
  });
}

app.get("/health", (_req, res) => res.json({ ok: true }));

/** POST — submit one partner response */
app.post("/responses", async (req, res) => {
  const coupleId = typeof req.body.coupleId === "string" ? req.body.coupleId.trim() : "";
  const slot = Number(req.body.slot);
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!coupleId || !text || (slot !== 1 && slot !== 2)) {
    return res.status(400).json({ message: "coupleId, slot (1|2), and text required" });
  }
  await prisma.partnerResponse.upsert({
    where: { coupleId_slot: { coupleId, slot } },
    create: { coupleId, slot, text },
    update: { text },
  });
  await maybeWriteAlignment(coupleId);
  return res.status(201).json({ ok: true });
});

/** GET — retrieve both responses for a couple */
app.get("/responses/:coupleId", async (req, res) => {
  const coupleId = String(req.params.coupleId || "").trim();
  if (!coupleId) return res.status(400).json({ message: "coupleId required" });
  const rows = await prisma.partnerResponse.findMany({
    where: { coupleId },
    orderBy: { slot: "asc" },
    select: { slot: true, text: true },
  });
  const partner1 = rows.find((r) => r.slot === 1)?.text ?? null;
  const partner2 = rows.find((r) => r.slot === 2)?.text ?? null;
  return res.json({
    coupleId,
    partner1,
    partner2,
    complete: partner1 != null && partner2 != null,
  });
});

/** GET — alignment once both have responded */
app.get("/alignment/:coupleId", async (req, res) => {
  const coupleId = String(req.params.coupleId || "").trim();
  if (!coupleId) return res.status(400).json({ message: "coupleId required" });
  const alignment = await prisma.alignment.findUnique({ where: { coupleId } });
  if (!alignment) return res.json({ ready: false });
  return res.json({
    ready: true,
    alignment: {
      state: alignment.state,
      summary: alignment.summary,
      followup: alignment.followup,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Part 2 API on ${PORT} (SQLite)`);
});
