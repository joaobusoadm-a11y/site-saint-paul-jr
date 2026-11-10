import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { Cabecalho, Carregando, Entrada, Erro, Ponto, Vazio } from '../componentes/Basicos.jsx';
import { useAoRegistrarContato, useRegistrarContato } from '../componentes/Layout.jsx';
import CriarProjeto, { podeVirarProjeto } from '../crm/CriarProjeto.jsx';
import FormLead from '../crm/FormLead.jsx';
import MotivoPerda from '../crm/MotivoPerda.jsx';
import { ETAPAS } from '../lib/constantes.js';
import { buscarLeads, moverLead } from '../lib/dados.js';
import { contem, dataBR, jaPassou, moeda } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';

const FECHADAS = ['ganha', 'perdida'];

// Card do kanban: cliente, título, responsável e data do próximo contato (vermelha se já passou)
function CardLead({ lead, podeMover, aoAbrir, aoArrastar }) {
  const atrasado = !FECHADAS.includes(lead.etapa) && jaPassou(lead.data_proximo_contato);
  return (
    <li>
      {/* div com papel de botão: no Firefox um <button> não pode ser arrastado */}
      <div
        role="button"
        tabIndex={0}
        draggable={podeMover}
        onDragStart={(evento) => {
          evento.dataTransfer.setData('text/plain', lead.id);
          evento.dataTransfer.effectAllowed = 'move';
          aoArrastar(lead);
        }}
        onDragEnd={() => aoArrastar(null)}
        onClick={() => aoAbrir(lead)}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            aoAbrir(lead);
          }
        }}
        className={`block w-full cursor-pointer rounded border border-linha bg-white p-3 text-left hover:border-petroleo ${
          podeMover ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <span className="rotulo block truncate">{lead.cliente?.empresa}</span>
        <span className="mt-1 block font-semibold leading-snug">{lead.titulo}</span>
        <span className="mt-2 block text-sm text-suave">{lead.responsavel?.nome || 'Sem responsável'}</span>
        {lead.etapa === 'perdida' && lead.motivo_perda && (
          <span className="mt-1 block text-sm text-suave">Motivo: {lead.motivo_perda}</span>
        )}
        {!FECHADAS.includes(lead.etapa) && (
          <span className={`mt-1 flex items-center gap-2 text-sm ${atrasado ? 'font-semibold text-alerta' : 'text-suave'}`}>
            {atrasado && <Ponto className="bg-alerta" tamanho={8} />}
            {lead.data_proximo_contato
              ? `Próximo contato: ${dataBR(lead.data_proximo_contato)}${atrasado ? ' (atrasado)' : ''}`
              : 'Sem próximo contato'}
          </span>
        )}
        {lead.etapa === 'ganha' && (
          <span className="mt-1 block text-sm text-suave">
            {(lead.projetos || []).length ? 'Projeto criado' : 'Ainda sem projeto'}
          </span>
        )}
        {lead.valor !== null && lead.valor !== undefined && (
          <span className="mt-1 block text-sm font-semibold">{moeda(lead.valor)}</span>
        )}
      </div>
    </li>
  );
}

export default function Leads() {
  const { membro, ehGestao } = useAuth();
  const consulta = useConsulta(() => buscarLeads(ehGestao), [ehGestao]);
  const registrarContato = useRegistrarContato();
  useAoRegistrarContato(consulta.recarregar);

  const [busca, setBusca] = useState('');
  const [soMeus, setSoMeus] = useState(false);
  const [aberto, setAberto] = useState(undefined); // undefined = fechado · null = novo · lead = edição
  const [arrastando, setArrastando] = useState(null);
  const [sobre, setSobre] = useState(null); // coluna com o card em cima
  const [perda, setPerda] = useState(null); // lead a caminho de Perdida
  const [erro, setErro] = useState('');
  const [movendo, setMovendo] = useState(false);
  const [ganho, setGanho] = useState(null); // lead que acabou de ir para Ganha: "Criar projeto?"

  const podeMover = (lead) => ehGestao || lead.responsavel_id === membro.id;

  const colunas = useMemo(() => {
    const filtrados = (consulta.dados || []).filter(
      (lead) =>
        (!soMeus || lead.responsavel_id === membro.id) &&
        contem(busca, lead.titulo, lead.cliente?.empresa, lead.responsavel?.nome),
    );
    return ETAPAS.map((etapa) => {
      const leads = filtrados.filter((lead) => lead.etapa === etapa.id);
      // Ganha e Perdida: as mais recentes primeiro. As outras já vêm por data do próximo contato.
      if (FECHADAS.includes(etapa.id)) leads.sort((a, b) => b.etapa_desde.localeCompare(a.etapa_desde));
      const total = leads.reduce((soma, lead) => soma + Number(lead.valor || 0), 0);
      return { ...etapa, leads, total };
    });
  }, [consulta.dados, busca, soMeus, membro.id]);

  const gravarEtapa = async (lead, etapa, motivo = null) => {
    setErro('');
    setMovendo(true);
    // Muda na tela na hora; se o banco recusar, volta ao que era
    consulta.definirDados((leads) =>
      leads.map((l) => (l.id === lead.id ? { ...l, etapa, motivo_perda: motivo, etapa_desde: new Date().toISOString() } : l)),
    );
    try {
      await moverLead(lead.id, etapa, motivo);
      setPerda(null);
      if (podeVirarProjeto({ ...lead, etapa }, membro, ehGestao)) setGanho(lead);
    } catch (e) {
      setErro(e.message);
    } finally {
      setMovendo(false);
      consulta.recarregar();
    }
  };

  const aoSoltar = (etapa) => {
    const lead = arrastando;
    setArrastando(null);
    setSobre(null);
    if (!lead || lead.etapa === etapa) return;
    if (etapa === 'perdida') {
      setErro('');
      setPerda(lead);
    } else {
      gravarEtapa(lead, etapa);
    }
  };

  return (
    <>
      <Cabecalho titulo="Leads" rotulo="CRM">
        <button className="btn-secundario" onClick={() => registrarContato()}>
          Registrar contato
        </button>
        <button className="btn-primario" onClick={() => setAberto(null)}>
          Novo lead
        </button>
      </Cabecalho>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-96">
          <Entrada
            type="search"
            aria-label="Buscar lead"
            placeholder="Buscar por título, cliente ou responsável"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            className="h-5 w-5 accent-petroleo"
            checked={soMeus}
            onChange={(evento) => setSoMeus(evento.target.checked)}
          />
          Só os meus
        </label>
      </div>

      {!perda && erro && <div className="mb-4"><Erro>{erro}</Erro></div>}

      <Carregando consulta={consulta}>
        {consulta.dados?.length === 0 ? (
          <Vazio titulo="Nenhum lead cadastrado.">Clique em "Novo lead" para cadastrar o primeiro.</Vazio>
        ) : (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {colunas.map((coluna) => (
              <section
                key={coluna.id}
                aria-label={coluna.nome}
                onDragOver={(evento) => {
                  if (!arrastando) return;
                  evento.preventDefault();
                  setSobre(coluna.id);
                }}
                onDragLeave={(evento) => {
                  if (!evento.currentTarget.contains(evento.relatedTarget)) setSobre(null);
                }}
                onDrop={(evento) => {
                  evento.preventDefault();
                  aoSoltar(coluna.id);
                }}
                className={`flex min-w-[248px] flex-1 basis-0 snap-start flex-col rounded border p-2 ${
                  sobre === coluna.id ? 'border-petroleo bg-areia' : 'border-linha bg-painel'
                }`}
              >
                <header className="px-1 pb-2 pt-1">
                  <h2 className="flex items-baseline justify-between gap-2 font-titulo text-lg font-bold">
                    {coluna.nome}
                    <span className="text-sm font-semibold text-suave">{coluna.leads.length}</span>
                  </h2>
                  {ehGestao && coluna.total > 0 && <p className="text-sm text-suave">{moeda(coluna.total)}</p>}
                </header>
                <ul className="flex min-h-[64px] flex-1 flex-col gap-2">
                  {coluna.leads.map((lead) => (
                    <CardLead
                      key={lead.id}
                      lead={lead}
                      podeMover={podeMover(lead)}
                      aoAbrir={setAberto}
                      aoArrastar={setArrastando}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Carregando>

      {aberto !== undefined && (
        <FormLead
          lead={aberto}
          aoCriarProjeto={setGanho}
          aoFechar={() => setAberto(undefined)}
          aoSalvar={(salvo) => {
            // Mudou para Ganha pelo formulário: também oferece criar o projeto
            if (salvo && aberto?.etapa !== 'ganha' && podeVirarProjeto({ ...aberto, ...salvo }, membro, ehGestao)) {
              setGanho(salvo);
            }
            setAberto(undefined);
            consulta.recarregar();
          }}
        />
      )}

      {ganho && <CriarProjeto lead={ganho} aoFechar={() => setGanho(null)} />}

      {perda && (
        <MotivoPerda
          lead={perda}
          erro={erro}
          salvando={movendo}
          aoFechar={() => setPerda(null)}
          aoConfirmar={(motivo) => gravarEtapa(perda, 'perdida', motivo)}
        />
      )}
    </>
  );
}
