-- =====================================================================
-- Site interno da Saint Paul Jr · Fase 1: membros, listas e CRM
--
-- Como usar: no Supabase, abra SQL Editor, cole este arquivo inteiro e
-- clique em Run. Depois rode supabase/primeiro-acesso.sql.
--
-- Regra de segurança: as permissões valem NO BANCO (RLS). Valores,
-- CPF/CNPJ e propostas ficam em tabelas que só a gestão consegue ler.
-- =====================================================================

-- ---------- Tabelas ----------

create table public.membros (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null check (btrim(nome) <> ''),
  email       text not null unique check (email = lower(btrim(email))),
  perfil      text not null default 'associado' check (perfil in ('gestao', 'associado')),
  setor       text,
  cargo       text,
  telefone    text,
  foto        text check (foto ~ '^https://'),
  bio         text check (char_length(bio) <= 280),
  aniversario date, -- só dia e mês importam; o ano gravado é sempre 2000
  ativo       boolean not null default true,
  auth_id     uuid unique, -- conta de login, ligada sozinha no primeiro acesso
  criado_em   timestamptz not null default now()
);

-- Listas que a gestão edita: setor, origem, servico, segmento, porte, motivo_perda
create table public.listas (
  id    uuid primary key default gen_random_uuid(),
  lista text not null,
  valor text not null check (btrim(valor) <> ''),
  ordem int not null default 0,
  unique (lista, valor)
);

create table public.clientes (
  id             uuid primary key default gen_random_uuid(),
  empresa        text not null check (btrim(empresa) <> ''),
  segmento       text,
  porte          text,
  cidade         text,
  origem         text,
  status         text not null default 'Prospect'
                 check (status in ('Prospect', 'Ativo', 'Inativo', 'Perdido')),
  responsavel_id uuid references public.membros (id),
  pasta_drive    text check (pasta_drive ~ '^https://'),
  observacoes    text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- CPF/CNPJ fica separado: só a gestão lê
create table public.clientes_documentos (
  cliente_id uuid primary key references public.clientes (id) on delete cascade,
  documento  text not null check (btrim(documento) <> '')
);

create table public.contatos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes (id) on delete cascade,
  nome        text not null check (btrim(nome) <> ''),
  cargo       text,
  email       text,
  telefone    text,
  papel       text, -- papel na decisão
  aniversario date, -- só dia e mês importam; o ano gravado é sempre 2000
  criado_em   timestamptz not null default now()
);

create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  titulo               text not null check (btrim(titulo) <> ''),
  cliente_id           uuid not null references public.clientes (id),
  contato_id           uuid references public.contatos (id) on delete set null,
  servico              text,
  origem               text,
  etapa                text not null default 'lead'
                       check (etapa in ('lead', 'qualificacao', 'diagnostico', 'proposta',
                                        'negociacao', 'ganha', 'perdida')),
  responsavel_id       uuid references public.membros (id),
  proximo_passo        text,
  data_proximo_contato date,
  motivo_perda         text,
  observacoes          text,
  etapa_desde          timestamptz not null default now(),
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  constraint lead_perdido_tem_motivo check (etapa <> 'perdida' or motivo_perda is not null)
);

-- Valor do lead fica separado: só a gestão lê
create table public.leads_valores (
  lead_id uuid primary key references public.leads (id) on delete cascade,
  valor   numeric(12, 2) not null check (valor >= 0)
);

create table public.contatos_feitos (
  id             uuid primary key default gen_random_uuid(),
  data           date not null default current_date,
  cliente_id     uuid not null references public.clientes (id),
  lead_id        uuid references public.leads (id) on delete set null,
  tipo           text not null check (tipo in ('reuniao', 'ligacao', 'whatsapp', 'email')),
  resumo         text not null check (btrim(resumo) <> ''),
  responsavel_id uuid references public.membros (id),
  proximo_passo  text,
  data_proximo   date,
  criado_em      timestamptz not null default now()
);

