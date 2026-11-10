import { TelaCheia } from './TelaCheia.jsx';

export default function FaltaConfigurar() {
  return (
    <TelaCheia titulo="Falta configurar">
      <p>
        O site ainda não sabe qual é o banco de dados. Preencha <code>VITE_SUPABASE_URL</code> e{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> seguindo o passo a passo do arquivo <code>interno/README.md</code>.
      </p>
    </TelaCheia>
  );
}
