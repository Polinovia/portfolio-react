-- Run this once against your Neon Postgres database
-- (Neon SQL editor, `neon` CLI, or Neon MCP) before using the ratings feature.

create table if not exists project_ratings (
  id            bigint generated always as identity primary key,
  project_slug  text not null,
  stars         smallint not null check (stars between 1 and 5),
  comment       text,
  author_name   text,
  approved      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_project_ratings_slug_approved
  on project_ratings (project_slug, approved);
