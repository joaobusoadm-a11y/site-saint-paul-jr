import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { ApoioProvider } from './Apoio.jsx';
import { Foto, Ponto } from './Basicos.jsx';
import RegistrarContato from '../crm/RegistrarContato.jsx';

// Itens do menu. "soGestao" esconde o item do associado.
const MENU = [
  {
    titulo: 'CRM',
    itens: [
      { para: '/crm/leads', nome: 'Leads' },
      { para: '/crm/clientes', nome: 'Clientes' },
      { para: '/crm/contatos', nome: 'Contatos' },
      { para: '/crm/propostas', nome: 'Propostas', soGestao: true },
    ],
  },
  {
    titulo: 'Projetos',
    itens: [{ para: '/projetos', nome: 'Projetos' }],
  },
  {
    titulo: 'Pessoas',
    itens: [
      { para: '/equipe', nome: 'Equipe' },
      { para: '/membros', nome: 'Membros', soGestao: true },
    ],
  },
];

// "Registrar contato" abre de qualquer tela: useRegistrarContato()({ clienteId, leadId })
const ContextoRegistrar = createContext(null);

export function useRegistrarContato() {
  return useContext(ContextoRegistrar).abrir;
}

// Telas que mostram contatos feitos usam isto para se atualizar depois de um registro
export function useAoRegistrarContato(funcao) {
  const { versao } = useContext(ContextoRegistrar);
  useEffect(() => {
    if (versao > 0) funcao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao]);
}

function Menu({ aoNavegar }) {
  const { membro, ehGestao, sair } = useAuth();
  return (
    <div className="fundo-escuro flex h-full flex-col bg-preto text-white">
      {/* Sobre fundo escuro, o logo oficial vai em cima de uma base clara (manual de marca) */}
      <div className="p-4">
        <div className="inline-block rounded bg-white px-4 py-3">
          <img src="/spjr-logo.png" alt="Saint Paul Jr" className="h-8 w-auto" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Menu principal">
        {MENU.map((grupo) => (
          <div key={grupo.titulo} className="mt-4">
            <p className="rotulo px-3 pb-1 text-petroleo-claro">{grupo.titulo}</p>
            <ul>
              {grupo.itens
                .filter((item) => !item.soGestao || ehGestao)
                .map((item) => (
                  <li key={item.para}>
                    <NavLink
                      to={item.para}
                      onClick={aoNavegar}
                      className={({ isActive }) =>
                        `flex min-h-[44px] items-center gap-3 rounded px-3 ${
                          isActive ? 'font-semibold' : 'font-normal hover:bg-petroleo-escuro'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Item ativo marcado com o ponto */}
                          <Ponto className={isActive ? 'bg-petroleo-claro' : 'invisible'} />
                          {item.nome}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-suave p-4">
        <div className="flex items-center gap-3">
          <Foto src={membro.foto} nome={membro.nome} tamanho={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{membro.nome}</p>
            <p className="text-sm text-petroleo-claro">{ehGestao ? 'Gestão' : 'Associado'}</p>
          </div>
        </div>
        <button className="mt-3 min-h-[44px] font-semibold text-petroleo-claro underline-offset-4 hover:underline" onClick={sair}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [gaveta, setGaveta] = useState(false);
  const [registro, setRegistro] = useState(null); // { clienteId, leadId } quando aberto
  const [versao, setVersao] = useState(0);
  const local = useLocation();

  useEffect(() => setGaveta(false), [local.pathname]);

  const abrir = useCallback((inicial = {}) => setRegistro(inicial), []);
  const contexto = useMemo(() => ({ abrir, versao }), [abrir, versao]);

  return (
    <ApoioProvider>
      <ContextoRegistrar.Provider value={contexto}>
        <div className="min-h-screen lg:pl-60">
          {/* Computador: menu lateral fixo */}
          <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
            <Menu />
          </aside>

          {/* Celular: barra no topo e menu de gaveta */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-linha bg-white px-4 py-2 lg:hidden">
            <img src="/spjr-logo.png" alt="Saint Paul Jr" className="h-7 w-auto" />
            <button className="btn-secundario" onClick={() => setGaveta(true)} aria-expanded={gaveta}>
              Menu
            </button>
          </div>
          {gaveta && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div className="h-full w-72 max-w-[85vw]">
                <Menu aoNavegar={() => setGaveta(false)} />
              </div>
              <button
                className="flex-1 bg-preto/60"
                aria-label="Fechar o menu"
                onClick={() => setGaveta(false)}
              />
            </div>
          )}

          <main className="mx-auto max-w-[1800px] p-4 sm:p-6 lg:p-10">
            <Outlet />
          </main>
        </div>

        {registro && (
          <RegistrarContato
            inicial={registro}
            aoFechar={() => setRegistro(null)}
            aoSalvar={() => {
              setRegistro(null);
              setVersao((v) => v + 1);
            }}
          />
        )}
      </ContextoRegistrar.Provider>
    </ApoioProvider>
  );
}
