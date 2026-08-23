-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  statut_fiscal text,
  stripe_customer_id text,
  abonnement_actif boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for scans
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nom_marchand text,
  montant_brut numeric,
  charges_estimees numeric,
  impot_estime numeric,
  montant_net numeric,
  date_scan timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- Enable RLS on both tables
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

-- Profiles RLS policies
create policy "Les utilisateurs peuvent voir leur propre profil."
  on profiles for select
  using ( auth.uid() = id );

create policy "Les utilisateurs peuvent insérer leur propre profil."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Les utilisateurs peuvent mettre à jour leur propre profil."
  on profiles for update
  using ( auth.uid() = id );

-- Scans RLS policies
create policy "Les utilisateurs peuvent voir leurs propres scans."
  on scans for select
  using ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent insérer leurs propres scans."
  on scans for insert
  with check ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent mettre à jour leurs propres scans."
  on scans for update
  using ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent supprimer leurs propres scans."
  on scans for delete
  using ( auth.uid() = user_id );

-- Create a trigger to automatically create a profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
