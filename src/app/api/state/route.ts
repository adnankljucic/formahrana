import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PIN je i ključ zapisa i jedina zaštita — dozvoli samo sigurne znakove, min 4.
const PIN_RE = /^[A-Za-z0-9_-]{4,64}$/;

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  return neon(url);
}

// GET /api/state?pin=XXXX  → { data: <state | null> }
export async function GET(req: Request) {
  const sql = getSql();
  if (!sql)
    return Response.json({ error: "db_not_configured" }, { status: 503 });

  const pin = new URL(req.url).searchParams.get("pin") ?? "";
  if (!PIN_RE.test(pin))
    return Response.json({ error: "bad_pin" }, { status: 400 });

  try {
    await sql`create table if not exists app_state (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    const rows = (await sql`select data from app_state where id = ${pin}`) as {
      data: unknown;
    }[];
    return Response.json({ data: rows[0]?.data ?? null });
  } catch {
    return Response.json({ error: "db_error" }, { status: 500 });
  }
}

// PUT /api/state  body: { pin, data } → { ok: true }
export async function PUT(req: Request) {
  const sql = getSql();
  if (!sql)
    return Response.json({ error: "db_not_configured" }, { status: 503 });

  let body: { pin?: unknown; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const pin = typeof body.pin === "string" ? body.pin : "";
  const data = body.data;
  if (!PIN_RE.test(pin))
    return Response.json({ error: "bad_pin" }, { status: 400 });
  if (data == null || typeof data !== "object")
    return Response.json({ error: "bad_data" }, { status: 400 });

  try {
    await sql`create table if not exists app_state (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    await sql`
      insert into app_state (id, data, updated_at)
      values (${pin}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (id) do update set data = excluded.data, updated_at = now()
    `;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "db_error" }, { status: 500 });
  }
}
