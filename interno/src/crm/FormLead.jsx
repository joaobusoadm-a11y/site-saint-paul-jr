import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useApoio } from '../componentes/Apoio.jsx';
import {
  AcoesDoFormulario, AreaTexto, Campo, Entrada, EntradaData, Erro, MaisDetalhes, Modal, Selecao,
} from '../componentes/Basicos.jsx';
import { useRegistrarContato } from '../componentes/Layout.jsx';
import { podeVirarProjeto } from './CriarProjeto.jsx';
import { ETAPAS } from '../lib/constantes.js';
import {
  buscarClientesResumo, buscarContatosDoCliente, excluirLead, salvarCliente, salvarLead,
} from '../lib/dados.js';
import { moedaParaCampo, numeroDeMoeda, textoOuNulo } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

const NOVO_CLIENTE = '__novo__';

// Cadastro e edição de lead. Campos obrigatórios em cima; o resto em "Mais detalhes".
// lead = null para cadastrar. clienteId fixa o cliente (quando aberto pela ficha do cliente).
export default function FormLead({ lead, clienteId, aoFechar, aoSalvar, aoCriarProjeto }) {
  const { membro, ehGestao } = useAuth();
  const { membros, opcoes } = useApoio();
  const registrarContato = useRegistrarContato();
  const envio = useEnvio();

  const podeEditar = !lead || ehGestao || lead.responsavel_id === membro.id;

  const [f, mudar, setF] = useCampos({
    titulo: lead?.titulo || '',
    cliente_id: lead?.cliente_id || clienteId || '',
    novo_cliente: '',
    responsavel_id: lead?.responsavel_id || membro.id,
    proximo_passo: lead?.proximo_passo || '',
    data_proximo_contato: lead?.data_proximo_contato || '',
    etapa: lead?.etapa || 'lead',
    motivo_perda: lead?.motivo_perda || '',
    contato_id: lead?.contato_id || '',
    servico: lead?.servico || '',
    origem: lead?.origem || '',
    valor: moedaParaCampo(lead?.valor),
    observacoes: lead?.observacoes || '',
  });

  const clientes = useConsulta(buscarClientesResumo, []);
  const temCliente = f.cliente_id && f.cliente_id !== NOVO_CLIENTE;
  const contatos = useConsulta(
    () => (temCliente ? buscarContatosDoCliente(f.cliente_id) : Promise.resolve([])),
    [f.cliente_id],
  );

  // Quem aparece em "Responsável": os ativos, mais o responsável atual (mesmo se foi desativado)
  const responsaveis = membros.filter((m) => m.ativo || m.id === f.responsavel_id);

  const aoTrocarCliente = (evento) =>
    setF((anterior) => ({ ...anterior, cliente_id: evento.target.value, contato_id: '' }));

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const valor = ehGestao ? numeroDeMoeda(f.valor) : undefined;
    if (ehGestao && valor === undefined) {
      envio.setErro('O valor precisa ser um número, como 12.500,00.');
      return;
    }
    envio.enviar(async () => {
      let idDoCliente = f.cliente_id;
      if (idDoCliente === NOVO_CLIENTE) {
        const cliente = await salvarCliente(
          null,
          { empresa: f.novo_cliente.trim(), responsavel_id: f.responsavel_id },
          null,
          false,
        );
        idDoCliente = cliente.id;
        setF((anterior) => ({ ...anterior, cliente_id: cliente.id })); // se o lead falhar, não cria o cliente de novo
        clientes.recarregar();
      }
      const salvo = await salvarLead(
        lead?.id,
        {
          titulo: f.titulo.trim(),
          cliente_id: idDoCliente,
          responsavel_id: f.responsavel_id,
          proximo_passo: textoOuNulo(f.proximo_passo),
          data_proximo_contato: f.data_proximo_contato || null,
          etapa: f.etapa,
          motivo_perda: f.etapa === 'perdida' ? f.motivo_perda : null,
          contato_id: f.contato_id || null,
          servico: textoOuNulo(f.servico),
          origem: textoOuNulo(f.origem),
          observacoes: textoOuNulo(f.observacoes),
        },
        valor,
        ehGestao,
      );
      aoSalvar(salvo);
    });
  };

  const aoExcluir = () => {
    if (!window.confirm(`Excluir o lead "${lead.titulo}"? Não dá para desfazer.`)) return;
    envio.enviar(async () => {
      await excluirLead(lead.id);
      aoSalvar(null);
    });
  };

  return (
    <Modal titulo={lead ? lead.titulo : 'Novo lead'} rotulo={lead ? 'Lead' : 'CRM'} aoFechar={aoFechar}>
      {lead && (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <button
            type="button"
            className="btn-texto min-h-[44px]"
            onClick={() => {
              aoFechar();
              registrarContato({ clienteId: lead.cliente_id, leadId: lead.id });
            }}
          >
            Registrar contato
          </button>
          <Link className="btn-texto min-h-[44px]" to={`/crm/clientes/${lead.cliente_id}`}>
            Ver ficha do cliente
          </Link>
          {aoCriarProjeto && podeVirarProjeto(lead, membro, ehGestao) && (
            <button
              type="button"
              className="btn-texto min-h-[44px]"
              onClick={() => {
                aoFechar();
                aoCriarProjeto(lead);
              }}
            >
              Criar projeto
            </button>
          )}
        </div>
      )}
      {!podeEditar && (
        <p className="mb-4 rounded bg-painel p-3 text-suave">Só o responsável e a gestão editam este lead.</p>
      )}

      <form onSubmit={aoEnviar}>
        <fieldset className="grid gap-4" disabled={!podeEditar}>
          <Campo rotulo="Título" obrigatorio>
            <Entrada
              required
              autoFocus={!lead}
              value={f.titulo}
              onChange={mudar('titulo')}
              placeholder="Ex.: Mapeamento de processos"
            />
          </Campo>

          <Campo rotulo="Cliente" obrigatorio>
            <Selecao
              required
              value={f.cliente_id}
              onChange={aoTrocarCliente}
              vazio={clientes.carregando ? 'Carregando…' : 'Escolha'}
              opcoes={[
                { id: NOVO_CLIENTE, nome: '+ Novo cliente' },
                ...(clientes.dados || []).map((c) => ({ id: c.id, nome: c.empresa })),
              ]}
            />
          </Campo>
          {f.cliente_id === NOVO_CLIENTE && (
            <Campo rotulo="Nome da empresa" obrigatorio dica="O cliente é criado junto com o lead.">
              <Entrada required autoFocus value={f.novo_cliente} onChange={mudar('novo_cliente')} />
            </Campo>
          )}

          <Campo rotulo="Responsável" obrigatorio>
            <Selecao
              required
              disabled={!ehGestao}
              value={f.responsavel_id}
              onChange={mudar('responsavel_id')}
              opcoes={(ehGestao ? responsaveis : membros.filter((m) => m.id === f.responsavel_id)).map((m) => ({
                id: m.id,
                nome: m.nome,
              }))}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Próximo passo">
              <Entrada value={f.proximo_passo} onChange={mudar('proximo_passo')} placeholder="Ex.: ligar para o sócio" />
            </Campo>
            <Campo rotulo="Data do próximo contato">
              <EntradaData value={f.data_proximo_contato} onChange={mudar('data_proximo_contato')} />
            </Campo>
          </div>

          <MaisDetalhes aberto={f.etapa === 'perdida'}>
            <Campo rotulo="Etapa">
              <Selecao value={f.etapa} onChange={mudar('etapa')} opcoes={ETAPAS} />
            </Campo>
            {f.etapa === 'perdida' && (
              <Campo rotulo="Motivo da perda" obrigatorio>
                <Selecao
                  required
                  value={f.motivo_perda}
                  onChange={mudar('motivo_perda')}
                  vazio="Escolha"
                  opcoes={[...new Set([...opcoes('motivo_perda'), f.motivo_perda].filter(Boolean))]}
                />
              </Campo>
            )}
            {temCliente && (
              <Campo rotulo="Contato" dica="Contatos são cadastrados na ficha do cliente.">
                <Selecao
                  value={f.contato_id}
                  onChange={mudar('contato_id')}
                  vazio="Sem contato"
                  opcoes={(contatos.dados || []).map((c) => ({ id: c.id, nome: c.nome }))}
                />
              </Campo>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Serviço">
                <Selecao
                  value={f.servico}
                  onChange={mudar('servico')}
                  vazio="Não definido"
                  opcoes={[...new Set([...opcoes('servico'), f.servico].filter(Boolean))]}
                />
              </Campo>
              <Campo rotulo="Origem">
                <Selecao
                  value={f.origem}
                  onChange={mudar('origem')}
                  vazio="Não definida"
                  opcoes={[...new Set([...opcoes('origem'), f.origem].filter(Boolean))]}
                />
              </Campo>
            </div>
            {ehGestao && (
              <Campo rotulo="Valor (R$)" dica="Só a gestão vê este campo.">
                <Entrada inputMode="decimal" value={f.valor} onChange={mudar('valor')} placeholder="0,00" />
              </Campo>
            )}
            <Campo rotulo="Observações">
              <AreaTexto value={f.observacoes} onChange={mudar('observacoes')} />
            </Campo>
          </MaisDetalhes>
        </fieldset>

        <div className="mt-4 grid gap-4">
          <Erro>{envio.erro || clientes.erro}</Erro>
          <AcoesDoFormulario
            salvando={envio.salvando}
            aoCancelar={aoFechar}
            aoExcluir={lead && ehGestao ? aoExcluir : null}
            podeSalvar={podeEditar}
          />
        </div>
      </form>
    </Modal>
  );
}
