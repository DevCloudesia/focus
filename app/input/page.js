export default function InputPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">Update Schoology Tasks</h1>
        <p className="text-ink-500 text-sm mb-6">
          Paste the current assignment list, one per line, as{" "}
          <code className="chip px-1.5 py-0.5">Title | YYYY-MM-DD</code> (the date is optional).
          Submitting replaces the current open Schoology-sourced tasks with this list — anything
          already marked done is left alone. Check{" "}
          <a href="/view" className="text-violet-600 underline">/view</a> first to see what's
          there now.
        </p>

        <form action="/api/input/tasks" method="POST" className="card p-6">
          <textarea
            name="text"
            rows={14}
            placeholder={"AP Bio Lab Report | 2026-09-05\nMath Homework 12.3\nHistory Essay Draft | 2026-09-08"}
            className="w-full bg-white/70 border border-white/70 rounded-xl px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-violet-400 font-mono-num"
          />
          <button
            type="submit"
            className="btn-primary mt-4 px-6 py-3 font-display font-semibold"
          >
            Update Tasks
          </button>
        </form>
      </div>
    </main>
  );
}
