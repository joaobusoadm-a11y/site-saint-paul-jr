import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cabecalho, Carregando, Entrada, LinkExterno, Vazio } from '../componentes/Basicos.jsx';
import { useRegistrarContato } from '../componentes/Layout.jsx';
import FormContato from '../crm/FormContato.jsx';
import { buscarContatos } from '../lib/dados.js';
import { aniversarioBR, contem, linkWhatsApp } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';

// Todas as pessoas de contato, de todos os clientes
export default function Contatos() {
  const consulta = useConsulta(buscarContatos, []);
  const registrarContato = useRegistrarContato();
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(undefined); // undefined = fechado · null = novo · contato = edição

  const contatos = useMemo(
    () => (consulta.dados || []).filter((c) => contem(busca, c.nome, c.cliente?.empresa, c.cargo, c.email)),
    [consulta.dados, busca],
  );

  return (
    <>
      <Cabecalho titulo="Contatos" rotulo="CRM">
        <button className="btn-secundario" onClick={() => registrarContato()}>
          Registrar contato
        </button>
        <button className="btn-primario" onClick={() => setAberto(null)}>
          Novo contato
        </button>
      </Cabecalho>

      <div className="mb-4 w-full sm:w-80">
        <Entrada
          type="search"
          aria-label="Buscar contato"
          placeholder="Buscar por nome, cliente ou cargo"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
      </div>

      <Carregando consulta={consulta}>
        {contatos.length === 0 ? (
          <Vazio titulo="Nenhum contato encontrado.">
            {consulta.dados?.length ? 'Mude a busca.' : 'Os contatos são as pessoas com quem a SPJ fala em cada cliente.'}
          </Vazio>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contatos.map((contato) => {
              const whatsapp = linkWhatsApp(contato.telefone);
              return (
                <li key={contato.id} className="rounded border border-linha bg-white p-4">
                  <p className="rotulo truncate">
                    <Link className="hover:underline" to={`/crm/clientes/${contato.cliente_id}`}>
                      {contato.cliente?.empresa}
                    </Link>
                  </p>
                  <h2 className="mt-1 font-semibold">{contato.nome}</h2>
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
                    <button className="btn-texto" onClick={() => setAberto(contato)}>
                      Editar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Carregando>

      {aberto !== undefined && (
        <FormContato
          contato={aberto}
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
