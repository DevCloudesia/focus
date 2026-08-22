import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function ViewPage() {
  const db = supabaseAdmin();

  const [{ data: tasks }, { data: settings }] = await Promise.all([
    db.from("tasks").select("*").order("due_at", { ascending: true, nullsFirst: false }),
    db.from("settings").select("*").eq("id", 1).single(),
  ]);

  const open = (tasks || []).filter((t) => t.status !== "done");
  const done = (tasks || []).filter((t) => t.status === "done");

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">Current Data</h1>
        <p className="text-ink-500 text-sm mb-8">
          Plain read-only view of everything stored in the app — for verifying before a weekly
          Schoology update via <a href="/input" className="text-violet-600 underline">/input</a>.
        </p>

        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">Open Tasks ({open.length})</h2>
          {open.length === 0 && <p className="text-ink-400 text-sm">None.</p>}
          <ul className="flex flex-col gap-2">
            {open.map((t) => (
              <li key={t.id} className="text-sm text-ink-900">
                <strong>{t.title}</strong>
                {" — "}
                {t.category} · {t.source}
                {t.due_at ? ` · due ${new Date(t.due_at).toLocaleDateString()}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">
            Completed Tasks ({done.length})
          </h2>
          {done.length === 0 && <p className="text-ink-400 text-sm">None.</p>}
          <ul className="flex flex-col gap-2">
            {done.map((t) => (
              <li key={t.id} className="text-sm text-ink-500 line-through">
                {t.title}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">Settings</h2>
          <div className="text-sm text-ink-900 flex flex-col gap-1">
            <div>Weekday sleep: {settings?.weekday_bedtime?.slice(0, 5)} – {settings?.weekday_wake?.slice(0, 5)}</div>
            <div>Weekend sleep: {settings?.weekend_bedtime?.slice(0, 5)} – {settings?.weekend_wake?.slice(0, 5)}</div>
            <div className="mt-2 font-medium">SAT dates</div>
            {(settings?.sat_exams || []).map((s, i) => (
              <div key={i} className="text-ink-500">
                {s.label} — {s.date} {s.time}, {s.test_center}
              </div>
            ))}
            <div className="mt-2 font-medium">College / application deadlines</div>
            {(settings?.college_deadlines || []).map((d, i) => (
              <div key={i} className="text-ink-500">
                {d.label} — {d.date}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
