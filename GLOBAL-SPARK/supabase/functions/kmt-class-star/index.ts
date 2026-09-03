import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const KMT_URL="https://ojxarsfaewehwjidwgac.supabase.co";
const KMT_KEY="sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0";
const ALLOWED_EMAIL="class-admin@ipma.kr";
const cors={"access-control-allow-origin":"*","access-control-allow-headers":"authorization,content-type","content-type":"application/json"};
const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:any,n=200)=>String(v??"").trim().slice(0,n);

async function verifyKmt(req:Request){
  const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))throw new Error("AUTH_REQUIRED");
  const r=await fetch(`${KMT_URL}/auth/v1/user`,{headers:{apikey:KMT_KEY,authorization:auth}});if(!r.ok)throw new Error("INVALID_CLASS_SESSION");
  const u=await r.json();if(String(u.email||"").toLowerCase()!==ALLOWED_EMAIL)throw new Error("CLASS_ADMIN_ONLY");return u;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return json({error:"METHOD_NOT_ALLOWED"},405);
  try{
    const user=await verifyKmt(req), body=await req.json();
    const url=Deno.env.get("SUPABASE_URL")!, key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db=createClient(url,key,{auth:{persistSession:false}});
    const centerCode=clean(body.center_code,40)||"KMT-000001";
    const {data:center,error:ce}=await db.from("spark_centers").select("id,center_code").eq("center_code",centerCode).single();if(ce||!center)throw new Error("CENTER_NOT_FOUND");

    async function upsertMember(s:any){
      const sid=clean(s?.source_member_id,80);if(!sid)throw new Error("STUDENT_ID_REQUIRED");
      const name=clean(s?.display_name,40)||"SPARK MEMBER", code=clean(s?.student_code,40), photo=clean(s?.photo_url,500)||null;
      let {data:m}=await db.from("spark_members").select("*").eq("source_system","kmt_class").eq("source_member_id",sid).maybeSingle();
      if(!m){
        const {data:cands}=await db.from("spark_members").select("*").eq("center_id",center.id).eq("display_name",name).is("source_member_id",null).limit(2);
        if((cands||[]).length===1)m=cands![0];
      }
      if(m){
        const {data:u,error}=await db.from("spark_members").update({display_name:name,photo_url:photo,source_system:"kmt_class",source_member_id:sid,source_student_code:code||null,active:s?.active!==false}).eq("id",m.id).select().single();if(error)throw error;return u;
      }
      const memberCode=`KMT-${(code||sid.replace(/-/g,"").slice(0,12)).toUpperCase()}`;
      const {data:n,error}=await db.from("spark_members").insert({center_id:center.id,member_code:memberCode,display_name:name,photo_url:photo,source_system:"kmt_class",source_member_id:sid,source_student_code:code||null,active:s?.active!==false}).select().single();if(error)throw error;return n;
    }

    if(body.action==="sync_roster"){
      let count=0;for(const s of (Array.isArray(body.students)?body.students:[]).slice(0,500)){await upsertMember(s);count++}return json({ok:true,action:"sync_roster",count});
    }
    if(body.action==="award"){
      const member=await upsertMember(body.student), eventId=clean(body.star_event_id,100), type=clean(body.activity_type,80);
      if(!["care_friend","tidy","exercise_challenge"].includes(type))return json({ok:true,skipped:true,reason:"CATEGORY_NOT_SPARK"});
      const sourceId=`kmt-star:${eventId}`;
      const {data:existing}=await db.from("spark_activities").select("id").eq("source_system","kmt_class_star").eq("source_event_id",sourceId).maybeSingle();if(existing)return json({ok:true,idempotent:true});
      const {data:rule,error:re}=await db.from("spark_activity_rules").select("xp").eq("activity_type",type).eq("active",true).single();if(re||!rule)throw new Error("SPARK_RULE_NOT_FOUND");
      const {data:a,error:ae}=await db.from("spark_activities").insert({center_id:center.id,member_id:member.id,activity_type:type,memo:`CLASS ${clean(body.category_code,30)} STAR`,verified_by:user.id,source_system:"kmt_class_star",source_event_id:sourceId,created_at:body.awarded_at||new Date().toISOString()}).select().single();if(ae)throw ae;
      const {error:le}=await db.from("spark_ledger").insert({center_id:center.id,member_id:member.id,activity_id:a.id,amount:rule.xp,reason:`CLASS STAR:${clean(body.category_code,30)}`,created_by:user.id});if(le)throw le;
      return json({ok:true,action:"award",xp:rule.xp,member_id:member.id});
    }
    if(body.action==="undo"){
      const sourceId=`kmt-star:${clean(body.star_event_id,100)}`;
      const {data:a}=await db.from("spark_activities").select("id,member_id").eq("source_system","kmt_class_star").eq("source_event_id",sourceId).maybeSingle();if(!a)return json({ok:true,skipped:true,reason:"NOT_SYNCED"});
      const {data:rows}=await db.from("spark_ledger").select("amount").eq("activity_id",a.id);const net=(rows||[]).reduce((n:any,r:any)=>n+Number(r.amount||0),0);if(net<=0)return json({ok:true,idempotent:true});
      const {error}=await db.from("spark_ledger").insert({center_id:center.id,member_id:a.member_id,activity_id:a.id,amount:-net,reason:"UNDO:CLASS STAR",created_by:user.id});if(error)throw error;return json({ok:true,action:"undo",reversed_xp:net});
    }
    return json({error:"UNKNOWN_ACTION"},400);
  }catch(e){console.error(e);return json({error:String(e?.message||e)},401)}
});
