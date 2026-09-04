-- GLOBAL SPARK · PHASE 3-13
-- Avoid participation x action join multiplication as campaigns grow.
create or replace function public.spark_hq_campaign_stats()
returns table(campaign_id uuid,title text,flame_code text,countries bigint,centers bigint,members bigint,actions bigint)
language plpgsql stable security definer set search_path='public' as $function$
begin
 if not public.spark_is_hq_admin() then raise exception 'FORBIDDEN'; end if;
 return query select c.id,c.title,c.flame_code,
  (select count(distinct ce.country_code) from public.spark_campaign_participations cp join public.spark_centers ce on ce.id=cp.center_id where cp.campaign_id=c.id),
  (select count(distinct cp.center_id) from public.spark_campaign_participations cp where cp.campaign_id=c.id),
  (select count(distinct cp.member_id) from public.spark_campaign_participations cp where cp.campaign_id=c.id),
  (select count(*) from public.spark_campaign_actions ca where ca.campaign_id=c.id)
 from public.spark_campaigns c order by c.created_at desc;
end $function$;
create or replace function public.spark_public_campaign_stats()
returns table(campaign_id uuid,title text,flame_code text,countries bigint,centers bigint,participants bigint,actions bigint)
language sql stable security definer set search_path='public' as $function$
 select c.id,c.title,c.flame_code,
  (select count(distinct ce.country_code) from public.spark_campaign_participations cp join public.spark_centers ce on ce.id=cp.center_id where cp.campaign_id=c.id),
  (select count(distinct cp.center_id) from public.spark_campaign_participations cp where cp.campaign_id=c.id),
  (select count(distinct cp.member_id) from public.spark_campaign_participations cp where cp.campaign_id=c.id),
  (select count(*) from public.spark_campaign_actions ca where ca.campaign_id=c.id)
 from public.spark_campaigns c where c.status='published' and c.starts_at<=now() and(c.ends_at is null or c.ends_at>=now()) order by c.starts_at desc;
$function$;
grant execute on function public.spark_public_campaign_stats() to anon,authenticated;
