import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider.jsx';
import Login from './auth/Login.jsx';
import SemAcesso from './auth/SemAcesso.jsx';
import { TelaCheia } from './auth/TelaCheia.jsx';
import Layout from './componentes/Layout.jsx';
import Leads from './paginas/Leads.jsx';
import Clientes from './paginas/Clientes.jsx';
import ClienteFicha from './paginas/ClienteFicha.jsx';
import Contatos from './paginas/Contatos.jsx';
import Propostas from './paginas/Propostas.jsx';
import Equipe from './paginas/Equipe.jsx';
import Projetos from './paginas/Projetos.jsx';
import Membros from './paginas/Membros.jsx';
import { Vazio } from './componentes/Basicos.jsx';

// Páginas só da gestão. O associado não vê o item no menu e, se digitar o endereço,
// cai neste aviso. Os dados em si são protegidos no banco (RLS), não aqui.
function SoGestao({ children }) {
  const { ehGestao } = useAuth();
  if (!ehGestao) {
    return <Vazio titulo="Esta página é só para a gestão.">Se você precisa de acesso, fale com a Diretoria.</Vazio>;
  }
  return children;
}

export default function App() {
  const { sessao, membro, erroDeAcesso, conferirAcesso } = useAuth();

  if (sessao === undefined || (sessao && membro === undefined && !erroDeAcesso)) {
    return <TelaCheia>Carregando…</TelaCheia>;
  }
  if (!sessao) return <Login />;
  if (erroDeAcesso) {
    return (
      <TelaCheia titulo="Não deu para conferir seu acesso.">
        <p>{erroDeAcesso}</p>
        <button className="btn-primario mt-6" onClick={conferirAcesso}>
          Tentar de novo
        </button>
      </TelaCheia>
    );
  }
  if (!membro) return <SemAcesso />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/crm/leads" replace />} />
        <Route path="crm/leads" element={<Leads />} />
        <Route path="crm/clientes" element={<Clientes />} />
        <Route path="crm/clientes/:id" element={<ClienteFicha />} />
        <Route path="crm/contatos" element={<Contatos />} />
        <Route path="crm/propostas" element={<SoGestao><Propostas /></SoGestao>} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="membros" element={<SoGestao><Membros /></SoGestao>} />
        <Route path="*" element={<Vazio titulo="Página não encontrada.">Confira o endereço ou use o menu.</Vazio>} />
      </Route>
    </Routes>
  );
}
