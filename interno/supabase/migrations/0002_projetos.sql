-- =====================================================================
-- Site interno da Saint Paul Jr · Projetos (base) e ajuste do perfil
--
-- Como usar: rode depois da 0001, do mesmo jeito (SQL Editor > Run).
--
-- 1. O aniversário passa a ser editado só pela gestão (em Membros).
-- 2. Tabela de projetos, para o "Criar projeto?" quando um lead é ganho.
--    Entregas e checklist de handoff chegam na Fase 2.
-- =====================================================================

-- ---------- 1. Perfil próprio: só foto, telefone e bio ----------

drop function public.atualizar_meu_perfil(text, text, text, date);

create function public.atualizar_meu_perfil(p_telefone text, p_foto text, p_bio text)
returns public.membros
language plpgsql security definer set search_path = '' as $$
declare
  r public.membros;
begin
  update public.membros
  set telefone = nullif(btrim(p_telefone), ''),
      foto     = nullif(btrim(p_foto), ''),
      bio      = nullif(btrim(p_bio), '')
  where id = public.membro_id()
  returning * into r;
  if r.id is null then
    raise exception 'Seu acesso ainda não foi liberado.' using errcode = '42501';
  end if;
  return r;
end $$;

-- ---------- 2. Projetos ----------

create table public.projetos (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null check (btrim(nome) <> ''),
  cliente_id     uuid not null references public.clientes (id),
  lead_id        uuid references public.leads (id) on delete set null,
  responsavel_id uuid references public.membros (id),
  equipe         uuid[] not null default '{}', -- ids de membros
  inicio         date,
  prazo          date,
  status         text not null default 'Em andamento'
                 check (status in ('Em andamento', 'Pausado', 'Concluído')),
  pasta_drive    text check (pasta_drive ~ '^https://'),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- Cada lead vira no máximo um projeto
create unique index projetos_um_por_lead on public.projetos (lead_id) where lead_id is not null;
create index on public.projetos (cliente_id);
create index on public.projetos (responsavel_id);

-- Valor do projeto fica separado: só a gestão lê
create table public.projetos_valores (
  projeto_id uuid primary key references public.projetos (id) on delete cascade,
  valor      numeric(12, 2) not null check (valor >= 0)
);

create trigger projetos_atualizacao before update on public.projetos
  for each row execute function public.marca_atualizacao();

-- "Criar projeto?" com um clique: cria o projeto a partir de um lead ganho.
-- Quem pode: a gestão ou o responsável pelo lead. O valor do lead vai junto,
-- sem passar pelo site (o associado não vê o valor).
create function public.criar_projeto_do_lead(p_lead_id uuid) returns public.projetos
language plpgsql security definer set search_path = '' as $$
declare
  l public.leads;
  p public.projetos;
begin
  select * into l from public.leads where id = p_lead_id;
  if l.id is null
     or public.membro_id() is null
     or not (public.eh_gestao() or l.responsavel_id = public.membro_id()) then
    raise exception 'Você não tem permissão para criar o projeto deste lead.' using errcode = '42501';
  end if;
  if l.etapa <> 'ganha' then
    raise exception 'Só um lead ganho vira projeto.';
  end if;

  insert into public.projetos (nome, cliente_id, lead_id, responsavel_id, inicio, pasta_drive)
  select l.titulo, l.cliente_id, l.id, l.responsavel_id, current_date, c.pasta_drive
  from public.clientes c where c.id = l.cliente_id
  returning * into p;

  insert into public.projetos_valores (projeto_id, valor)
  select p.id, v.valor from public.leads_valores v where v.lead_id = l.id;

  return p;
end $$;

-- ---------- Permissões ----------

alter table public.projetos         enable row level security;
alter table public.projetos_valores enable row level security;

revoke all on public.projetos, public.projetos_valores from anon;
grant select, insert, update, delete on public.projetos, public.projetos_valores to authenticated;
revoke all on function public.atualizar_meu_perfil(text, text, text) from public, anon;
revoke all on function public.criar_projeto_do_lead(uuid) from public, anon;
grant execute on function public.atualizar_meu_perfil(text, text, text) to authenticated;
grant execute on function public.criar_projeto_do_lead(uuid) to authenticated;

-- Projetos: todos veem (sem valor); edita a gestão, o responsável e quem está na equipe
create policy projetos_ver on public.projetos for select to authenticated
  using ((select public.membro_id()) is not null);
create policy projetos_cadastrar on public.projetos for insert to authenticated
  with check ((select public.eh_gestao()));
create policy projetos_editar on public.projetos for update to authenticated
  using (
    (select public.eh_gestao())
    or responsavel_id = (select public.membro_id())
    or (select public.membro_id()) = any (equipe)
  )
  with check (
    (select public.eh_gestao())
    or responsavel_id = (select public.membro_id())
    or (select public.membro_id()) = any (equipe)
  );
create policy projetos_apagar on public.projetos for delete to authenticated
  using ((select public.eh_gestao()));

-- Valor do projeto: só a gestão
create policy projetos_valores_gestao on public.projetos_valores for all to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));
