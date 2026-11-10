import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cabecalho, Carregando, Etiqueta, LinkExterno, Selecao, Vazio } from '../componentes/Basicos.jsx';
import FormProposta from '../crm/FormProposta.jsx';
import { STATUS_PROPOSTA } from '../lib/constantes.js';
import { buscarPropostas } from '../lib/dados.js';
import { dataBR, jaPassou, moeda } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';

const EM_ABERTO = ['Enviada', 'Em negociação'];

// Propostas: só a gestão vê (a tabela inteira é fechada para o associado no banco)
export default function Propostas() {
  const consulta = useConsulta(buscarPropostas, []);
  const [status, setStatus] = useState('');
  const [aberta, setAberta] = useState(undefined); // undefined = fechado · null = nova · proposta = edição

  const propostas = useMemo(
    () => (consulta.dados || []).filter((p) => !status || p.status === status),
    [consulta.dados, status],
  );
  const emAberto = (consulta.dados || []).filter((p) => EM_ABERTO.includes(p.status));
  const totalEmAberto = emAberto.reduce((soma, p) => soma + Number(p.valor || 0), 0);

  return (
    <>
      <Cabecalho titulo="Propostas" rotulo="CRM · só gestão">
        <button className="btn-primario" onClick={() => setAberta(null)}>
          Nova proposta
        </button>
      </Cabecalho>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full sm:w-52">
          <Selecao
            aria-label="Filtrar por status"
            value={status}
            onChange={(evento) => setStatus(evento.target.value)}
            vazio="Todos os status"
            opcoes={STATUS_PROPOSTA}
          />
        </div>
        <p>
          Em aberto: <strong className="font-semibold">{emAberto.length}</strong>
          {totalEmAberto > 0 && <> · <strong className="font-semibold">{moeda(totalEmAberto)}</strong></>}
        </p>
      </div>

      <Carregando consulta={consulta}>
        {propostas.length === 0 ? (
          <Vazio titulo="Nenhuma proposta encontrada.">
            {consulta.dados?.length ? 'Mude o filtro.' : 'Clique em "Nova proposta" para cadastrar a primeira.'}
          </Vazio>
        ) : (
          <ul className="grid gap-2">
            {propostas.map((proposta) => {
              const vencida = EM_ABERTO.includes(proposta.status) && jaPassou(proposta.validade);
              return (
                <li
                  key={proposta.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded border border-linha bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="rotulo truncate">
                      <Link className="hover:underline" to={`/crm/clientes/${proposta.cliente_id}`}>
                        {proposta.cliente?.empresa}
                      </Link>
                    </p>
                    <p className="font-semibold">
                      {proposta.numero}
                      {proposta.valor !== null && ` · ${moeda(proposta.valor)}`}
                    </p>
                    <p className="text-sm text-suave">
                      {proposta.envio ? `Enviada em ${dataBR(proposta.envio)}` : 'Sem data de envio'}
                      {proposta.validade && (
                        <span className={vencida ? 'font-semibold text-alerta' : ''}>
                          {' '}· válida até {dataBR(proposta.validade)}{vencida && ' (vencida)'}
                        </span>
                      )}
                    </p>
                    {proposta.lead && <p className="text-sm text-suave">Lead: {proposta.lead.titulo}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <Etiqueta destaque={proposta.status === 'Aceita'}>{proposta.status}</Etiqueta>
                    <LinkExterno href={proposta.link}>Abrir documento</LinkExterno>
                    <button className="btn-texto min-h-[44px]" onClick={() => setAberta(proposta)}>
                      Editar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Carregando>

      {aberta !== undefined && (
        <FormProposta
          proposta={aberta}
          aoFechar={() => setAberta(undefined)}
          aoSalvar={() => {
            setAberta(undefined);
            consulta.recarregar();
          }}
        />
      )}
    </>
  );
}
