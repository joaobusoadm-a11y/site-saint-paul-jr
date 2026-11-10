// Dados de apoio que quase toda tela usa: membros e listas (setores, origens, serviços…).
// São buscados uma vez ao entrar e de novo quando a gestão altera algum deles.
import { createContext, useContext, useMemo } from 'react';
import { buscarListas, buscarMembros } from '../lib/dados.js';
import { useConsulta } from '../lib/useConsulta.js';

const Contexto = createContext(null);

export function useApoio() {
  return useContext(Contexto);
}

export function ApoioProvider({ children }) {
  const membros = useConsulta(buscarMembros, []);
  const listas = useConsulta(buscarListas, []);

  const valor = useMemo(() => {
    const todos = membros.dados || [];
    const porLista = listas.dados || {};
    return {
      membros: todos,
      membrosAtivos: todos.filter((m) => m.ativo),
      // opcoes('setor') → ['Comercial', 'Projetos', …]
      opcoes: (lista) => (porLista[lista] || []).map((linha) => linha.valor),
      listas: porLista,
      recarregarMembros: membros.recarregar,
      recarregarListas: listas.recarregar,
    };
  }, [membros.dados, listas.dados, membros.recarregar, listas.recarregar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
