import { useNavigate } from 'react-router-dom';
import { Erro, Modal } from '../componentes/Basicos.jsx';
import { criarProjetoDoLead } from '../lib/dados.js';
import { useEnvio } from '../lib/useEnvio.js';

// Aparece quando um lead vai para Ganha: cria o projeto com um clique.
// O projeto nasce com o nome, o cliente, o responsável, o valor e a pasta do lead.
export default function CriarProjeto({ lead, aoFechar }) {
  const envio = useEnvio();
  const navegar = useNavigate();

  const criar = () =>
    envio.enviar(async () => {
      await criarProjetoDoLead(lead.id);
      aoFechar();
      navegar('/projetos');
    });

  return (
    <Modal titulo="Criar projeto?" rotulo="Lead ganho" aoFechar={aoFechar}>
      <div className="grid gap-4">
        <p>
          <strong className="font-semibold">{lead.titulo}</strong> foi para Ganha. O projeto nasce com o mesmo nome,
          cliente e responsável. Prazo e equipe você completa depois, em Projetos.
        </p>
        <Erro>{envio.erro}</Erro>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className="btn-secundario" onClick={aoFechar}>
            Agora não
          </button>
          <button type="button" className="btn-primario" autoFocus onClick={criar} disabled={envio.salvando}>
            {envio.salvando ? 'Criando…' : 'Criar projeto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Um lead ganho que ainda não virou projeto e que esta pessoa pode transformar em projeto
export function podeVirarProjeto(lead, membro, ehGestao) {
  return (
    lead?.etapa === 'ganha' &&
    !(lead.projetos || []).length &&
    (ehGestao || lead.responsavel_id === membro.id)
  );
}
