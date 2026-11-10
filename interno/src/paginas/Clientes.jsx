import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cabecalho, Carregando, Entrada, Etiqueta, Selecao, Vazio } from '../componentes/Basicos.jsx';
import { useRegistrarContato } from '../componentes/Layout.jsx';
import FormCliente from '../crm/FormCliente.jsx';
import { JORNADA, STATUS_CLIENTE, posicaoNaJornada } from '../lib/constantes.js';
import { buscarClientes } from '../lib/dados.js';
import { contem } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';

export default function Clientes() {
  const consulta = useConsulta(buscarClientes, []);
  const registrarContato = useRegistrarContato();
  const navegar = useNavigate();
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [novo, setNovo] = useState(false);

  const clientes = useMemo(
    () =>
      (consulta.dados || []).filter(
        (c) => (!status || c.status === status) && contem(busca, c.empresa, c.cidade, c.segmento, c.responsavel?.nome),
      ),
    [consulta.dados, busca, status],
  );

  return (
    <>
      <Cabecalho titulo="Clientes" rotulo="CRM">
        <button className="btn-secundario" onClick={() => registrarContato()}>
          Registrar contato
        </button>
        <button className="btn-primario" onClick={() => setNovo(true)}>
          Novo cliente
        </button>
      </Cabecalho>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-full sm:w-80">
          <Entrada
            type="search"
            aria-label="Buscar cliente"
            placeholder="Buscar por empresa, cidade ou responsável"
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
            opcoes={STATUS_CLIENTE}
          />
        </div>
      </div>

      <Carregando consulta={consulta}>
        {clientes.length === 0 ? (
          <Vazio titulo="Nenhum cliente encontrado.">
            {consulta.dados?.length ? 'Mude a busca ou o filtro.' : 'Clique em "Novo cliente" para cadastrar o primeiro.'}
          </Vazio>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clientes.map((cliente) => {
              const posicao = posicaoNaJornada(cliente.leads, cliente.projetos);
              return (
                <li key={cliente.id}>
                  <Link
                    to={`/crm/clientes/${cliente.id}`}
                    className="block h-full rounded border border-linha bg-white p-4 hover:border-petroleo"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-titulo text-xl font-bold leading-tight">{cliente.empresa}</h2>
                      <Etiqueta destaque={cliente.status === 'Ativo'}>{cliente.status}</Etiqueta>
                    </div>
                    <p className="mt-2 text-sm text-suave">
                      {[cliente.segmento, cliente.cidade].filter(Boolean).join(' · ') || 'Sem segmento e cidade'}
                    </p>
                    <p className="mt-1 text-sm text-suave">
                      Responsável: {cliente.responsavel?.nome || 'ninguém'}
                    </p>
                    <p className="mt-1 text-sm">
                      Jornada: <span className="font-semibold">{posicao >= 0 ? JORNADA[posicao] : 'sem lead em andamento'}</span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Carregando>

      {novo && (
        <FormCliente
          cliente={null}
          aoFechar={() => setNovo(false)}
          aoSalvar={(cliente) => navegar(`/crm/clientes/${cliente.id}`)}
        />
      )}
    </>
  );
}
