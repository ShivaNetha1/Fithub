-- Fithub initial relational schema for Supabase PostgreSQL.
-- Apply this migration from the Supabase SQL editor or Supabase CLI.

begin;

create extension if not exists "pgcrypto";

create type public.gym_member_gender as enum (
  'male',
  'female',
  'other',
  'prefer_not_to_say'
);

create type public.member_account_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.membership_plan_type as enum (
  'monthly',
  'quarterly',
  'half_yearly',
  'yearly',
  'custom'
);

create type public.subscription_status as enum (
  'active',
  'expired',
  'cancelled',
  'upcoming'
);

create type public.payment_method as enum (
  'cash',
  'card',
  'upi',
  'bank_transfer',
  'cheque',
  'other'
);

create type public.payment_status as enum (
  'completed',
  'pending',
  'failed',
  'refunded'
);

create type public.attendance_status as enum (
  'present',
  'absent'
);

create type public.analytics_period as enum (
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_lowercase_chk check (email = lower(email)),
  constraint users_full_name_length_chk check (char_length(trim(full_name)) >= 2)
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'India',
  timezone text not null default 'Asia/Kolkata',
  currency_code char(3) not null default 'INR',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gyms_name_length_chk check (char_length(trim(name)) >= 2),
  constraint gyms_currency_code_chk check (currency_code = upper(currency_code))
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  plan_type public.membership_plan_type not null,
  duration_months integer not null,
  price numeric(12, 2) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_plans_duration_chk check (duration_months > 0),
  constraint membership_plans_price_chk check (price >= 0),
  constraint membership_plans_name_length_chk check (char_length(trim(name)) >= 2),
  constraint membership_plans_gym_name_unique unique (gym_id, name)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_code text not null,
  full_name text not null,
  phone text not null,
  email text,
  gender public.gym_member_gender,
  date_of_birth date,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  join_date date not null default current_date,
  account_status public.member_account_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_full_name_length_chk check (char_length(trim(full_name)) >= 2),
  constraint members_phone_length_chk check (char_length(trim(phone)) >= 6),
  constraint members_join_date_chk check (join_date <= (current_date + 1)),
  constraint members_gym_code_unique unique (gym_id, member_code)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id) on delete restrict,
  renewal_of_subscription_id uuid references public.subscriptions(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status public.subscription_status not null default 'active',
  base_amount numeric(12, 2) not null,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) generated always as (base_amount - discount_amount) stored,
  amount_paid numeric(12, 2) not null default 0,
  balance_amount numeric(12, 2) generated always as ((base_amount - discount_amount) - amount_paid) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_dates_chk check (end_date >= start_date),
  constraint subscriptions_base_amount_chk check (base_amount >= 0),
  constraint subscriptions_discount_chk check (discount_amount >= 0 and discount_amount <= base_amount),
  constraint subscriptions_amount_paid_chk check (amount_paid >= 0 and amount_paid <= (base_amount - discount_amount))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12, 2) not null,
  payment_date date not null default current_date,
  method public.payment_method not null default 'cash',
  status public.payment_status not null default 'completed',
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_chk check (amount > 0)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  attendance_date date not null default current_date,
  status public.attendance_status not null default 'present',
  check_in_time timestamptz,
  check_out_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_checkout_after_checkin_chk check (
    check_out_time is null
    or check_in_time is null
    or check_out_time >= check_in_time
  ),
  constraint attendance_member_date_unique unique (gym_id, member_id, attendance_date)
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_logs_action_length_chk check (char_length(trim(action)) >= 2),
  constraint activity_logs_entity_type_length_chk check (char_length(trim(entity_type)) >= 2)
);

create table public.analytics_summary (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  period public.analytics_period not null,
  period_start date not null,
  period_end date not null,
  total_members integer not null default 0,
  active_members integer not null default 0,
  expired_members integer not null default 0,
  attendance_count integer not null default 0,
  revenue_amount numeric(12, 2) not null default 0,
  pending_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_summary_period_dates_chk check (period_end >= period_start),
  constraint analytics_summary_non_negative_chk check (
    total_members >= 0
    and active_members >= 0
    and expired_members >= 0
    and attendance_count >= 0
    and revenue_amount >= 0
    and pending_amount >= 0
  ),
  constraint analytics_summary_gym_period_unique unique (gym_id, period, period_start)
);

