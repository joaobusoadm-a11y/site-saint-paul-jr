import { useAuth } from './AuthProvider.jsx';
import { TelaCheia } from './TelaCheia.jsx';

export default function SemAcesso() {
  const { email, sair } = useAuth();
  return (
    <TelaCheia titulo="Acesso não liberado">
      <p>Seu acesso ainda não foi liberado. Fale com a Diretoria.</p>
      <p className="mt-4 text-sm text-suave">
        Você entrou como <strong className="font-semibold text-preto">{email}</strong>.
      </p>
      <button className="btn-secundario mt-6 w-full" onClick={sair}>
        Sair e entrar com outra conta
      </button>
    </TelaCheia>
  );
}
