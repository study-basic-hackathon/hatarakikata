-- Drop tables (reverse dependency order)
drop table if exists career_map_event_tag_attachments;
drop table if exists career_map_event_tags;
drop table if exists career_events;
drop table if exists career_maps;
drop table if exists users;

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text
);

-- Career Maps
create table career_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  start_date text
);

create index career_maps_user_id_idx on career_maps(user_id);

-- Career Events
create table career_events (
  id uuid primary key default gen_random_uuid(),
  career_map_id uuid not null references career_maps(id) on delete cascade,
  name text not null default '',
  start_date text not null,
  end_date text not null,
  strength integer not null default 3 check (strength >= 1 and strength <= 5),
  row integer not null default 0,
  description text
);

create index career_events_career_map_id_idx on career_events(career_map_id);

-- Career Map Event Tags
create table career_map_event_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Career Map Event Tag Attachments
create table career_map_event_tag_attachments (
  career_event_id uuid not null references career_events(id) on delete cascade,
  career_map_event_tag_id uuid not null references career_map_event_tags(id) on delete cascade,
  primary key (career_event_id, career_map_event_tag_id)
);

create index career_map_event_tag_attachments_career_event_id_idx on career_map_event_tag_attachments(career_event_id);
create index career_map_event_tag_attachments_tag_id_idx on career_map_event_tag_attachments(career_map_event_tag_id);