create index users_email_idx on public.users (email);
create index gyms_owner_id_idx on public.gyms (owner_id);
create index membership_plans_gym_id_idx on public.membership_plans (gym_id);
create index membership_plans_active_idx on public.membership_plans (gym_id, is_active);
create index members_gym_id_idx on public.members (gym_id);
create index members_search_idx on public.members using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(email, '') || ' ' || coalesce(member_code, ''))
);
create index members_account_status_idx on public.members (gym_id, account_status);
create index subscriptions_gym_id_idx on public.subscriptions (gym_id);
create index subscriptions_member_id_idx on public.subscriptions (member_id);
create index subscriptions_status_end_date_idx on public.subscriptions (gym_id, status, end_date);
create index payments_gym_id_date_idx on public.payments (gym_id, payment_date desc);
create index payments_member_id_idx on public.payments (member_id);
create index payments_subscription_id_idx on public.payments (subscription_id);
create index attendance_gym_date_idx on public.attendance (gym_id, attendance_date desc);
create index attendance_member_date_idx on public.attendance (member_id, attendance_date desc);
create index activity_logs_gym_created_idx on public.activity_logs (gym_id, created_at desc);
create index analytics_summary_gym_period_idx on public.analytics_summary (gym_id, period, period_start desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_gyms_updated_at
before update on public.gyms
for each row execute function public.set_updated_at();

create trigger set_membership_plans_updated_at
before update on public.membership_plans
for each row execute function public.set_updated_at();

create trigger set_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_attendance_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

create trigger set_activity_logs_updated_at
before update on public.activity_logs
for each row execute function public.set_updated_at();

create trigger set_analytics_summary_updated_at
before update on public.analytics_summary
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.validate_subscription_relationships()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.members
    where members.id = new.member_id
      and members.gym_id = new.gym_id
  ) then
    raise exception 'Subscription member must belong to the selected gym';
  end if;

  if not exists (
    select 1
    from public.membership_plans
    where membership_plans.id = new.plan_id
      and membership_plans.gym_id = new.gym_id
  ) then
    raise exception 'Subscription plan must belong to the selected gym';
  end if;

  return new;
end;
$$;

create trigger validate_subscription_relationships
before insert or update on public.subscriptions
for each row execute function public.validate_subscription_relationships();

create or replace function public.validate_payment_relationships()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.members
    where members.id = new.member_id
      and members.gym_id = new.gym_id
  ) then
    raise exception 'Payment member must belong to the selected gym';
  end if;

  if new.subscription_id is not null and not exists (
    select 1
    from public.subscriptions
    where subscriptions.id = new.subscription_id
      and subscriptions.gym_id = new.gym_id
      and subscriptions.member_id = new.member_id
  ) then
    raise exception 'Payment subscription must belong to the selected member and gym';
  end if;

  return new;
end;
$$;

create trigger validate_payment_relationships
before insert or update on public.payments
for each row execute function public.validate_payment_relationships();

create or replace function public.validate_attendance_relationships()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.members
    where members.id = new.member_id
      and members.gym_id = new.gym_id
  ) then
    raise exception 'Attendance member must belong to the selected gym';
  end if;

  return new;
end;
$$;

create trigger validate_attendance_relationships
before insert or update on public.attendance
for each row execute function public.validate_attendance_relationships();

create or replace function public.refresh_subscription_payment_total(target_subscription_id uuid)
returns void
language plpgsql
as $$
begin
  update public.subscriptions
  set amount_paid = least(
    total_amount,
    coalesce(
      (
        select sum(payments.amount)
        from public.payments
        where payments.subscription_id = target_subscription_id
          and payments.status = 'completed'
      ),
      0
    )
  )
  where subscriptions.id = target_subscription_id;
end;
$$;

create or replace function public.sync_subscription_payment_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.subscription_id is not null then
    perform public.refresh_subscription_payment_total(old.subscription_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.subscription_id is not null then
    perform public.refresh_subscription_payment_total(new.subscription_id);
  end if;

  return null;
end;
$$;

create trigger sync_subscription_payment_total
after insert or update or delete on public.payments
for each row execute function public.sync_subscription_payment_total();

create or replace function public.user_owns_gym(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gyms
    where gyms.id = target_gym_id
      and gyms.owner_id = auth.uid()
  );
$$;

create or replace function public.user_owns_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members
    join public.gyms on gyms.id = members.gym_id
    where members.id = target_member_id
      and gyms.owner_id = auth.uid()
  );
$$;

create or replace view public.member_membership_status
with (security_invoker = true)
as
select
  members.id as member_id,
  members.gym_id,
  members.member_code,
  members.full_name,
  members.phone,
  members.email,
  members.account_status,
  subscriptions.id as subscription_id,
  subscriptions.plan_id,
  membership_plans.name as plan_name,
  subscriptions.start_date,
  subscriptions.end_date,
  case
    when subscriptions.id is null then 'expired'::public.subscription_status
    when subscriptions.status = 'cancelled' then 'cancelled'::public.subscription_status
    when subscriptions.start_date > current_date then 'upcoming'::public.subscription_status
    when subscriptions.end_date < current_date then 'expired'::public.subscription_status
    else 'active'::public.subscription_status
  end as computed_subscription_status,
  coalesce(subscriptions.balance_amount, 0) as balance_amount
