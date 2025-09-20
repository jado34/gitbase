-- Create essays table to store essay submissions and scores
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Essay',
  content text not null,
  word_count integer not null default 0,
  character_count integer not null default 0,
  
  -- Scoring data
  overall_score decimal(3,1) not null default 0,
  grammar_score decimal(3,1) not null default 0,
  content_score decimal(3,1) not null default 0,
  structure_score decimal(3,1) not null default 0,
  vocabulary_score decimal(3,1) not null default 0,
  coherence_score decimal(3,1) not null default 0,
  
  -- Plagiarism data
  plagiarism_percentage decimal(5,2) not null default 0,
  plagiarism_risk text not null default 'low',
  
  -- Feedback data
  strengths text[],
  weaknesses text[],
  suggestions text[],
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.essays enable row level security;

-- Create policies for essays
create policy "essays_select_own"
  on public.essays for select
  using (auth.uid() = user_id);

create policy "essays_insert_own"
  on public.essays for insert
  with check (auth.uid() = user_id);

create policy "essays_update_own"
  on public.essays for update
  using (auth.uid() = user_id);

create policy "essays_delete_own"
  on public.essays for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists essays_user_id_created_at_idx on public.essays(user_id, created_at desc);
