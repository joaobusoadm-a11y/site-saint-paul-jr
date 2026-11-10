import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import {
  Cabecalho, Carregando, Etiqueta, LinkExterno, Ponto, Vazio,
} from '../componentes/Basicos.jsx';
import Jornada from '../componentes/Jornada.jsx';
import { useAoRegistrarContato, useRegistrarContato } from '../componentes/Layout.jsx';
import FormCliente from '../crm/FormCliente.jsx';
import FormContato from '../crm/FormContato.jsx';
import FormLead from '../crm/FormLead.jsx';
import FormProposta from '../crm/FormProposta.jsx';
import { NOME_DA_ETAPA, NOME_DO_TIPO, posicaoNaJornada } from '../lib/constantes.js';
import { buscarCliente } from '../lib/dados.js';
import { aniversarioBR, dataBR, jaPassou, linkWhatsApp, moeda } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';

function Secao({ titulo, acao, children }) {
  return (
    <section className="cartao">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="subtitulo">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Dado({ rotulo, children }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-suave">{rotulo}</dt>
      <dd className="break-words">{children || 'Não informado'}</dd>
    </div>
  );
}

// Ficha do cliente: dados da empresa, contatos, leads, histórico de contatos feitos e propostas
export default function ClienteFicha() {
  const { id } = useParams();
  const { membro, ehGestao } = useAuth();
  const navegar = useNavigate();
  const registrarContato = useRegistrarContato();
  const consulta = useConsulta(() => buscarCliente(id, ehGestao), [id, ehGestao]);
  useAoRegistrarContato(consulta.recarregar);

  // Qual janela está aberta: { tipo: 'cliente' | 'contato' | 'lead' | 'proposta', item }
  const [janela, setJanela] = useState(null);
  const fechar = () => setJanela(null);
  const salvou = () => {
    setJanela(null);
    consulta.recarregar();
  };

  const cliente = consulta.dados;

  if (!consulta.carregando && !consulta.erro && !cliente) {
    return (
      <Vazio titulo="Cliente não encontrado.">
        <Link className="btn-texto" to="/crm/clientes">Voltar para a lista de clientes</Link>
      </Vazio>
    );
  }

  // O associado edita o cliente em que é responsável ou em que tem um lead (a regra vale no banco)
  const podeEditar =
    cliente &&
    (ehGestao ||
      cliente.responsavel_id === membro.id ||
      cliente.leads.some((lead) => lead.responsavel_id === membro.id));

  return (
    <Carregando consulta={consulta}>
      {cliente && (
        <>
          <p className="mb-4">
            <Link className="btn-texto" to="/crm/clientes">Clientes</Link>
          </p>
          <Cabecalho titulo={cliente.empresa} rotulo="Cliente">
            <Etiqueta destaque={cliente.status === 'Ativo'}>{cliente.status}</Etiqueta>
            <LinkExterno href={cliente.pasta_drive} className="btn-secundario">Abrir pasta</LinkExterno>
            {podeEditar && (
              <button className="btn-secundario" onClick={() => setJanela({ tipo: 'cliente' })}>
                Editar
              </button>
            )}
            <button className="btn-primario" onClick={() => registrarContato({ clienteId: cliente.id })}>
              Registrar contato
            </button>
          </Cabecalho>

          <div className="grid gap-4 sm:gap-6">
            <section className="rounded bg-areia p-4 sm:p-6" aria-label="Jornada">
              <p className="rotulo mb-4 text-petroleo-escuro">Jornada do cliente</p>
              <Jornada posicao={posicaoNaJornada(cliente.leads)} />
            </section>

            <Secao titulo="Dados da empresa">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Dado rotulo="Segmento">{cliente.segmento}</Dado>
                <Dado rotulo="Porte">{cliente.porte}</Dado>
                <Dado rotulo="Cidade">{cliente.cidade}</Dado>
                <Dado rotulo="Origem">{cliente.origem}</Dado>
                <Dado rotulo="Responsável">{cliente.responsavel?.nome}</Dado>
                {ehGestao && <Dado rotulo="CPF ou CNPJ">{cliente.documento}</Dado>}
                <Dado rotulo="Pasta no Drive">
                  {cliente.pasta_drive && <LinkExterno href={cliente.pasta_drive}>Abrir pasta</LinkExterno>}
                </Dado>
              </dl>
              {cliente.observacoes && <p className="mt-4 whitespace-pre-line rounded bg-painel p-3">{cliente.observacoes}</p>}
            </Secao>

            <Secao
              titulo="Contatos"
              acao={
                podeEditar && (
                  <button className="btn-texto min-h-[44px]" onClick={() => setJanela({ tipo: 'contato', item: null })}>
                    Novo contato
                  </button>
                )
              }
            >
              {cliente.contatos.length === 0 ? (
                <p className="text-suave">Nenhum contato cadastrado.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {cliente.contatos.map((contato) => {
                    const whatsapp = linkWhatsApp(contato.telefone);
                    return (
                      <li key={contato.id} className="rounded border border-linha p-4">
                        <p className="font-semibold">{contato.nome}</p>
                        <p className="text-sm text-suave">
                          {[contato.cargo, contato.papel].filter(Boolean).join(' · ') || 'Sem cargo informado'}
                        </p>
                        {contato.email && (
                          <p className="mt-1 break-all">
                            <a className="btn-texto" href={`mailto:${contato.email}`}>{contato.email}</a>
                          </p>
                        )}
                        {contato.aniversario && (
                          <p className="mt-1 text-sm text-suave">Aniversário: {aniversarioBR(contato.aniversario)}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                          {whatsapp && <LinkExterno href={whatsapp}>WhatsApp</LinkExterno>}
                          {podeEditar && (
                            <button className="btn-texto" onClick={() => setJanela({ tipo: 'contato', item: contato })}>
                              Editar
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Secao>

            <Secao
              titulo="Leads"
              acao={
                <button className="btn-texto min-h-[44px]" onClick={() => setJanela({ tipo: 'lead', item: null })}>
                  Novo lead
                </button>
              }
            >
              {cliente.leads.length === 0 ? (
                <p className="text-suave">Nenhum lead para este cliente.</p>
              ) : (
                <ul className="grid gap-2">
                  {cliente.leads.map((lead) => {
                    const aberto = !['ganha', 'perdida'].includes(lead.etapa);
                    const atrasado = aberto && jaPassou(lead.data_proximo_contato);
                    return (
                      <li key={lead.id}>
                        <button
                          className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded border border-linha p-3 text-left hover:border-petroleo"
                          onClick={() => setJanela({ tipo: 'lead', item: lead })}
                        >
                          <span className="min-w-0">
                            <span className="block font-semibold">{lead.titulo}</span>
                            <span className="block text-sm text-suave">
                              {lead.responsavel?.nome || 'Sem responsável'}
                              {lead.valor !== null && ` · ${moeda(lead.valor)}`}
                            </span>
                            {aberto && lead.data_proximo_contato && (
                              <span className={`flex items-center gap-2 text-sm ${atrasado ? 'font-semibold text-alerta' : 'text-suave'}`}>
                                {atrasado && <Ponto className="bg-alerta" tamanho={8} />}
                                Próximo contato: {dataBR(lead.data_proximo_contato)}
                                {lead.proximo_passo && ` · ${lead.proximo_passo}`}
                              </span>
                            )}
                          </span>
                          <Etiqueta destaque={lead.etapa === 'ganha'}>{NOME_DA_ETAPA[lead.etapa]}</Etiqueta>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Secao>

            <Secao
              titulo="Contatos feitos"
              acao={
                <button className="btn-texto min-h-[44px]" onClick={() => registrarContato({ clienteId: cliente.id })}>
                  Registrar contato
                </button>
              }
            >
              {cliente.contatos_feitos.length === 0 ? (
                <p className="text-suave">Nenhum contato registrado ainda.</p>
              ) : (
                <ol className="grid gap-4">
                  {cliente.contatos_feitos.map((feito) => (
                    <li key={feito.id} className="flex gap-3">
                      <Ponto className="mt-[7px] bg-petroleo" />
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {dataBR(feito.data)} · {NOME_DO_TIPO[feito.tipo]}
                          <span className="font-normal text-suave"> · {feito.responsavel?.nome || 'Sem responsável'}</span>
                        </p>
                        {feito.lead && <p className="text-sm text-suave">Lead: {feito.lead.titulo}</p>}
                        <p className="whitespace-pre-line">{feito.resumo}</p>
                        {(feito.proximo_passo || feito.data_proximo) && (
                          <p className="text-sm text-suave">
                            Próximo passo: {[feito.proximo_passo, dataBR(feito.data_proximo)].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Secao>

            {ehGestao && (
              <Secao
                titulo="Propostas"
                acao={
                  <button className="btn-texto min-h-[44px]" onClick={() => setJanela({ tipo: 'proposta', item: null })}>
                    Nova proposta
                  </button>
                }
              >
                {cliente.propostas.length === 0 ? (
                  <p className="text-suave">Nenhuma proposta para este cliente.</p>
                ) : (
                  <ul className="grid gap-2">
                    {cliente.propostas.map((proposta) => (
                      <li key={proposta.id}>
                        <button
                          className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded border border-linha p-3 text-left hover:border-petroleo"
                          onClick={() => setJanela({ tipo: 'proposta', item: proposta })}
                        >
                          <span>
                            <span className="block font-semibold">
                              {proposta.numero}
                              {proposta.valor !== null && ` · ${moeda(proposta.valor)}`}
                            </span>
                            <span className="block text-sm text-suave">
                              {proposta.envio ? `Enviada em ${dataBR(proposta.envio)}` : 'Sem data de envio'}
                              {proposta.validade && ` · válida até ${dataBR(proposta.validade)}`}
                            </span>
                          </span>
                          <Etiqueta destaque={proposta.status === 'Aceita'}>{proposta.status}</Etiqueta>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Secao>
            )}
          </div>

          {janela?.tipo === 'cliente' && (
            <FormCliente
              cliente={cliente}
              aoFechar={fechar}
              aoSalvar={salvou}
              aoExcluir={() => navegar('/crm/clientes')}
            />
          )}
          {janela?.tipo === 'contato' && (
            <FormContato contato={janela.item} clienteId={cliente.id} aoFechar={fechar} aoSalvar={salvou} />
          )}
          {janela?.tipo === 'lead' && (
            <FormLead lead={janela.item} clienteId={cliente.id} aoFechar={fechar} aoSalvar={salvou} />
          )}
          {janela?.tipo === 'proposta' && (
            <FormProposta proposta={janela.item} clienteId={cliente.id} aoFechar={fechar} aoSalvar={salvou} />
          )}
        </>
      )}
    </Carregando>
  );
}
