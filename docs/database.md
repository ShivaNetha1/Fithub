# Database

Fithub uses Supabase PostgreSQL with normalized relational tables and Row Level Security.

## Migration Files

Run these in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_seed_membership_plans.sql`

## Tables

| Table | Purpose |
| --- | --- |
| `users` | Owner profile linked to Supabase `auth.users` |
| `gyms` | Gym records owned by users |
| `membership_plans` | Monthly, quarterly, half-yearly, yearly, and custom plans |
| `members` | Gym member records |
| `subscriptions` | Membership periods, renewals, expiry, balances |
| `payments` | Payment history and revenue tracking |
| `attendance` | Manual attendance by member/date |
| `activity_logs` | Audit trail for important actions |
| `analytics_summary` | Cached analytics/reporting summaries |

## Views

| View | Purpose |
| --- | --- |
| `member_membership_status` | Latest subscription state per member |
| `dashboard_summary` | Dashboard metrics per gym |

Both views use `security_invoker = true` so Supabase RLS is still respected.

## RLS Model

The owner access rule is:

```text
auth.uid() owns gym -> owner can access rows for that gym
```

Each business table has RLS enabled. Owners can only manage data belonging to gyms they own.

## Applying in Supabase Dashboard

1. Open your Supabase project.
2. Go to SQL Editor.
3. Paste and run `0001_initial_schema.sql`.
4. Paste and run `0002_seed_membership_plans.sql`.
5. Confirm the tables appear in Table Editor.

## Applying with Supabase CLI

After installing and logging in to the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Default Plans

After creating a gym, the app can call:

```sql
select public.create_default_membership_plans('your-gym-id');
```

This creates Monthly, Quarterly, Half-Yearly, and Yearly plans for that gym.
