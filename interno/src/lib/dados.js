// Todas as leituras e gravações do banco ficam aqui.
// As permissões valem no banco (RLS): o que o associado não pode ver, o banco não entrega.
import { supabase, executar } from './supabase';
import { ETAPAS_ABERTAS } from './constantes';

// Tabelas de um-para-um podem vir como objeto ou como lista de um item
function umValor(embutido, campo) {
  const linha = Array.isArray(embutido) ? embutido[0] : embutido;
  return linha?.[campo] ?? null;
}

// ---------- Membros e listas ----------

export function buscarMembros() {
  return executar(supabase.from('membros').select('*').order('nome'));
}

export function salvarMembro(id, dados) {
  const tabela = supabase.from('membros');
  return executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
}

export function atualizarMeuPerfil({ telefone, foto, bio }) {
  return executar(
    supabase.rpc('atualizar_meu_perfil', { p_telefone: telefone, p_foto: foto, p_bio: bio }),
  );
}

// O que está no nome de um membro: leads em aberto e clientes
export async function buscarNoNomeDe(membroId) {
  const [leads, clientes] = await Promise.all([
    executar(
      supabase
        .from('leads')
        .select('id, titulo, cliente:clientes!cliente_id(empresa)')
        .eq('responsavel_id', membroId)
        .in('etapa', ETAPAS_ABERTAS)
        .order('titulo'),
    ),
    executar(
      supabase.from('clientes').select('id, empresa').eq('responsavel_id', membroId).order('empresa'),
    ),
  ]);
  return { leads, clientes };
}

export async function reatribuir(deMembroId, paraMembroId) {
  await executar(
    supabase
      .from('leads')
      .update({ responsavel_id: paraMembroId })
      .eq('responsavel_id', deMembroId)
      .in('etapa', ETAPAS_ABERTAS),
  );
  await executar(
    supabase.from('clientes').update({ responsavel_id: paraMembroId }).eq('responsavel_id', deMembroId),
  );
}

// Devolve { setor: [...], origem: [...], ... } com as linhas de cada lista
export async function buscarListas() {
  const linhas = await executar(supabase.from('listas').select('*').order('ordem').order('valor'));
  const listas = {};
  for (const linha of linhas) {
    (listas[linha.lista] ||= []).push(linha);
  }
  return listas;
}

export function adicionarNaLista(lista, valor, ordem) {
  return executar(supabase.from('listas').insert({ lista, valor, ordem }));
}

export function removerDaLista(id) {
  return executar(supabase.from('listas').delete().eq('id', id));
}

// ---------- Clientes ----------

export function buscarClientesResumo() {
  return executar(supabase.from('clientes').select('id, empresa').order('empresa'));
}

export function buscarClientes() {
  return executar(
    supabase
      .from('clientes')
      .select(
        '*, responsavel:membros!responsavel_id(id, nome), leads!cliente_id(id, etapa), projetos!cliente_id(id, status)',
      )
      .order('empresa'),
  );
}

export async function buscarCliente(id, ehGestao) {
  const valorDoLead = ehGestao ? ', valor:leads_valores(valor)' : '';
  const soGestao = ehGestao
    ? ', documento:clientes_documentos(documento), propostas!cliente_id(*)'
    : '';
  const valorDoProjeto = ehGestao ? ', valor:projetos_valores(valor)' : '';
  const cliente = await executar(
    supabase
      .from('clientes')
      .select(
        '*, responsavel:membros!responsavel_id(id, nome), contatos!cliente_id(*), ' +
          `leads!cliente_id(*, responsavel:membros!responsavel_id(id, nome), projetos!lead_id(id)${valorDoLead}), ` +
          `projetos!cliente_id(*, responsavel:membros!responsavel_id(id, nome)${valorDoProjeto}), ` +
          'contatos_feitos!cliente_id(*, responsavel:membros!responsavel_id(id, nome), lead:leads!lead_id(id, titulo))' +
          soGestao,
      )
      .eq('id', id)
      .maybeSingle(),
  );
  if (!cliente) return null;
  cliente.documento = umValor(cliente.documento, 'documento');
  cliente.leads = (cliente.leads || []).map((lead) => ({ ...lead, valor: umValor(lead.valor, 'valor') }));
  cliente.contatos = (cliente.contatos || []).sort((a, b) => a.nome.localeCompare(b.nome));
  cliente.contatos_feitos = (cliente.contatos_feitos || []).sort(
    (a, b) => b.data.localeCompare(a.data) || b.criado_em.localeCompare(a.criado_em),
  );
  cliente.propostas = cliente.propostas || [];
  cliente.projetos = (cliente.projetos || []).map((p) => ({ ...p, valor: umValor(p.valor, 'valor') }));
  return cliente;
}

// "documento" (CPF/CNPJ) só é gravado quando quem salva é da gestão
export async function salvarCliente(id, dados, documento, ehGestao) {
  const tabela = supabase.from('clientes');
  const cliente = await executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
  if (ehGestao) {
    const documentos = supabase.from('clientes_documentos');
    await executar(
      documento
        ? documentos.upsert({ cliente_id: cliente.id, documento })
        : documentos.delete().eq('cliente_id', cliente.id),
    );
  }
  return cliente;
}

