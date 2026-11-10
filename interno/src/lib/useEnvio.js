import { useState } from 'react';

// Controla o envio de um formulário: mostra "Salvando…" e o erro, se houver.
// Uso: const envio = useEnvio();  envio.enviar(async () => { ...gravar... });
export function useEnvio() {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async (acao) => {
    setSalvando(true);
    setErro('');
    try {
      await acao();
    } catch (e) {
      setErro(e.message || 'Algo deu errado. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  };

  return { salvando, erro, setErro, enviar };
}

// Estado de formulário: const [f, mudar, setF] = useCampos({ nome: '' });  <input onChange={mudar('nome')} />
export function useCampos(inicial) {
  const [campos, setCampos] = useState(inicial);
  const mudar = (campo) => (evento) => {
    const valor = evento?.target ? evento.target.value : evento;
    setCampos((anterior) => ({ ...anterior, [campo]: valor }));
  };
  return [campos, mudar, setCampos];
}
