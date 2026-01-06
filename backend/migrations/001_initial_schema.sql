-- Enable pgvector extension
create extension if not exists vector;





-- technologies table
create table technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  origin jsonb default '{}'::jsonb, -- {institution, country, organization}
  funding jsonb default '[]'::jsonb, -- List of funding rounds
  status text, -- Development progress
  maturity_level int, -- TRL 1-9
  market_adoption text, -- low/medium/high
  tags text[],
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb
);

-- embeddings table
create table embeddings (
  id uuid primary key default gen_random_uuid(),
  tech_id uuid references technologies(id) on delete cascade,
  embedding vector(384), -- Dimension for Granite-4.0 (assuming 384 or similar, adjust if needed)
  raw_text text,
  source_url text,
  created_at timestamp with time zone default now()
);

-- product_tracking table (updates)
create table product_tracking (
  id uuid primary key default gen_random_uuid(),
  tech_id uuid references technologies(id) on delete cascade,
  title text,
  summary text,
  source_url text,
  published_at timestamp with time zone,
  type text, -- 'news', 'paper', 'patent'
  created_at timestamp with time zone default now()
);

-- Create indexes
create index on technologies using gin (tags);
create index on embeddings using hnsw (embedding vector_cosine_ops);

-- Vector Search Function
create or replace function match_technologies (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    technologies.id,
    technologies.name,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from technologies
  join embeddings on technologies.id = embeddings.tech_id
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
