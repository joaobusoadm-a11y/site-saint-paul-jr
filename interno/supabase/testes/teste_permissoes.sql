-- =====================================================================
-- Teste das permissões (RLS) da Fase 1
--
-- Como usar: cole no SQL Editor do Supabase e clique em Run.
-- Se aparecer "Tudo certo", as permissões estão valendo.
-- Se alguma regra falhar, aparece um erro que começa com "FALHOU".
-- Nada fica gravado: o teste desfaz tudo no final (rollback).
-- =====================================================================

begin;

-- Dados de teste (criados como administrador do banco)
insert into public.membros (id, nome, email, perfil, auth_id) values
  ('00000000-0000-4000-8000-0000000000a1', 'Teste Gestão', 'gestao@teste.spj', 'gestao',
   '00000000-0000-4000-8000-0000000000b1'),
  ('00000000-0000-4000-8000-0000000000a2', 'Teste Associado', 'associado@teste.spj', 'associado',
   '00000000-0000-4000-8000-0000000000b2'),
  ('00000000-0000-4000-8000-0000000000a3', 'Teste Outro Associado', 'outro@teste.spj', 'associado',
   '00000000-0000-4000-8000-0000000000b3'),
  ('00000000-0000-4000-8000-0000000000a4', 'Teste Desativado', 'desativado@teste.spj', 'associado',
   '00000000-0000-4000-8000-0000000000b4');
update public.membros set ativo = false where id = '00000000-0000-4000-8000-0000000000a4';

insert into public.clientes (id, empresa, responsavel_id) values
  ('00000000-0000-4000-8000-0000000000c1', 'Cliente Teste A', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-0000000000c2', 'Cliente Teste B', '00000000-0000-4000-8000-0000000000a3');
insert into public.clientes_documentos values
  ('00000000-0000-4000-8000-0000000000c1', '00.000.000/0001-00');
insert into public.leads (id, titulo, cliente_id, responsavel_id) values
  ('00000000-0000-4000-8000-0000000000d1', 'Lead do associado',
   '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-0000000000d2', 'Lead do outro',
   '00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000a3');
insert into public.leads_valores values ('00000000-0000-4000-8000-0000000000d1', 12000);
insert into public.propostas (numero, cliente_id, valor) values
  ('TESTE-001', '00000000-0000-4000-8000-0000000000c1', 12000);

set local role authenticated;

-- ---------- 1. Associado ----------
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-4000-8000-0000000000b2"}', true);

do $$
declare n int;
begin
  assert (select count(*) from public.propostas) = 0,           'FALHOU: associado leu propostas';
  assert (select count(*) from public.leads_valores) = 0,       'FALHOU: associado leu valores';
  assert (select count(*) from public.clientes_documentos) = 0, 'FALHOU: associado leu CPF/CNPJ';
  assert (select count(*) from public.leads) >= 2,              'FALHOU: associado não vê os leads';
  assert (select count(*) from public.clientes) >= 2,           'FALHOU: associado não vê os clientes';
  assert (select count(*) from public.membros) >= 3,            'FALHOU: associado não vê a equipe';

  -- não grava em tabelas da gestão
  begin
    insert into public.propostas (numero, cliente_id) values ('X', '00000000-0000-4000-8000-0000000000c1');
    raise exception 'FALHOU: associado criou proposta';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.leads_valores values ('00000000-0000-4000-8000-0000000000d2', 1);
    raise exception 'FALHOU: associado gravou valor';
  exception when insufficient_privilege then null;
  end;

  -- edita o próprio lead, não edita o do outro
  update public.leads set proximo_passo = 'ligar' where id = '00000000-0000-4000-8000-0000000000d1';
  get diagnostics n = row_count;
  assert n = 1, 'FALHOU: associado não editou o próprio lead';
  update public.leads set proximo_passo = 'invadir' where id = '00000000-0000-4000-8000-0000000000d2';
  get diagnostics n = row_count;
  assert n = 0, 'FALHOU: associado editou o lead de outra pessoa';
  delete from public.leads where id = '00000000-0000-4000-8000-0000000000d1';
  get diagnostics n = row_count;
  assert n = 0, 'FALHOU: associado apagou lead';

  -- não passa o próprio lead para o nome de outra pessoa
  begin
    update public.leads set responsavel_id = '00000000-0000-4000-8000-0000000000a3'
    where id = '00000000-0000-4000-8000-0000000000d1';
    raise exception 'FALHOU: associado transferiu lead';
  exception when insufficient_privilege then null;
  end;

  -- cliente e contatos: só onde é responsável
  update public.clientes set cidade = 'São Paulo' where id = '00000000-0000-4000-8000-0000000000c1';
  get diagnostics n = row_count;
  assert n = 1, 'FALHOU: associado não editou o próprio cliente';
  update public.clientes set cidade = 'X' where id = '00000000-0000-4000-8000-0000000000c2';
  get diagnostics n = row_count;
  assert n = 0, 'FALHOU: associado editou cliente de outra pessoa';
  insert into public.contatos (cliente_id, nome) values ('00000000-0000-4000-8000-0000000000c1', 'Contato A');
  begin
    insert into public.contatos (cliente_id, nome) values ('00000000-0000-4000-8000-0000000000c2', 'Contato B');
    raise exception 'FALHOU: associado criou contato em cliente de outra pessoa';
  exception when insufficient_privilege then null;
  end;

  -- membros: não cadastra, não se promove
  begin
    insert into public.membros (nome, email, perfil) values ('Intruso', 'intruso@teste.spj', 'gestao');
    raise exception 'FALHOU: associado cadastrou membro';
  exception when insufficient_privilege then null;
  end;
  update public.membros set perfil = 'gestao' where id = '00000000-0000-4000-8000-0000000000a2';
  get diagnostics n = row_count;
  assert n = 0, 'FALHOU: associado mudou o próprio perfil';
  begin
    update public.membros set auth_id = '00000000-0000-4000-8000-0000000000b1'
    where id = '00000000-0000-4000-8000-0000000000a2';
    raise exception 'FALHOU: associado trocou a conta de login';
  exception when insufficient_privilege then null;
  end;

  -- edita o próprio perfil pelo caminho certo
  perform public.atualizar_meu_perfil('11 99999-0000', null, 'Bio de teste', null);
  assert (select bio from public.membros where id = '00000000-0000-4000-8000-0000000000a2') = 'Bio de teste',
    'FALHOU: associado não editou o próprio perfil';

  -- registrar contato atualiza o próximo contato do lead
  insert into public.contatos_feitos (cliente_id, lead_id, tipo, resumo, responsavel_id, proximo_passo, data_proximo)
  values ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000d1', 'ligacao',
          'Conversa de teste', '00000000-0000-4000-8000-0000000000a2', 'Enviar proposta', '2030-01-15');
  assert (select data_proximo_contato from public.leads where id = '00000000-0000-4000-8000-0000000000d1') = '2030-01-15',
    'FALHOU: registrar contato não atualizou o lead';
  begin
    insert into public.contatos_feitos (cliente_id, tipo, resumo, responsavel_id)
    values ('00000000-0000-4000-8000-0000000000c1', 'ligacao', 'Em nome de outro',
            '00000000-0000-4000-8000-0000000000a3');
    raise exception 'FALHOU: associado registrou contato no nome de outra pessoa';
  exception when insufficient_privilege then null;
  end;

  -- lead perdido precisa de motivo
  begin
    update public.leads set etapa = 'perdida' where id = '00000000-0000-4000-8000-0000000000d1';
    raise exception 'FALHOU: lead foi para Perdida sem motivo';
  exception when check_violation then null;
  end;

  -- lead ganho ativa o cliente
  update public.leads set etapa = 'ganha' where id = '00000000-0000-4000-8000-0000000000d1';
  assert (select status from public.clientes where id = '00000000-0000-4000-8000-0000000000c1') = 'Ativo',
    'FALHOU: lead ganho não ativou o cliente';
