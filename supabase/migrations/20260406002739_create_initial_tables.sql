-- auth domain
create table salons (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null unique,
  gmail_address text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table stores (
  id         uuid        primary key default gen_random_uuid(),
  salon_id   uuid        not null references salons(id),
  name        text        not null,
  tone_preset text        not null default 'polite',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- review domain
create table review_replies (
  id                uuid        primary key default gen_random_uuid(),
  store_id          uuid        not null references stores(id),
  review_id         uuid,  -- フェーズ2以降に reviews.id を参照
  body              text        not null,
  tone_preset       text        not null,
  status            text        not null default 'pending',
  status_changed_at timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- RLS
alter table salons         enable row level security;
alter table stores         enable row level security;
alter table review_replies enable row level security;
