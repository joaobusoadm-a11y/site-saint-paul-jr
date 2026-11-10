import {
  AcoesDoFormulario, Campo, Entrada, EntradaData, Erro, Modal, Selecao,
} from '../componentes/Basicos.jsx';
import { STATUS_PROPOSTA } from '../lib/constantes.js';
import {
  buscarClientesResumo, buscarLeadsDoCliente, excluirProposta, salvarProposta,
} from '../lib/dados.js';
import { moedaParaCampo, numeroDeMoeda, textoOuNulo } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Proposta (só gestão). proposta = null para cadastrar. clienteId fixa o cliente.
export default function FormProposta({ proposta, clienteId, aoFechar, aoSalvar }) {
  const envio = useEnvio();
  const [f, mudar, setF] = useCampos({
    numero: proposta?.numero || '',
    cliente_id: proposta?.cliente_id || clienteId || '',
    lead_id: proposta?.lead_id || '',
    valor: moedaParaCampo(proposta?.valor),
    envio: proposta?.envio || '',
    validade: proposta?.validade || '',
    status: proposta?.status || 'Enviada',
    link: proposta?.link || '',
  });

  const clientes = useConsulta(buscarClientesResumo, []);
  const leads = useConsulta(
    () => (f.cliente_id ? buscarLeadsDoCliente(f.cliente_id) : Promise.resolve([])),
    [f.cliente_id],
  );
  const leadsDoCliente = (leads.dados || []).filter((lead) => lead.cliente_id === f.cliente_id);

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const valor = numeroDeMoeda(f.valor);
    if (valor === undefined) {
      envio.setErro('O valor precisa ser um número, como 12.500,00.');
      return;
    }
    envio.enviar(async () => {
      const salva = await salvarProposta(proposta?.id, {
        numero: f.numero.trim(),
        cliente_id: f.cliente_id,
        lead_id: f.lead_id || null,
        valor,
        envio: f.envio || null,
        validade: f.validade || null,
        status: f.status,
        link: textoOuNulo(f.link),
      });
      aoSalvar(salva);
    });
  };

  const aoExcluir = () => {
    if (!window.confirm(`Excluir a proposta ${proposta.numero}?`)) return;
    envio.enviar(async () => {
      await excluirProposta(proposta.id);
      aoSalvar(null);
    });
  };

  return (
    <Modal titulo={proposta ? `Proposta ${proposta.numero}` : 'Nova proposta'} rotulo="Só gestão" aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Número" obrigatorio>
            <Entrada required autoFocus={!proposta} value={f.numero} onChange={mudar('numero')} placeholder="Ex.: 2026-014" />
          </Campo>
          <Campo rotulo="Status">
            <Selecao value={f.status} onChange={mudar('status')} opcoes={STATUS_PROPOSTA} />
          </Campo>
        </div>
        <Campo rotulo="Cliente" obrigatorio>
          <Selecao
            required
            value={f.cliente_id}
            onChange={(evento) => setF((a) => ({ ...a, cliente_id: evento.target.value, lead_id: '' }))}
            vazio={clientes.carregando ? 'Carregando…' : 'Escolha'}
            opcoes={(clientes.dados || []).map((c) => ({ id: c.id, nome: c.empresa }))}
          />
        </Campo>
        {leadsDoCliente.length > 0 && (
          <Campo rotulo="Lead">
            <Selecao
              value={f.lead_id}
              onChange={mudar('lead_id')}
              vazio="Sem lead"
              opcoes={leadsDoCliente.map((lead) => ({ id: lead.id, nome: lead.titulo }))}
            />
          </Campo>
        )}
        <Campo rotulo="Valor (R$)">
          <Entrada inputMode="decimal" value={f.valor} onChange={mudar('valor')} placeholder="0,00" />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Data de envio">
            <EntradaData value={f.envio} onChange={mudar('envio')} />
          </Campo>
          <Campo rotulo="Validade">
            <EntradaData value={f.validade} onChange={mudar('validade')} />
          </Campo>
        </div>
        <Campo rotulo="Link do documento">
          <Entrada
            type="url"
            pattern="https://.*"
            title="O link precisa começar com https://"
            value={f.link}
            onChange={mudar('link')}
            placeholder="https://drive.google.com/…"
          />
        </Campo>

        <Erro>{envio.erro || clientes.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} aoExcluir={proposta ? aoExcluir : null} />
      </form>
    </Modal>
  );
}