export function excluirCliente(id) {
  return executar(supabase.from('clientes').delete().eq('id', id));
}

// ---------- Contatos ----------

export function buscarContatos() {
  return executar(
    supabase.from('contatos').select('*, cliente:clientes!cliente_id(id, empresa)').order('nome'),
  );
}

export function buscarContatosDoCliente(clienteId) {
  return executar(
    supabase.from('contatos').select('id, nome').eq('cliente_id', clienteId).order('nome'),
  );
}

export function salvarContato(id, dados) {
  const tabela = supabase.from('contatos');
  return executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
}

export function excluirContato(id) {
  return executar(supabase.from('contatos').delete().eq('id', id).select().single());
}

// ---------- Leads ----------

export async function buscarLeads(ehGestao) {
  const leads = await executar(
    supabase
      .from('leads')
      .select(
        '*, cliente:clientes!cliente_id(id, empresa), responsavel:membros!responsavel_id(id, nome), projetos!lead_id(id)' +
          (ehGestao ? ', valor:leads_valores(valor)' : ''),
      )
      .order('data_proximo_contato', { ascending: true, nullsFirst: false }),
  );
  return leads.map((lead) => ({ ...lead, valor: umValor(lead.valor, 'valor') }));
}

export function buscarLeadsDoCliente(clienteId) {
  return executar(
    supabase
      .from('leads')
      .select('id, titulo, etapa, cliente_id')
      .eq('cliente_id', clienteId)
      .order('criado_em'),
  );
}

// "valor" só é gravado quando quem salva é da gestão (undefined = não mexer no valor)
export async function salvarLead(id, dados, valor, ehGestao) {
  const tabela = supabase.from('leads');
  const lead = await executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
  if (ehGestao && valor !== undefined) {
    const valores = supabase.from('leads_valores');
    await executar(
      valor === null
        ? valores.delete().eq('lead_id', lead.id)
        : valores.upsert({ lead_id: lead.id, valor }),
    );
  }
  return lead;
}

export function moverLead(id, etapa, motivoPerda = null) {
  return executar(
    supabase
      .from('leads')
      .update({ etapa, motivo_perda: etapa === 'perdida' ? motivoPerda : null })
      .eq('id', id)
      .select()
      .single(),
  );
}

export function excluirLead(id) {
  return executar(supabase.from('leads').delete().eq('id', id).select().single());
}

// ---------- Projetos ----------
// Base da tela Projetos. Entregas e checklist de handoff chegam na Fase 2.

export async function buscarProjetos(ehGestao) {
  const projetos = await executar(
    supabase
      .from('projetos')
      .select(
        '*, cliente:clientes!cliente_id(id, empresa), responsavel:membros!responsavel_id(id, nome)' +
          (ehGestao ? ', valor:projetos_valores(valor)' : ''),
      )
      .order('prazo', { ascending: true, nullsFirst: false }),
  );
  return projetos.map((projeto) => ({ ...projeto, valor: umValor(projeto.valor, 'valor') }));
}

// "Criar projeto?": o banco cria o projeto a partir do lead ganho e leva o valor junto
export function criarProjetoDoLead(leadId) {
  return executar(supabase.rpc('criar_projeto_do_lead', { p_lead_id: leadId }));
}

// "valor" só é gravado quando quem salva é da gestão (undefined = não mexer no valor)
export async function salvarProjeto(id, dados, valor, ehGestao) {
  const tabela = supabase.from('projetos');
  const projeto = await executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
  if (ehGestao && valor !== undefined) {
    const valores = supabase.from('projetos_valores');
    await executar(
      valor === null
        ? valores.delete().eq('projeto_id', projeto.id)
        : valores.upsert({ projeto_id: projeto.id, valor }),
    );
  }
  return projeto;
}

export function excluirProjeto(id) {
  return executar(supabase.from('projetos').delete().eq('id', id).select().single());
}

// ---------- Contatos feitos ----------

// O banco atualiza sozinho o próximo passo e a data do próximo contato do lead
export function registrarContato(dados) {
  return executar(supabase.from('contatos_feitos').insert(dados).select().single());
}

export function excluirContatoFeito(id) {
  return executar(supabase.from('contatos_feitos').delete().eq('id', id).select().single());
}

// ---------- Propostas (só gestão) ----------

export function buscarPropostas() {
  return executar(
    supabase
      .from('propostas')
      .select('*, cliente:clientes!cliente_id(id, empresa), lead:leads!lead_id(id, titulo)')
      .order('envio', { ascending: false, nullsFirst: false }),
  );
}

export function salvarProposta(id, dados) {
  const tabela = supabase.from('propostas');
  return executar(
    id ? tabela.update(dados).eq('id', id).select().single() : tabela.insert(dados).select().single(),
  );
}

export function excluirProposta(id) {
  return executar(supabase.from('propostas').delete().eq('id', id).select().single());
}