-- Propostas: só a gestão lê
create table public.propostas (
  id         uuid primary key default gen_random_uuid(),
  numero     text not null check (btrim(numero) <> ''),
  cliente_id uuid not null references public.clientes (id),
  lead_id    uuid references public.leads (id) on delete set null,
  valor      numeric(12, 2) check (valor >= 0),
  envio      date,
  validade   date,
  status     text not null default 'Enviada'
             check (status in ('Enviada', 'Em negociação', 'Aceita', 'Recusada')),
  link       text check (link ~ '^https://'),
  criado_em  timestamptz not null default now()
);

create index on public.contatos (cliente_id);
create index on public.leads (cliente_id);
create index on public.leads (responsavel_id);
create index on public.clientes (responsavel_id);
create index on public.contatos_feitos (cliente_id, data desc);
create index on public.contatos_feitos (lead_id);
create index on public.propostas (cliente_id);

-- ---------- Quem está logado ----------
-- No primeiro acesso, o site chama entrar(): a conta Google é ligada ao membro
-- que tem o mesmo e-mail. Vale só o e-mail confirmado pelo Google, que a pessoa
-- não consegue trocar por conta própria. Daí em diante vale a conta ligada.

create function public.membro_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select m.id from public.membros m
  where m.auth_id = auth.uid() and m.ativo
$$;

create function public.eh_gestao() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.membros m
    where m.auth_id = auth.uid() and m.ativo and m.perfil = 'gestao'
  )
$$;

create function public.entrar() returns setof public.membros
language plpgsql security definer set search_path = '' as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return;
  end if;

  if not exists (select 1 from public.membros m where m.auth_id = auth.uid()) then
    select lower(i.identity_data ->> 'email') into v_email
    from auth.identities i
    where i.user_id = auth.uid()
      and i.provider = 'google'
      and coalesce((i.identity_data ->> 'email_verified')::boolean, false)
    limit 1;

    if v_email is not null then
      update public.membros m set auth_id = auth.uid()
      where m.email = v_email and m.ativo;
    end if;
  end if;

  return query
    select m.* from public.membros m where m.auth_id = auth.uid() and m.ativo;
end $$;

-- ---------- Regras automáticas ----------

-- Sempre sobra pelo menos uma pessoa ativa na gestão (senão ninguém administra o site)
create function public.membros_protege_gestao() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Trocou o e-mail do membro: a conta antiga deixa de valer
  if new.email is distinct from old.email then
    new.auth_id := null;
  end if;
  if old.perfil = 'gestao' and old.ativo and (new.perfil <> 'gestao' or not new.ativo) then
    if not exists (
      select 1 from public.membros m
      where m.perfil = 'gestao' and m.ativo and m.id <> old.id
    ) then
      raise exception 'O site precisa de pelo menos uma pessoa ativa na gestão.';
    end if;
  end if;
  return new;
end $$;

create trigger membros_protege_gestao before update on public.membros
  for each row execute function public.membros_protege_gestao();

create function public.marca_atualizacao() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create trigger clientes_atualizacao before update on public.clientes
  for each row execute function public.marca_atualizacao();

create function public.leads_antes_de_salvar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  if new.etapa is distinct from old.etapa then
    new.etapa_desde := now();
  end if;
  if new.etapa <> 'perdida' then
    new.motivo_perda := null;
  end if;
  return new;
end $$;

create trigger leads_antes_de_salvar before update on public.leads
  for each row execute function public.leads_antes_de_salvar();

-- Lead ganho: o cliente deixa de ser Prospect e vira Ativo
create function public.leads_ganha_ativa_cliente() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.etapa = 'ganha' and (tg_op = 'INSERT' or old.etapa is distinct from new.etapa) then
    update public.clientes set status = 'Ativo'
    where id = new.cliente_id and status = 'Prospect';
  end if;
  return new;
end $$;

create trigger leads_ganha_ativa_cliente after insert or update on public.leads
  for each row execute function public.leads_ganha_ativa_cliente();

-- Registrar um contato atualiza o próximo passo e a data do próximo contato do lead
create function public.contato_feito_atualiza_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.lead_id is not null then
    update public.leads
    set proximo_passo = new.proximo_passo,
        data_proximo_contato = new.data_proximo
    where id = new.lead_id and cliente_id = new.cliente_id;
    if not found then
      raise exception 'O lead escolhido não é deste cliente.';
    end if;
  end if;
  return new;
