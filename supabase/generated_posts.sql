create table if not exists public.generated_posts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  theme text not null,
  post_type text not null check (post_type in ('standalone', 'carousel')),
  slide_count integer,
  slides jsonb not null,
  raw_output text,
  handle text,
  custom_cta text,
  selected_color text,
  selected_illustration text,
  illustration_position text,
  font_size text,
  download_base_name text
);

create index if not exists generated_posts_created_at_idx
  on public.generated_posts (created_at desc);
