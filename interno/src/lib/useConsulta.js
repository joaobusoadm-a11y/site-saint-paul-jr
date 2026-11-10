import { useCallback, useEffect, useRef, useState } from 'react';

// Busca dados e guarda o estado da busca.
// Uso: const { dados, carregando, erro, recarregar } = useConsulta(() => buscarAlgo(id), [id]);
export function useConsulta(buscar, dependencias = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: '' });
  const pedido = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recarregar = useCallback(async () => {
    const meuPedido = ++pedido.current;
    try {
      const dados = await buscar();
      if (meuPedido === pedido.current) setEstado({ dados, carregando: false, erro: '' });
    } catch (e) {
      if (meuPedido === pedido.current) {
        setEstado((anterior) => ({ ...anterior, carregando: false, erro: e.message }));
      }
    }
  }, dependencias);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // Para mudar a tela na hora (antes de o banco responder), como ao arrastar um card
  const definirDados = useCallback((novo) => {
    setEstado((anterior) => ({
      ...anterior,
      dados: typeof novo === 'function' ? novo(anterior.dados) : novo,
    }));
  }, []);

  return { ...estado, recarregar, definirDados };
}