end $$;

create trigger contato_feito_atualiza_lead after insert on public.contatos_feitos
  for each row execute function public.contato_feito_atualiza_lead();

-- Cada pessoa edita só a própria foto, telefone, bio e aniversário
create function public.atualizar_meu_perfil(
  p_telefone text, p_foto text, p_bio text, p_aniversario date
) returns public.membros
language plpgsql security definer set search_path = '' as $$
declare
  r public.membros;
begin
  update public.membros
  set telefone    = nullif(btrim(p_telefone), ''),
      foto        = nullif(btrim(p_foto), ''),
      bio         = nullif(btrim(p_bio), ''),
      aniversario = p_aniversario
  where id = public.membro_id()
  returning * into r;
  if r.id is null then
    raise exception 'Seu acesso ainda não foi liberado.' using errcode = '42501';
  end if;
  return r;
end $$;

-- ---------- Permissões (RLS) ----------

alter table public.membros             enable row level security;
alter table public.listas              enable row level security;
alter table public.clientes            enable row level security;
alter table public.clientes_documentos enable row level security;
alter table public.contatos            enable row level security;
alter table public.leads               enable row level security;
alter table public.leads_valores       enable row level security;
alter table public.contatos_feitos     enable row level security;
alter table public.propostas           enable row level security;

-- Quem não fez login não acessa nada
revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from public, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- Em membros, a coluna auth_id só é escrita pela função entrar()
revoke insert, update, delete on public.membros from authenticated;
grant insert (nome, email, perfil, setor, cargo, telefone, foto, bio, aniversario, ativo),
      update (nome, email, perfil, setor, cargo, telefone, foto, bio, aniversario, ativo)
  on public.membros to authenticated;
grant execute on function public.membro_id(), public.eh_gestao(), public.entrar() to authenticated;
grant execute on function public.atualizar_meu_perfil(text, text, text, date) to authenticated;

-- Membros: todo membro ativo vê a equipe; só a gestão cadastra e edita.
-- Ninguém apaga membro: desativa (o histórico continua no nome da pessoa).
create policy membros_ver on public.membros for select to authenticated
  using ((select public.membro_id()) is not null);
create policy membros_gestao_cadastra on public.membros for insert to authenticated
  with check ((select public.eh_gestao()));
create policy membros_gestao_edita on public.membros for update to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));

-- Listas: todos veem, a gestão edita
create policy listas_ver on public.listas for select to authenticated
  using ((select public.membro_id()) is not null);
create policy listas_gestao on public.listas for all to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));

-- Clientes: todos veem. O associado cadastra cliente no próprio nome e edita
-- os clientes em que é responsável ou em que tem um lead.
create policy clientes_ver on public.clientes for select to authenticated
  using ((select public.membro_id()) is not null);
create policy clientes_cadastrar on public.clientes for insert to authenticated
  with check (
    (select public.eh_gestao()) or responsavel_id = (select public.membro_id())
  );
create policy clientes_editar on public.clientes for update to authenticated
  using (
    (select public.eh_gestao())
    or responsavel_id = (select public.membro_id())
    or exists (select 1 from public.leads l
               where l.cliente_id = clientes.id
                 and l.responsavel_id = (select public.membro_id()))
  )
  with check (
    (select public.eh_gestao())
    or responsavel_id = (select public.membro_id())
    or exists (select 1 from public.leads l
               where l.cliente_id = clientes.id
                 and l.responsavel_id = (select public.membro_id()))
  );
create policy clientes_apagar on public.clientes for delete to authenticated
  using ((select public.eh_gestao()));

-- CPF/CNPJ: só a gestão
create policy clientes_documentos_gestao on public.clientes_documentos for all to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));

-- Contatos: todos veem; edita quem pode editar o cliente
create policy contatos_ver on public.contatos for select to authenticated
  using ((select public.membro_id()) is not null);
