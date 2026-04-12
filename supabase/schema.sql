create extension if not exists pgcrypto;

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  problem_description text not null,
  service_type text not null,
  quoted_price numeric(10, 2) not null check (quoted_price >= 0),
  assigned_technician_id uuid not null references public.technicians(id),
  assigned_technician_name text not null,
  admin_notes text,
  status text not null,
  created_by_role text not null default 'Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check check (status in ('Assigned', 'In Progress', 'Job Done'));

create table if not exists public.service_completions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  work_done text not null,
  extra_charges numeric(10, 2) not null default 0 check (extra_charges >= 0),
  final_amount numeric(10, 2) not null check (final_amount >= 0),
  remarks text,
  technician_name text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_completion_files (
  id uuid primary key default gen_random_uuid(),
  service_completion_id uuid not null references public.service_completions(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists service_completions_set_updated_at on public.service_completions;
create trigger service_completions_set_updated_at
before update on public.service_completions
for each row
execute function public.set_updated_at();

create or replace function public.create_service_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_problem_description text,
  p_service_type text,
  p_quoted_price numeric,
  p_assigned_technician_id uuid,
  p_admin_notes text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted_order public.orders;
  v_today_kl date := timezone('Asia/Kuala_Lumpur', now())::date;
  v_sequence integer;
  v_order_no text;
  v_technician_name text;
begin
  select name
  into v_technician_name
  from public.technicians
  where id = p_assigned_technician_id
    and is_active = true;

  if v_technician_name is null then
    raise exception 'Assigned technician must exist and be active.';
  end if;

  loop
    select count(*) + 1
    into v_sequence
    from public.orders
    where timezone('Asia/Kuala_Lumpur', created_at)::date = v_today_kl;

    v_order_no := format(
      'SSS-%s-%s',
      to_char(v_today_kl, 'YYYYMMDD'),
      lpad(v_sequence::text, 4, '0')
    );

    begin
      insert into public.orders (
        order_no,
        customer_name,
        phone,
        address,
        problem_description,
        service_type,
        quoted_price,
        assigned_technician_id,
        assigned_technician_name,
        admin_notes,
        status
      )
      values (
        v_order_no,
        btrim(p_customer_name),
        btrim(p_phone),
        btrim(p_address),
        btrim(p_problem_description),
        btrim(p_service_type),
        p_quoted_price,
        p_assigned_technician_id,
        v_technician_name,
        nullif(btrim(coalesce(p_admin_notes, '')), ''),
        'Assigned'
      )
      returning *
      into v_inserted_order;

      return v_inserted_order;
    exception
      when unique_violation then
        continue;
    end;
  end loop;
end;
$$;

create or replace function public.start_service_job(
  p_order_id uuid,
  p_technician_name text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
    and assigned_technician_name = p_technician_name;

  if v_order.id is null then
    raise exception 'Order not found for this technician.';
  end if;

  if v_order.status = 'Assigned' then
    update public.orders
    set status = 'In Progress'
    where id = p_order_id
    returning *
    into v_order;
  end if;

  return v_order;
end;
$$;

create or replace function public.complete_service_job(
  p_order_id uuid,
  p_technician_name text,
  p_work_done text,
  p_extra_charges numeric,
  p_remarks text default null,
  p_files jsonb default '[]'::jsonb
)
returns table (
  order_id uuid,
  order_no text,
  customer_name text,
  service_type text,
  final_amount numeric,
  technician_name text,
  completed_at timestamptz,
  status text,
  files_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_completion_id uuid;
  v_completed_at timestamptz := now();
  v_final_amount numeric(10, 2);
  v_file_count integer := coalesce(jsonb_array_length(coalesce(p_files, '[]'::jsonb)), 0);
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
    and assigned_technician_name = p_technician_name;

  if v_order.id is null then
    raise exception 'Order not found for this technician.';
  end if;

  if v_file_count < 1 or v_file_count > 6 then
    raise exception 'Job completion requires between 1 and 6 files.';
  end if;

  if btrim(coalesce(p_work_done, '')) = '' then
    raise exception 'Work done is required.';
  end if;

  v_final_amount := v_order.quoted_price + coalesce(p_extra_charges, 0);

  insert into public.service_completions (
    order_id,
    work_done,
    extra_charges,
    final_amount,
    remarks,
    technician_name,
    completed_at
  )
  values (
    p_order_id,
    btrim(p_work_done),
    coalesce(p_extra_charges, 0),
    v_final_amount,
    nullif(btrim(coalesce(p_remarks, '')), ''),
    p_technician_name,
    v_completed_at
  )
  on conflict on constraint service_completions_order_id_key do update
  set
    work_done = excluded.work_done,
    extra_charges = excluded.extra_charges,
    final_amount = excluded.final_amount,
    remarks = excluded.remarks,
    technician_name = excluded.technician_name,
    completed_at = excluded.completed_at
  returning id
  into v_completion_id;

  delete from public.service_completion_files
  where service_completion_id = v_completion_id;

  insert into public.service_completion_files (
    service_completion_id,
    order_id,
    file_path,
    file_name,
    file_type,
    file_size
  )
  select
    v_completion_id,
    p_order_id,
    file_item ->> 'file_path',
    file_item ->> 'file_name',
    file_item ->> 'file_type',
    coalesce((file_item ->> 'file_size')::bigint, 0)
  from jsonb_array_elements(p_files) as file_item;

  update public.orders
  set status = 'Job Done'
  where id = p_order_id;

  return query
  select
    v_order.id,
    v_order.order_no,
    v_order.customer_name,
    v_order.service_type,
    v_final_amount,
    p_technician_name,
    v_completed_at,
    'Job Done'::text,
    v_file_count;
end;
$$;

insert into public.technicians (name, phone)
values
  ('Ali', '60120000001'),
  ('Bala', '60120000002'),
  ('John', '60120000003'),
  ('Yusoff', '60120000004')
on conflict (name) do update
set
  phone = excluded.phone,
  is_active = true;

insert into storage.buckets (id, name, public)
values ('service-media', 'service-media', false)
on conflict (id) do nothing;

alter table public.technicians enable row level security;
alter table public.orders enable row level security;
alter table public.service_completions enable row level security;
alter table public.service_completion_files enable row level security;

drop policy if exists "technicians_select_active" on public.technicians;
create policy "technicians_select_active"
on public.technicians
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "orders_select_all_for_demo" on public.orders;
create policy "orders_select_all_for_demo"
on public.orders
for select
to anon, authenticated
using (true);

drop policy if exists "service_completions_select_all_for_demo" on public.service_completions;
create policy "service_completions_select_all_for_demo"
on public.service_completions
for select
to anon, authenticated
using (true);

drop policy if exists "service_completion_files_select_all_for_demo" on public.service_completion_files;
create policy "service_completion_files_select_all_for_demo"
on public.service_completion_files
for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.technicians to anon, authenticated;
grant select on public.orders to anon, authenticated;
grant select on public.service_completions to anon, authenticated;
grant select on public.service_completion_files to anon, authenticated;
grant execute on function public.create_service_order(
  text,
  text,
  text,
  text,
  text,
  numeric,
  uuid,
  text
) to anon, authenticated;
grant execute on function public.start_service_job(uuid, text) to anon, authenticated;
grant execute on function public.complete_service_job(uuid, text, text, numeric, text, jsonb) to anon, authenticated;

drop policy if exists "service_media_read_demo" on storage.objects;
create policy "service_media_read_demo"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'service-media');

drop policy if exists "service_media_insert_demo" on storage.objects;
create policy "service_media_insert_demo"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'service-media');

drop policy if exists "service_media_delete_demo" on storage.objects;
create policy "service_media_delete_demo"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'service-media');
