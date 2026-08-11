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

create table if not exists recommendations (
  id            bigint generated always as identity primary key,
  author_name   text not null,
  relationship  text,
  comment       text not null,
  approved      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_recommendations_approved
  on recommendations (approved, created_at desc);

create table if not exists projects (
  slug         text primary key,
  name         text not null,
  tech         text not null,
  description  text not null,
  category     text not null check (category in ('dev', 'design')),
  folder       text not null,
  url          text not null,
  preview_url  text,
  figma_url    text,
  image        text,
  sort_order   integer not null
);
