// GLOBAL SPARK HQ v0.5.0
// Data adapter: independent GLOBAL SPARK Supabase when configured, localStorage fallback otherwise.
// Never put a service_role key in browser code.
(function () {
  const KEY = "globalSparkActivities";
  const cfg = window.SPARK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.includes("YOUR_PROJECT") && !cfg.supabaseAnonKey.includes("YOUR_"));

  function localRead() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (_) { return []; }
  }
  function localWrite(rows) { localStorage.setItem(KEY, JSON.stringify(rows)); }

  async function addLocal(activity) {
    const rows = localRead();
    const row = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(), ...activity, sync_status: configured ? "pending" : "local" };
    rows.unshift(row); localWrite(rows); return row;
  }

  async function undoLocal() {
    const rows = localRead();
    const removed = rows.shift(); localWrite(rows); return removed || null;
  }

  window.SparkData = {
    mode: configured ? "supabase-ready" : "local-demo",
    configured,
    list: async () => localRead(),
    add: addLocal,
    undoLast: undoLocal,
    // Actual remote writes remain intentionally disabled until RLS/RPC is deployed and verified.
    // v0.5.0 prevents accidental writes to an unreviewed production database.
  };
})();