end $$;

-- ---------- 2. Gestão ----------
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-4000-8000-0000000000b1"}', true);

do $$
begin
  assert (select count(*) from public.propostas) >= 1,           'FALHOU: gestão não lê propostas';
  assert (select count(*) from public.leads_valores) >= 1,       'FALHOU: gestão não lê valores';
  assert (select count(*) from public.clientes_documentos) >= 1, 'FALHOU: gestão não lê CPF/CNPJ';
  update public.leads set proximo_passo = 'ok' where id = '00000000-0000-4000-8000-0000000000d2';
  insert into public.membros (nome, email) values ('Novo Teste', 'novo@teste.spj');

  -- desativar tira o acesso na hora (conferido no bloco 3)
  update public.membros set ativo = false where id = '00000000-0000-4000-8000-0000000000a3';
end $$;

-- ---------- 3. Desativado, recém-desativado e conta sem cadastro ----------
do $$
declare conta text;
begin
  foreach conta in array array[
    '00000000-0000-4000-8000-0000000000b4', -- já estava desativado
    '00000000-0000-4000-8000-0000000000b3', -- desativado no bloco 2
    '00000000-0000-4000-8000-0000000000ff'  -- fez login com Google, mas não é membro
  ] loop
    perform set_config('request.jwt.claims',
      json_build_object('role', 'authenticated', 'sub', conta)::text, true);
    assert (select count(*) from public.membros) = 0,   'FALHOU: sem acesso leu membros';
    assert (select count(*) from public.clientes) = 0,  'FALHOU: sem acesso leu clientes';
    assert (select count(*) from public.leads) = 0,     'FALHOU: sem acesso leu leads';
    assert (select count(*) from public.contatos) = 0,  'FALHOU: sem acesso leu contatos';
    assert (select count(*) from public.propostas) = 0, 'FALHOU: sem acesso leu propostas';
    assert (select count(*) from public.listas) = 0,    'FALHOU: sem acesso leu listas';
    begin
      insert into public.clientes (empresa) values ('Invasor');
      raise exception 'FALHOU: sem acesso criou cliente';
    exception when insufficient_privilege then null;
    end;
  end loop;
end $$;

reset role;

-- ---------- 4. Sem login nenhum ----------
set local role anon;
do $$
begin
  begin
    perform count(*) from public.membros;
    raise exception 'FALHOU: visitante sem login leu membros';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.propostas;
    raise exception 'FALHOU: visitante sem login leu propostas';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------- 5. Sempre sobra alguém na gestão ----------
do $$
begin
  if (select count(*) from public.membros where perfil = 'gestao' and ativo) = 1 then
    begin
      update public.membros set ativo = false where perfil = 'gestao' and ativo;
      raise exception 'FALHOU: a última pessoa da gestão foi desativada';
    exception when raise_exception then
      if sqlerrm like 'FALHOU%' then raise; end if;
    end;
  end if;
end $$;

rollback;

select 'Tudo certo: as permissões da Fase 1 estão valendo.' as resultado;