create policy contatos_editar on public.contatos for all to authenticated
  using (
    (select public.eh_gestao())
    or exists (select 1 from public.clientes c
               where c.id = contatos.cliente_id
                 and c.responsavel_id = (select public.membro_id()))
    or exists (select 1 from public.leads l
               where l.cliente_id = contatos.cliente_id
                 and l.responsavel_id = (select public.membro_id()))
  )
  with check (
    (select public.eh_gestao())
    or exists (select 1 from public.clientes c
               where c.id = contatos.cliente_id
                 and c.responsavel_id = (select public.membro_id()))
    or exists (select 1 from public.leads l
               where l.cliente_id = contatos.cliente_id
                 and l.responsavel_id = (select public.membro_id()))
  );

-- Leads: todos veem (sem valor); o associado cadastra e edita os leads em que é responsável
create policy leads_ver on public.leads for select to authenticated
  using ((select public.membro_id()) is not null);
create policy leads_cadastrar on public.leads for insert to authenticated
  with check (
    (select public.eh_gestao()) or responsavel_id = (select public.membro_id())
  );
create policy leads_editar on public.leads for update to authenticated
  using ((select public.eh_gestao()) or responsavel_id = (select public.membro_id()))
  with check ((select public.eh_gestao()) or responsavel_id = (select public.membro_id()));
create policy leads_apagar on public.leads for delete to authenticated
  using ((select public.eh_gestao()));

-- Valor do lead: só a gestão
create policy leads_valores_gestao on public.leads_valores for all to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));

-- Contatos feitos: todos veem; cada um registra no próprio nome
create policy contatos_feitos_ver on public.contatos_feitos for select to authenticated
  using ((select public.membro_id()) is not null);
create policy contatos_feitos_registrar on public.contatos_feitos for insert to authenticated
  with check (
    (select public.eh_gestao()) or responsavel_id = (select public.membro_id())
  );
create policy contatos_feitos_editar on public.contatos_feitos for update to authenticated
  using ((select public.eh_gestao()) or responsavel_id = (select public.membro_id()))
  with check ((select public.eh_gestao()) or responsavel_id = (select public.membro_id()));
create policy contatos_feitos_apagar on public.contatos_feitos for delete to authenticated
  using ((select public.eh_gestao()) or responsavel_id = (select public.membro_id()));

-- Propostas: só a gestão
create policy propostas_gestao on public.propostas for all to authenticated
  using ((select public.eh_gestao())) with check ((select public.eh_gestao()));

-- ---------- Listas iniciais (a gestão edita depois em Membros > Listas) ----------

insert into public.listas (lista, valor, ordem) values
  ('setor', 'Comercial', 1), ('setor', 'Projetos', 2), ('setor', 'Marketing', 3),
  ('setor', 'Gente & Gestão', 4), ('setor', 'Financeiro', 5),
  ('origem', 'Indicação', 1), ('origem', 'Rede Saint Paul', 2), ('origem', 'Site', 3),
  ('origem', 'Instagram', 4), ('origem', 'LinkedIn', 5), ('origem', 'Evento', 6),
  ('origem', 'Prospecção ativa', 7), ('origem', 'Outro', 8),
  ('servico', 'Plano de negócios', 1), ('servico', 'Análise mercadológica', 2),
  ('servico', 'Análise do consumidor', 3), ('servico', 'Marketing', 4),
  ('servico', 'Financeiro', 5), ('servico', 'Operações', 6), ('servico', 'IA', 7),
  ('segmento', 'Serviços', 1), ('segmento', 'Comércio', 2), ('segmento', 'Indústria', 3),
  ('segmento', 'Tecnologia', 4), ('segmento', 'Educação', 5), ('segmento', 'Saúde', 6),
  ('segmento', 'Alimentação', 7), ('segmento', 'Outro', 8),
  ('porte', 'Micro', 1), ('porte', 'Pequena', 2), ('porte', 'Média', 3), ('porte', 'Grande', 4),
  ('motivo_perda', 'Preço', 1), ('motivo_perda', 'Prazo', 2),
  ('motivo_perda', 'Sem retorno do cliente', 3),
  ('motivo_perda', 'Fechou com outra consultoria', 4),
  ('motivo_perda', 'Fora do escopo da SPJ', 5), ('motivo_perda', 'Projeto adiado', 6),
  ('motivo_perda', 'Outro', 7);
