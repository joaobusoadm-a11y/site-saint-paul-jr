import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, mensagemDeErro } from '../lib/supabase.js';
import { linkSeguro } from '../lib/formato.js';

const Contexto = createContext(null);

export function useAuth() {
  return useContext(Contexto);
}

// sessao: undefined = carregando · null = sem login · objeto = logado com Google
// membro: undefined = conferindo · null = sem acesso liberado · objeto = membro ativo
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(undefined);
  const [membro, setMembro] = useState(undefined);
  const [erroDeAcesso, setErroDeAcesso] = useState('');
  const fotoConferida = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSessao(nova));
    return () => data.subscription.unsubscribe();
  }, []);

  const usuarioId = sessao?.user?.id;
  const fotoDoGoogle = linkSeguro(sessao?.user?.user_metadata?.avatar_url);

  // Pergunta ao banco se esta conta Google é de um membro ativo
  const conferirAcesso = useCallback(async () => {
    if (!usuarioId) {
      setMembro(sessao === null ? null : undefined);
      return;
    }
    const { data, error } = await supabase.rpc('entrar');
    if (error) {
      setErroDeAcesso(mensagemDeErro(error));
      return;
    }
    setErroDeAcesso('');
    setMembro(data?.[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, sessao === null]);

  useEffect(() => {
    setMembro(undefined); // trocou de conta: confere do zero
    fotoConferida.current = false;
    conferirAcesso();
  }, [conferirAcesso]);

  // Confere de novo quando a pessoa volta para a aba (quem foi desativado sai na hora)
  useEffect(() => {
    const aoVoltar = () => document.visibilityState === 'visible' && conferirAcesso();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, [conferirAcesso]);

  // No primeiro acesso, usa a foto da conta Google se a pessoa ainda não tem foto
  useEffect(() => {
    if (!membro || membro.foto || !fotoDoGoogle || fotoConferida.current) return;
    fotoConferida.current = true;
    supabase
      .rpc('atualizar_meu_perfil', {
        p_telefone: membro.telefone,
        p_foto: fotoDoGoogle,
        p_bio: membro.bio,
      })
      .then(({ data }) => data && setMembro(data));
  }, [membro, fotoDoGoogle]);

  const valor = useMemo(
    () => ({
      sessao,
      membro,
      erroDeAcesso,
      ehGestao: membro?.perfil === 'gestao',
      email: sessao?.user?.email || '',
      fotoDoGoogle,
      conferirAcesso,
      entrar: () =>
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        }),
      sair: () => supabase.auth.signOut(),
    }),
    [sessao, membro, erroDeAcesso, fotoDoGoogle, conferirAcesso],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
