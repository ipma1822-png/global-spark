// GLOBAL SPARK HQ v0.7.0
// Authenticated Supabase MVP adapter.
(function () {
  const LOCAL_KEY = "globalSparkActivities";
  const SESSION_KEY = "globalSparkSession";
  const cfg = window.SPARK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (_) { return null; }
  }
  function saveSession(s) {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  }
  function token() {
    const s = readSession();
    return s?.access_token || cfg.supabaseAnonKey || "";
  }

  async function api(path, options={}) {
    const base = cfg.supabaseUrl.replace(/\/$/,"");
    const url = base + path;
    const headers = {
      "apikey": cfg.supabaseAnonKey,
      "Authorization": "Bearer " + token(),
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    const res = await fetch(url, {...options, headers});
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
    if (!res.ok) throw new Error(typeof body === "string" ? body : JSON.stringify(body));
    return body;
  }

  async function signIn(email, password) {
    const body = await api("/auth/v1/token?grant_type=password", {
      method:"POST", body:JSON.stringify({email,password})
    });
    saveSession(body);
    return body;
  }
  function signOut() { saveSession(null); }

  async function rpc(name, payload) {
    return api("/rest/v1/rpc/" + name, {
      method:"POST",
      headers:{"Prefer":"return=representation"},
      body:JSON.stringify(payload || {})
    });
  }

  async function getCenterMembers(centerCode=cfg.centerCode) {
    return rpc("spark_get_center_members", {p_center_code:centerCode});
  }

  async function registerActivity({member_id, activity_type, memo=null, source_event_id=null}) {
    return rpc("spark_register_activity", {
      p_member_id:member_id,
      p_center_code:cfg.centerCode,
      p_activity_type:activity_type,
      p_memo:memo,
      p_source_event_id:source_event_id
    });
  }

  async function getMemberSummary(memberId) {
    return rpc("spark_get_member_summary", {p_member_id:memberId});
  }

  window.SparkData = {
    configured,
    mode: configured ? "supabase-auth-mvp" : "local-demo",
    readSession, signIn, signOut, rpc,
    getCenterMembers, registerActivity, getMemberSummary
  };
})();
