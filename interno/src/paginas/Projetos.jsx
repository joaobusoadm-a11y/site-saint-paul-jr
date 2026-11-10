import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useApoio } from '../componentes/Apoio.jsx';
import {
  AcoesDoFormulario, Cabecalho, Campo, Carregando, Entrada, EntradaData, Erro, Etiqueta, LinkExterno,
  MaisDetalhes, Modal, Ponto, Selecao, Vazio,
} from '../componentes/Basicos.jsx';
import { STATUS_PROJETO } from '../lib/constantes.js';
import { buscarClientesResumo, buscarProjetos, excluirProjeto, salvarProjeto } from '../lib/dados.js';
import {
  contem, dataBR, jaPassou, moeda, moedaParaCampo, numeroDeMoeda, textoOuNulo,
} from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// projeto = null para cadastrar (só a gestão cadastra do zero; o caminho normal é o "Criar projeto?" do lead ganho)
function FormProjeto({ projeto, aoFechar, aoSalvar }) {
  const { membro, ehGestao } = useAuth();
  const { membros } = useApoio();
  const envio = useEnvio();
  const clientes = useConsulta(() => (projeto ? Promise.resolve([]) : buscarClientesResumo()), []);

  const podeEditar =
    !projeto || ehGestao || projeto.responsavel_id === membro.id || projeto.equipe.includes(membro.id);

  const [f, mudar, setF] = useCampos({
    nome: projeto?.nome || '',
    cliente_id: projeto?.cliente_id || '',
    responsavel_id: projeto ? projeto.responsavel_id || '' : membro.id,
    status: projeto?.status || 'Em andamento',
    inicio: projeto?.inicio || '',
    prazo: projeto?.prazo || '',
    equipe: projeto?.equipe || [],
    valor: moedaParaCampo(projeto?.valor),
    pasta_drive: projeto?.pasta_drive || '',
  });

  const pessoas = membros.filter((m) => m.ativo || m.id === f.responsavel_id || f.equipe.includes(m.id));

  const alternarNaEquipe = (id) =>
    setF((anterior) => ({
      ...anterior,
      equipe: anterior.equipe.includes(id) ? anterior.equipe.filter((x) => x !== id) : [...anterior.equipe, id],
    }));

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const valor = ehGestao ? numeroDeMoeda(f.valor) : undefined;
    if (ehGestao && valor === undefined) {
      envio.setErro('O valor precisa ser um número, como 12.500,00.');
      return;
    }
    envio.enviar(async () => {
      await salvarProjeto(
        projeto?.id,
        {
          nome: f.nome.trim(),
          cliente_id: f.cliente_id,
          responsavel_id: f.responsavel_id || null,
          status: f.status,
          inicio: f.inicio || null,
          prazo: f.prazo || null,
          equipe: f.equipe,
          pasta_drive: textoOuNulo(f.pasta_drive),
        },
        valor,
        ehGestao,
      );
      aoSalvar();
    });
  };

  const aoExcluir = () => {
    if (!window.confirm(`Excluir o projeto "${projeto.nome}"? Não dá para desfazer.`)) return;
    envio.enviar(async () => {
      await excluirProjeto(projeto.id);
      aoSalvar();
    });
  };

  return (
    <Modal titulo={projeto ? projeto.nome : 'Novo projeto'} rotulo={projeto?.cliente?.empresa || 'Projetos'} aoFechar={aoFechar}>
      {!podeEditar && (
        <p className="mb-4 rounded bg-painel p-3 text-suave">Só a gestão, o responsável e a equipe editam este projeto.</p>
      )}
      <form onSubmit={aoEnviar}>
        <fieldset className="grid gap-4" disabled={!podeEditar}>
          <Campo rotulo="Nome" obrigatorio>
            <Entrada required autoFocus={!projeto} value={f.nome} onChange={mudar('nome')} />
          </Campo>
          {!projeto && (
            <Campo rotulo="Cliente" obrigatorio>
              <Selecao
                required
                value={f.cliente_id}
                onChange={mudar('cliente_id')}
                vazio={clientes.carregando ? 'Carregando…' : 'Escolha'}
                opcoes={(clientes.dados || []).map((c) => ({ id: c.id, nome: c.empresa }))}
              />
            </Campo>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Status">
              <Selecao value={f.status} onChange={mudar('status')} opcoes={STATUS_PROJETO} />
            </Campo>
            <Campo rotulo="Responsável">
              <Selecao
                disabled={!ehGestao}
                value={f.responsavel_id}
                onChange={mudar('responsavel_id')}
                vazio="Sem responsável"
                opcoes={pessoas.map((m) => ({ id: m.id, nome: m.nome }))}
              />
            </Campo>
            <Campo rotulo="Início">
              <EntradaData value={f.inicio} onChange={mudar('inicio')} />
            </Campo>
            <Campo rotulo="Prazo final">
              <EntradaData value={f.prazo} onChange={mudar('prazo')} />
            </Campo>
          </div>

          <MaisDetalhes>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Equipe</legend>
              <div className="grid gap-x-4 sm:grid-cols-2">
                {pessoas.map((m) => (
                  <label key={m.id} className="flex min-h-[44px] cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 shrink-0 accent-petroleo"
                      checked={f.equipe.includes(m.id)}
                      onChange={() => alternarNaEquipe(m.id)}
                    />
                    {m.nome}
                  </label>
                ))}
              </div>
            </fieldset>
            {ehGestao && (
              <Campo rotulo="Valor (R$)" dica="Só a gestão vê este campo.">
                <Entrada inputMode="decimal" value={f.valor} onChange={mudar('valor')} placeholder="0,00" />
              </Campo>
            )}
            <Campo rotulo="Link da pasta no Drive">
              <Entrada
                type="url"
                pattern="https://.*"
                title="O link precisa começar com https://"
                value={f.pasta_drive}
                onChange={mudar('pasta_drive')}
                placeholder="https://drive.google.com/…"
              />
            </Campo>
          </MaisDetalhes>
        </fieldset>

        <div className="mt-4 grid gap-4">
          <Erro>{envio.erro || clientes.erro}</Erro>
          <AcoesDoFormulario
            salvando={envio.salvando}
            aoCancelar={aoFechar}
            aoExcluir={projeto && ehGestao ? aoExcluir : null}
            podeSalvar={podeEditar}
          />
        </div>
      </form>
    </Modal>
  );
}

// Lista de projetos. Entregas e checklist de handoff chegam na Fase 2.
export default function Projetos() {
  const { ehGestao } = useAuth();
  const { membros } = useApoio();
  const consulta = useConsulta(() => buscarProjetos(ehGestao), [ehGestao]);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('Em andamento');
  const [aberto, setAberto] = useState(undefined); // undefined = fechado · null = novo · projeto = edição

  const nomeDe = (id) => membros.find((m) => m.id === id)?.nome;

  const projetos = useMemo(
    () =>
      (consulta.dados || []).filter(
        (p) => (!status || p.status === status) && contem(busca, p.nome, p.cliente?.empresa, p.responsavel?.nome),
      ),
    [consulta.dados, busca, status],
  );

  return (
    <>
      <Cabecalho titulo="Projetos">
        {ehGestao && (
          <button className="btn-primario" onClick={() => setAberto(null)}>
            Novo projeto
          </button>
        )}
      </Cabecalho>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-full sm:w-80">
          <Entrada
            type="search"
            aria-label="Buscar projeto"
            placeholder="Buscar por nome, cliente ou responsável"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Selecao
            aria-label="Filtrar por status"
            value={status}
            onChange={(evento) => setStatus(evento.target.value)}
            vazio="Todos os status"
            opcoes={STATUS_PROJETO}
          />
        </div>
      </div>

      <Carregando consulta={consulta}>
        {projetos.length === 0 ? (
          <Vazio titulo="Nenhum projeto encontrado.">
            {consulta.dados?.length
              ? 'Mude a busca ou o filtro de status.'
              : 'Quando um lead vai para Ganha, o site oferece criar o projeto.'}
          </Vazio>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projetos.map((projeto) => {
              const atrasado = projeto.status === 'Em andamento' && jaPassou(projeto.prazo);
              const equipe = projeto.equipe.map(nomeDe).filter(Boolean);
              return (
                <li key={projeto.id} className="flex flex-col rounded border border-linha bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="rotulo truncate">
                      <Link className="hover:underline" to={`/crm/clientes/${projeto.cliente_id}`}>
                        {projeto.cliente?.empresa}
                      </Link>
                    </p>
                    <Etiqueta destaque={projeto.status === 'Em andamento'}>{projeto.status}</Etiqueta>
                  </div>
                  <h2 className="mt-1 font-titulo text-xl font-bold leading-tight">{projeto.nome}</h2>
                  <p className="mt-2 text-sm text-suave">Responsável: {projeto.responsavel?.nome || 'ninguém'}</p>
                  {equipe.length > 0 && <p className="text-sm text-suave">Equipe: {equipe.join(', ')}</p>}
                  <p className={`mt-1 flex items-center gap-2 text-sm ${atrasado ? 'font-semibold text-alerta' : 'text-suave'}`}>
                    {atrasado && <Ponto className="bg-alerta" tamanho={8} />}
                    {projeto.prazo ? `Prazo final: ${dataBR(projeto.prazo)}${atrasado ? ' (atrasado)' : ''}` : 'Sem prazo final'}
                  </p>
                  {projeto.valor !== null && <p className="mt-1 text-sm font-semibold">{moeda(projeto.valor)}</p>}
                  <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-3">
                    <button className="btn-texto" onClick={() => setAberto(projeto)}>
                      Abrir
                    </button>
                    <LinkExterno href={projeto.pasta_drive}>Abrir pasta</LinkExterno>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Carregando>

      {aberto !== undefined && (
        <FormProjeto
          projeto={aberto}
          aoFechar={() => setAberto(undefined)}
          aoSalvar={() => {
            setAberto(undefined);
            consulta.recarregar();
          }}
        />
      )}
    </>
  );
}
