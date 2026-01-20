insert into public.games (name, status, reward_enabled)
values ('Snake', 'active', true)
on conflict (name) do update
set status = excluded.status,
    reward_enabled = excluded.reward_enabled;

