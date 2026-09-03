// GLOBAL SPARK HQ v1.1.0
// Authenticated Supabase MVP adapter for the independent GLOBAL SPARK project.
(function () {
  const SESSION_KEY = "globalSparkSession.v080";
  const cfg = window.SPARK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch (_) { return null; }
  }
  function saveSession(s) {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  }
  function token() {
    const s = readSession();
    return s?.access_token || "";
  }
  function isSignedIn() { return !!token(); }

  async function api(path, options={}) {
    if (!configured) throw new Error("SPARK_CONFIG_NOT_READY");
    const base = cfg.supabaseUrl.replace(/\/$/,"");
    const headers = {
      "apikey": cfg.supabaseAnonKey,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (token()) headers.Authorization = "Bearer " + token();

    const res = await fetch(base + path, {...options, headers});
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
    if (!res.ok) {
      const err = new Error(typeof body === "string" ? body : JSON.stringify(body));
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  async function signIn(email, password) {
    const body = await api("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({email, password})
    });
    saveSession(body);
    return body;
  }
  function signOut() { saveSession(null); }

  async function rpc(name, payload={}) {
    if (!isSignedIn()) throw new Error("AUTH_REQUIRED");
    return api("/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {"Prefer":"return=representation"},
      body: JSON.stringify(payload)
    });
  }

  async function publicRpc(name, payload={}) {
    const saved = readSession();
    const base = cfg.supabaseUrl.replace(/\/$/,"");
    const res = await fetch(base + "/rest/v1/rpc/" + name, {
      method:"POST",
      headers:{
        "apikey":cfg.supabaseAnonKey,
        "Authorization":"Bearer " + cfg.supabaseAnonKey,
        "Content-Type":"application/json",
        "Prefer":"return=representation"
      },
      body:JSON.stringify(payload)
    });
    const text=await res.text();
    let body=null; try{body=text?JSON.parse(text):null;}catch(_){body=text;}
    if(!res.ok) throw new Error(typeof body==="string"?body:JSON.stringify(body));
    return body;
  }

  async function getCenterMembers(centerCode=cfg.centerCode) {
    return rpc("spark_get_center_members", {p_center_code:centerCode});
  }
  async function registerActivity({member_id, activity_type, memo=null, source_event_id=null}) {
    return rpc("spark_register_activity", {
      p_member_id: member_id,
      p_center_code: cfg.centerCode,
      p_activity_type: activity_type,
      p_memo: memo,
      p_source_event_id: source_event_id
    });
  }
  async function getMemberSummary(memberId) {
    return rpc("spark_get_member_summary", {p_member_id:memberId});
  }
  async function getMemberRecent(memberId, limit=10) {
    return rpc("spark_get_member_recent", {p_member_id:memberId, p_limit:limit});
  }
  async function getCenterRecent(limit=12) {
    return rpc("spark_get_center_recent", {p_center_code:cfg.centerCode, p_limit:limit});
  }
  async function undoLast() {
    return rpc("spark_undo_last_activity", {p_center_code:cfg.centerCode});
  }
  async function createMemberShare(memberId) {
    return rpc("spark_create_member_share", {p_member_id:memberId});
  }
  async function revokeMemberShares(memberId) {
    return rpc("spark_revoke_member_shares", {p_member_id:memberId});
  }
  async function getPublicShare(token) {
    return publicRpc("spark_get_public_share", {p_token:token});
  }

  window.SparkData = {
    configured,
    mode: configured ? "supabase-live-v080" : "not-configured",
    readSession, isSignedIn, signIn, signOut,
    rpc, getCenterMembers, registerActivity,
    getMemberSummary, getMemberRecent, getCenterRecent, undoLast,
    createMemberShare, revokeMemberShares, getPublicShare, publicRpc
  };
})();
