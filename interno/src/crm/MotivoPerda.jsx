import { useState } from 'react';
import { useApoio } from '../componentes/Apoio.jsx';
import { AcoesDoFormulario, Campo, Erro, Modal, Selecao } from '../componentes/Basicos.jsx';

// Ao mover um lead para Perdida, a pessoa escolhe o motivo
export default function MotivoPerda({ lead, aoFechar, aoConfirmar, erro, salvando }) {
  const { opcoes } = useApoio();
  const [motivo, setMotivo] = useState('');

  return (
    <Modal titulo="Por que foi perdido?" rotulo={lead.cliente?.empresa || 'Lead'} aoFechar={aoFechar}>
      <form
        className="grid gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          aoConfirmar(motivo);
        }}
      >
        <p>{lead.titulo}</p>
        <Campo rotulo="Motivo da perda" obrigatorio>
          <Selecao
            required
            autoFocus
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            vazio="Escolha"
            opcoes={opcoes('motivo_perda')}
          />
        </Campo>
        <Erro>{erro}</Erro>
        <AcoesDoFormulario salvando={salvando} aoCancelar={aoFechar} textoSalvar="Mover para Perdida" />
      </form>
    </Modal>
  );
}
