-- Optional seed helpers for creating default plans for a newly created gym.
-- This function is used by the app after an owner creates a gym.

begin;

create or replace function public.create_default_membership_plans(target_gym_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.user_owns_gym(target_gym_id) then
    raise exception 'Not authorized to create plans for this gym';
  end if;

  insert into public.membership_plans (gym_id, name, plan_type, duration_months, price, description)
  values
    (target_gym_id, 'Monthly', 'monthly', 1, 1500.00, 'Standard one month membership'),
    (target_gym_id, 'Quarterly', 'quarterly', 3, 4000.00, 'Three month membership'),
    (target_gym_id, 'Half-Yearly', 'half_yearly', 6, 7500.00, 'Six month membership'),
    (target_gym_id, 'Yearly', 'yearly', 12, 14000.00, 'Twelve month membership')
  on conflict (gym_id, name) do nothing;
end;
$$;

grant execute on function public.create_default_membership_plans(uuid) to authenticated;

commit;
