// GLOBAL SPARK HQ v0.6.0
// Remote-capable data adapter for the independent GLOBAL SPARK Supabase project.
// Browser uses only publishable key. No secret/service_role key belongs here.
(function () {
  const LOCAL_KEY = "globalSparkActivities";
  const cfg = window.SPARK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  function localRead() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch (_) { return []; }
  }
  function localWrite(rows) { localStorage.setItem(LOCAL_KEY, JSON.stringify(rows)); }

  async function rest(path, options={}) {
    const url = cfg.supabaseUrl.replace(/\/$/,"") + "/rest/v1/" + path.replace(/^\//,"");
    const headers = {
      "apikey": cfg.supabaseAnonKey,
      "Authorization": "Bearer " + cfg.supabaseAnonKey,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {})
    };
    const res = await fetch(url, {...options, headers});
    if (!res.ok) throw new Error(await res.text() || ("HTTP " + res.status));
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async function rpc(name, body) {
    return rest("rpc/" + name, {method:"POST", body:JSON.stringify(body || {})});
  }

  async function listLocal() { return localRead(); }

  async function addLocal(activity) {
    const rows = localRead();
    const row = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      created_at: new Date().toISOString(),
      ...activity,
      sync_status: configured ? "pending" : "local"
    };
    rows.unshift(row); localWrite(rows); return row;
  }

  async function add(activity) {
    // Preferred production route: one transactional RPC that validates center/member,
    // resolves official XP rule and appends both activity + ledger.
    if (configured && activity.member_id && activity.activity_type) {
      try {
        const result = await rpc("spark_register_activity", {
          p_member_id: activity.member_id,
          p_center_code: activity.center_code || cfg.centerCode,
          p_activity_type: activity.activity_type,
          p_memo: activity.memo || null,
          p_source_event_id: activity.source_event_id || null
        });
        return {remote:true, result};
      } catch (err) {
        console.warn("GLOBAL SPARK remote registration unavailable; stored locally.", err);
      }
    }
    return addLocal(activity);
  }

  async function undoLast() {
    // Undo remains local-only until a reviewed server-side reversal RPC exists.
    const rows = localRead();
    const removed = rows.shift(); localWrite(rows); return removed || null;
  }

  window.SparkData = {
    mode: configured ? "supabase-connected" : "local-demo",
    configured,
    list: listLocal,
    add,
    undoLast,
    rest,
    rpc
  };
})();
