import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { AcoesDoFormulario, AreaTexto, Campo, Entrada, EntradaData, Erro, Modal, Selecao } from '../componentes/Basicos.jsx';
import { ETAPAS_ABERTAS, TIPOS_DE_CONTATO } from '../lib/constantes.js';
import { buscarClientesResumo, buscarLeadsDoCliente, registrarContato } from '../lib/dados.js';
import { hojeISO, textoOuNulo } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Registrar um contato feito com o cliente. Tem que levar menos de 1 minuto.
// Ao salvar, o banco atualiza o próximo passo e a data do próximo contato do lead.
export default function RegistrarContato({ inicial, aoFechar, aoSalvar }) {
  const { membro } = useAuth();
  const envio = useEnvio();
  const [f, mudar, setF] = useCampos({
    data: hojeISO(),
    cliente_id: inicial.clienteId || '',
    lead_id: inicial.leadId || '',
    tipo: 'reuniao',
    resumo: '',
    proximo_passo: '',
    data_proximo: '',
  });

  const clientes = useConsulta(buscarClientesResumo, []);
  const leads = useConsulta(
    () => (f.cliente_id ? buscarLeadsDoCliente(f.cliente_id) : Promise.resolve([])),
    [f.cliente_id],
  );

  // Leads em aberto do cliente escolhido (e o lead de onde a pessoa veio, se for o caso)
  const leadsDoCliente = (leads.dados || []).filter(
    (lead) =>
      lead.cliente_id === f.cliente_id && (ETAPAS_ABERTAS.includes(lead.etapa) || lead.id === f.lead_id),
  );

  // Se o cliente só tem um lead em aberto, ele já vem escolhido
  useEffect(() => {
    setF((anterior) => {
      if (anterior.lead_id) return anterior;
      const abertos = (leads.dados || []).filter(
        (lead) => lead.cliente_id === anterior.cliente_id && ETAPAS_ABERTAS.includes(lead.etapa),
      );
      return abertos.length === 1 ? { ...anterior, lead_id: abertos[0].id } : anterior;
    });
  }, [leads.dados, setF]);

  const aoTrocarCliente = (evento) =>
    setF((anterior) => ({ ...anterior, cliente_id: evento.target.value, lead_id: '' }));

  const aoEnviar = (evento) => {
    evento.preventDefault();
    envio.enviar(async () => {
      await registrarContato({
        data: f.data,
        cliente_id: f.cliente_id,
        lead_id: f.lead_id || null,
        tipo: f.tipo,
        resumo: f.resumo.trim(),
        responsavel_id: membro.id,
        proximo_passo: textoOuNulo(f.proximo_passo),
        data_proximo: f.data_proximo || null,
      });
      aoSalvar();
    });
  };

  return (
    <Modal titulo="Registrar contato" rotulo="CRM" aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Cliente" obrigatorio>
            <Selecao
              required
              autoFocus={!f.cliente_id}
              value={f.cliente_id}
              onChange={aoTrocarCliente}
              vazio={clientes.carregando ? 'Carregando…' : 'Escolha'}
              opcoes={(clientes.dados || []).map((c) => ({ id: c.id, nome: c.empresa }))}
            />
          </Campo>
          <Campo rotulo="Data" obrigatorio>
            <EntradaData required ate={hojeISO()} value={f.data} onChange={mudar('data')} />
          </Campo>
        </div>

        {leadsDoCliente.length > 0 && (
          <Campo rotulo="Lead" dica="O próximo contato deste lead é atualizado ao salvar.">
            <Selecao
              value={f.lead_id}
              onChange={mudar('lead_id')}
              vazio="Sem lead"
              opcoes={leadsDoCliente.map((lead) => ({ id: lead.id, nome: lead.titulo }))}
            />
          </Campo>
        )}

        <fieldset>
          <legend className="mb-1 text-sm font-semibold">
            Tipo<span className="text-petroleo"> *</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIPOS_DE_CONTATO.map((tipo) => (
              <label
                key={tipo.id}
                className="flex min-h-[44px] cursor-pointer items-center justify-center rounded border border-campo px-2 font-semibold has-[:checked]:border-petroleo has-[:checked]:bg-petroleo has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-petroleo"
              >
                <input
                  type="radio"
                  name="tipo"
                  className="sr-only"
                  value={tipo.id}
                  checked={f.tipo === tipo.id}
                  onChange={mudar('tipo')}
                />
                {tipo.nome}
              </label>
            ))}
          </div>
        </fieldset>

        <Campo rotulo="Resumo" obrigatorio>
          <AreaTexto
            required
            autoFocus={Boolean(f.cliente_id)}
            value={f.resumo}
            onChange={mudar('resumo')}
            placeholder="O que foi conversado, em poucas linhas"
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Próximo passo">
            <Entrada value={f.proximo_passo} onChange={mudar('proximo_passo')} placeholder="Ex.: enviar proposta" />
          </Campo>
          <Campo rotulo="Data do próximo contato">
            <EntradaData value={f.data_proximo} onChange={mudar('data_proximo')} />
          </Campo>
        </div>

        <Erro>{envio.erro || clientes.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} textoSalvar="Registrar" />
      </form>
    </Modal>
  );
}
