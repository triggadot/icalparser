-- Enable RLS
alter table calendar_events enable row level security;
alter table webhooks enable row level security;

-- Calendar Events Policies
create policy "Enable insert for authenticated users only"
on calendar_events for insert
to authenticated
with check (true);

create policy "Enable read access for authenticated users only"
on calendar_events for select
to authenticated
using (true);

create policy "Enable update for authenticated users only"
on calendar_events for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users only"
on calendar_events for delete
to authenticated
using (true);

-- Webhooks Policies
create policy "Enable insert for authenticated users only"
on webhooks for insert
to authenticated
with check (true);

create policy "Enable read access for authenticated users only"
on webhooks for select
to authenticated
using (true);

create policy "Enable update for authenticated users only"
on webhooks for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users only"
on webhooks for delete
to authenticated
using (true);

-- For testing purposes, also add policies for anonymous access
create policy "Enable anonymous insert"
on calendar_events for insert
to anon
with check (true);

create policy "Enable anonymous read"
on calendar_events for select
to anon
using (true);

create policy "Enable anonymous insert for webhooks"
on webhooks for insert
to anon
with check (true);

create policy "Enable anonymous read for webhooks"
on webhooks for select
to anon
using (true); 