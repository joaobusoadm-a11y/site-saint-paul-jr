// Etapas do lead, na ordem do kanban
export const ETAPAS = [
  { id: 'lead', nome: 'Lead' },
  { id: 'qualificacao', nome: 'Qualificação' },
  { id: 'diagnostico', nome: 'Diagnóstico' },
  { id: 'proposta', nome: 'Proposta enviada' },
  { id: 'negociacao', nome: 'Negociação' },
  { id: 'ganha', nome: 'Ganha' },
  { id: 'perdida', nome: 'Perdida' },
];

export const NOME_DA_ETAPA = Object.fromEntries(ETAPAS.map((e) => [e.id, e.nome]));

export const ETAPAS_ABERTAS = ['lead', 'qualificacao', 'diagnostico', 'proposta', 'negociacao'];

// Jornada do cliente (ficha do cliente)
export const JORNADA = ['Lead', 'Diagnóstico', 'Proposta', 'Fechado', 'Em projeto', 'Entregue'];

const POSICAO_NA_JORNADA = {
  lead: 0,
  qualificacao: 0,
  diagnostico: 1,
  proposta: 2,
  negociacao: 2,
  ganha: 3,
};

// Posição do cliente na jornada: a etapa mais avançada entre os leads e projetos dele (-1 se não tem nada)
export function posicaoNaJornada(leads, projetos) {
  let posicao = -1;
  for (const lead of leads || []) {
    const p = POSICAO_NA_JORNADA[lead.etapa];
    if (p !== undefined && p > posicao) posicao = p;
  }
  for (const projeto of projetos || []) {
    const p = projeto.status === 'Concluído' ? 5 : 4;
    if (p > posicao) posicao = p;
  }
  return posicao;
}

export const STATUS_PROJETO = ['Em andamento', 'Pausado', 'Concluído'];

export const STATUS_CLIENTE = ['Prospect', 'Ativo', 'Inativo', 'Perdido'];

export const TIPOS_DE_CONTATO = [
  { id: 'reuniao', nome: 'Reunião' },
  { id: 'ligacao', nome: 'Ligação' },
  { id: 'whatsapp', nome: 'WhatsApp' },
  { id: 'email', nome: 'E-mail' },
];

export const NOME_DO_TIPO = Object.fromEntries(TIPOS_DE_CONTATO.map((t) => [t.id, t.nome]));

export const STATUS_PROPOSTA = ['Enviada', 'Em negociação', 'Aceita', 'Recusada'];

export const PERFIS = [
  { id: 'associado', nome: 'Associado' },
  { id: 'gestao', nome: 'Gestão' },
];

// Listas que a gestão edita em Membros > Listas
export const LISTAS = [
  { id: 'setor', nome: 'Setores' },
  { id: 'servico', nome: 'Serviços' },
  { id: 'origem', nome: 'Origens' },
  { id: 'segmento', nome: 'Segmentos' },
  { id: 'porte', nome: 'Portes' },
  { id: 'motivo_perda', nome: 'Motivos de perda' },
];