from public.members
left join lateral (
  select *
  from public.subscriptions
  where subscriptions.member_id = members.id
  order by subscriptions.end_date desc, subscriptions.created_at desc
  limit 1
) subscriptions on true
left join public.membership_plans on membership_plans.id = subscriptions.plan_id;

create or replace view public.dashboard_summary
with (security_invoker = true)
as
select
  gyms.id as gym_id,
  coalesce(member_counts.total_members, 0)::integer as total_members,
  coalesce(member_counts.active_members, 0)::integer as active_members,
  coalesce(member_counts.expired_members, 0)::integer as expired_members,
  coalesce(member_counts.expiring_soon_members, 0)::integer as expiring_soon_members,
  coalesce(payment_counts.month_revenue, 0)::numeric(12, 2) as month_revenue,
  coalesce(member_counts.pending_payments, 0)::numeric(12, 2) as pending_payments,
  coalesce(attendance_counts.today_attendance, 0)::integer as today_attendance
from public.gyms
left join lateral (
  select
    count(*) filter (where members.account_status in ('active', 'inactive')) as total_members,
    count(*) filter (
      where member_status.computed_subscription_status = 'active'
        and members.account_status = 'active'
    ) as active_members,
    count(*) filter (
      where member_status.computed_subscription_status = 'expired'
        and members.account_status = 'active'
    ) as expired_members,
    count(*) filter (
      where member_status.computed_subscription_status = 'active'
        and member_status.end_date between current_date and current_date + 7
        and members.account_status = 'active'
    ) as expiring_soon_members,
    coalesce(sum(member_status.balance_amount) filter (where member_status.balance_amount > 0), 0) as pending_payments
  from public.members
  left join public.member_membership_status member_status on member_status.member_id = members.id
  where members.gym_id = gyms.id
) member_counts on true
left join lateral (
  select coalesce(sum(payments.amount), 0) as month_revenue
  from public.payments
  where payments.gym_id = gyms.id
    and payments.status = 'completed'
    and payments.payment_date >= date_trunc('month', current_date)::date
) payment_counts on true
left join lateral (
  select count(*) as today_attendance
  from public.attendance
  where attendance.gym_id = gyms.id
    and attendance.status = 'present'
    and attendance.attendance_date = current_date
) attendance_counts on true;

alter table public.users enable row level security;
alter table public.gyms enable row level security;
alter table public.membership_plans enable row level security;
alter table public.members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.activity_logs enable row level security;
alter table public.analytics_summary enable row level security;

create policy "Users can read their own profile"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can insert their own profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "Owners can manage their gyms"
on public.gyms for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can manage plans for owned gyms"
on public.membership_plans for all
to authenticated
using (public.user_owns_gym(gym_id))
with check (public.user_owns_gym(gym_id));

create policy "Owners can manage members for owned gyms"
on public.members for all
to authenticated
using (public.user_owns_gym(gym_id))
with check (public.user_owns_gym(gym_id));

create policy "Owners can manage subscriptions for owned gyms"
on public.subscriptions for all
to authenticated
using (public.user_owns_gym(gym_id) and public.user_owns_member(member_id))
with check (public.user_owns_gym(gym_id) and public.user_owns_member(member_id));

create policy "Owners can manage payments for owned gyms"
on public.payments for all
to authenticated
using (public.user_owns_gym(gym_id) and public.user_owns_member(member_id))
with check (public.user_owns_gym(gym_id) and public.user_owns_member(member_id));

create policy "Owners can manage attendance for owned gyms"
on public.attendance for all
to authenticated
using (public.user_owns_gym(gym_id) and public.user_owns_member(member_id))
with check (public.user_owns_gym(gym_id) and public.user_owns_member(member_id));

create policy "Owners can read activity logs for owned gyms"
on public.activity_logs for select
to authenticated
using (gym_id is null or public.user_owns_gym(gym_id));

create policy "Owners can insert activity logs for owned gyms"
on public.activity_logs for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and (gym_id is null or public.user_owns_gym(gym_id))
);

create policy "Owners can read analytics summaries for owned gyms"
on public.analytics_summary for select
to authenticated
using (public.user_owns_gym(gym_id));

create policy "Owners can manage analytics summaries for owned gyms"
on public.analytics_summary for all
to authenticated
using (public.user_owns_gym(gym_id))
with check (public.user_owns_gym(gym_id));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.member_membership_status to authenticated;
grant select on public.dashboard_summary to authenticated;

commit;
