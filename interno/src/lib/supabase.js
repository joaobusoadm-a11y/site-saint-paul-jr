import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem as duas variáveis, o site mostra a tela "Falta configurar" (veja o README).
export const configurado = Boolean(url && chave);

export const supabase = configurado
  ? createClient(url, chave, { auth: { storageKey: 'spj-interno-login' } })
  : null;

// Deixa o cliente à mão no console do navegador para os testes de permissão,
// por exemplo: await supabase.from('propostas').select('*')
// Não abre nada novo: a chave "anon" já é pública e quem manda é o RLS do banco.
if (typeof window !== 'undefined') window.supabase = supabase;

const MENSAGENS = {
  42501: 'Você não tem permissão para fazer isso.',
  23503: 'Não dá para excluir: existem registros ligados a este item.',
  23505: 'Já existe um cadastro igual a este.',
  PGRST116: 'Você não tem permissão para editar este item (ou ele não existe mais).',
  23514: 'Algum campo está com um valor que o site não aceita. Links precisam começar com https://',
};

// Transforma o erro do banco numa frase que a pessoa entende
export function mensagemDeErro(erro) {
  if (!erro) return '';
  if (MENSAGENS[erro.code]) return MENSAGENS[erro.code];
  if (erro.message === 'Failed to fetch') return 'Sem conexão. Confira a internet e tente de novo.';
  return erro.message || 'Algo deu errado. Tente de novo.';
}

// Para usar com await: devolve os dados ou lança o erro já traduzido
export async function executar(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(mensagemDeErro(error));
  return data;
}
