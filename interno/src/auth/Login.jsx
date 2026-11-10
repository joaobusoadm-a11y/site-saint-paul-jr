import { useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { TelaCheia } from './TelaCheia.jsx';

export default function Login() {
  const { entrar } = useAuth();
  const [erro, setErro] = useState('');

  const aoEntrar = async () => {
    setErro('');
    const { error } = await entrar();
    if (error) setErro('Não deu para abrir o login do Google. Tente de novo.');
  };

  return (
    <TelaCheia titulo="Site interno">
      <p>CRM, equipe e rotina da Saint Paul Jr num lugar só.</p>
      <button className="btn-primario mt-6 w-full" onClick={aoEntrar}>
        Entrar com Google
      </button>
      {erro && <p className="mt-4 font-medium text-alerta" role="alert">{erro}</p>}
      <p className="mt-6 text-sm text-suave">Só entra quem está cadastrado como membro ativo.</p>
    </TelaCheia>
  );
}
