import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useApoio } from '../componentes/Apoio.jsx';
import {
  AcoesDoFormulario, Cabecalho, Campo, Entrada, Erro, Etiqueta, Modal, Selecao, Vazio,
} from '../componentes/Basicos.jsx';
import { LISTAS, PERFIS } from '../lib/constantes.js';
import {
  adicionarNaLista, buscarNoNomeDe, reatribuir, removerDaLista, salvarMembro,
} from '../lib/dados.js';
import { contem, textoOuNulo } from '../lib/formato.js';
import { useConsulta } from '../lib/useConsulta.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Cadastro e edição de membro (só gestão). membro = null para cadastrar.
function FormMembro({ membro, aoFechar, aoSalvar }) {
  const { opcoes } = useApoio();
  const envio = useEnvio();
  const [f, mudar] = useCampos({
    nome: membro?.nome || '',
    email: membro?.email || '',
    perfil: membro?.perfil || 'associado',
    setor: membro?.setor || '',
    cargo: membro?.cargo || '',
  });

  const aoEnviar = (evento) => {
    evento.preventDefault();
    envio.enviar(async () => {
      await salvarMembro(membro?.id, {
        nome: f.nome.trim(),
        email: f.email.trim().toLowerCase(),
        perfil: f.perfil,
        setor: textoOuNulo(f.setor),
        cargo: textoOuNulo(f.cargo),
      });
      aoSalvar();
    });
  };

  return (
    <Modal titulo={membro ? membro.nome : 'Novo membro'} rotulo="Membros" aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <Campo rotulo="Nome" obrigatorio>
          <Entrada required autoFocus={!membro} value={f.nome} onChange={mudar('nome')} />
        </Campo>
        <Campo rotulo="E-mail da conta Google" obrigatorio dica="É com este e-mail que a pessoa entra no site.">
          <Entrada type="email" required value={f.email} onChange={mudar('email')} />
        </Campo>
        <Campo rotulo="Perfil" obrigatorio dica="Gestão vê valores, propostas e cadastra membros.">
          <Selecao value={f.perfil} onChange={mudar('perfil')} opcoes={PERFIS} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Setor">
            <Selecao
              value={f.setor}
              onChange={mudar('setor')}
              vazio="Sem setor"
              opcoes={[...new Set([...opcoes('setor'), f.setor].filter(Boolean))]}
            />
          </Campo>
          <Campo rotulo="Cargo">
            <Entrada value={f.cargo} onChange={mudar('cargo')} />
          </Campo>
        </div>
        <Erro>{envio.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} />
      </form>
    </Modal>
  );
}

// Ao desativar alguém: mostra o que estava no nome da pessoa, para reatribuir
function Desativar({ membro, aoFechar, aoSalvar }) {
  const { membrosAtivos } = useApoio();
  const envio = useEnvio();
  const noNome = useConsulta(() => buscarNoNomeDe(membro.id), [membro.id]);
  const [para, setPara] = useState('');

  const leads = noNome.dados?.leads || [];
  const clientes = noNome.dados?.clientes || [];
  const temAlgo = leads.length + clientes.length > 0;

  const aoEnviar = (evento) => {
    evento.preventDefault();
    envio.enviar(async () => {
      // Desativa primeiro: assim o acesso cai mesmo que a reatribuição falhe
      await salvarMembro(membro.id, { ativo: false });
      if (temAlgo && para) await reatribuir(membro.id, para);
      aoSalvar();
    });
  };

  return (
    <Modal titulo={`Desativar ${membro.nome}?`} rotulo="Membros" aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <p>A pessoa perde o acesso ao site na hora. O histórico dela continua guardado.</p>

        {noNome.carregando ? (
          <p className="text-suave">Conferindo o que está no nome dela…</p>
        ) : temAlgo ? (
          <div className="rounded bg-painel p-4">
            <p className="font-semibold">Está no nome de {membro.nome}:</p>
            {leads.length > 0 && (
              <>
                <p className="rotulo mt-3">Leads em aberto ({leads.length})</p>
                <ul className="mt-1 grid gap-1">
                  {leads.map((lead) => (
                    <li key={lead.id}>{lead.titulo} · {lead.cliente?.empresa}</li>
                  ))}
                </ul>
              </>
            )}
            {clientes.length > 0 && (
              <>
                <p className="rotulo mt-3">Clientes ({clientes.length})</p>
                <ul className="mt-1 grid gap-1">
                  {clientes.map((cliente) => (
                    <li key={cliente.id}>{cliente.empresa}</li>
                  ))}
                </ul>
              </>
            )}
            <Campo rotulo="Passar tudo para" className="mt-4" dica="Em branco, tudo continua no nome da pessoa desativada.">
              <Selecao
                value={para}
                onChange={(evento) => setPara(evento.target.value)}
                vazio="Não reatribuir agora"
                opcoes={membrosAtivos.filter((m) => m.id !== membro.id).map((m) => ({ id: m.id, nome: m.nome }))}
              />
            </Campo>
          </div>
        ) : (
          <p className="rounded bg-painel p-4">Não há leads em aberto nem clientes no nome dela.</p>
        )}

        <Erro>{envio.erro || noNome.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} textoSalvar="Desativar" />
      </form>
    </Modal>
  );
}

// Listas usadas nos formulários: setores, serviços, origens, segmentos, portes e motivos de perda
function Listas() {
  const { listas, recarregarListas } = useApoio();
  const envio = useEnvio();
  const [novos, setNovos] = useState({});

  const adicionar = (lista) => (evento) => {
    evento.preventDefault();
    const valor = (novos[lista] || '').trim();
    if (!valor) return;
    envio.enviar(async () => {
      const ordem = Math.max(0, ...(listas[lista] || []).map((linha) => linha.ordem)) + 1;
      await adicionarNaLista(lista, valor, ordem);
      setNovos((anterior) => ({ ...anterior, [lista]: '' }));
      await recarregarListas();
    });
  };

  const remover = (linha) => {
    envio.enviar(async () => {
      await removerDaLista(linha.id);
      await recarregarListas();
    });
  };

  return (
    <>
      <p className="mb-4 text-suave">
        Estas listas aparecem como opções nos formulários. Tirar um item daqui não muda o que já foi cadastrado.
      </p>
      <div className="mb-4"><Erro>{envio.erro}</Erro></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LISTAS.map((lista) => (
          <section key={lista.id} className="cartao">
            <h2 className="subtitulo mb-3">{lista.nome}</h2>
            <ul className="grid gap-1">
              {(listas[lista.id] || []).map((linha) => (
                <li key={linha.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 break-words">{linha.valor}</span>
                  <button
                    className="btn-perigo min-h-[44px] shrink-0 text-sm"
                    onClick={() => remover(linha)}
                    aria-label={`Tirar ${linha.valor} de ${lista.nome}`}
                  >
                    Tirar
                  </button>
                </li>
              ))}
            </ul>
            <form className="mt-3 flex gap-2" onSubmit={adicionar(lista.id)}>
              <Entrada
                aria-label={`Novo item em ${lista.nome}`}
                placeholder="Novo item"
                value={novos[lista.id] || ''}
                onChange={(evento) => setNovos((anterior) => ({ ...anterior, [lista.id]: evento.target.value }))}
              />
              <button className="btn-secundario shrink-0" disabled={envio.salvando}>
                Incluir
              </button>
            </form>
          </section>
        ))}
      </div>
    </>
  );
}

export default function Membros() {
  const { membro: eu } = useAuth();
  const { membros, recarregarMembros } = useApoio();
  const envio = useEnvio();
  const [aba, setAba] = useState('membros');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(undefined); // undefined = fechado · null = novo · membro = edição
  const [desativando, setDesativando] = useState(null);

  const lista = membros.filter((m) => contem(busca, m.nome, m.email, m.setor, m.cargo));

  const reativar = (membro) =>
    envio.enviar(async () => {
      await salvarMembro(membro.id, { ativo: true });
      await recarregarMembros();
    });

  return (
    <>
      <Cabecalho titulo="Membros" rotulo="Só gestão">
        {aba === 'membros' && (
          <button className="btn-primario" onClick={() => setAberto(null)}>
            Novo membro
          </button>
        )}
      </Cabecalho>

      <div className="mb-6 flex gap-6 border-b border-linha" role="tablist">
        {[
          { id: 'membros', nome: 'Membros' },
          { id: 'listas', nome: 'Listas' },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={aba === item.id}
            onClick={() => setAba(item.id)}
            className={`-mb-px flex min-h-[44px] items-center border-b-[3px] font-semibold ${
              aba === item.id ? 'border-petroleo text-petroleo' : 'border-white text-suave hover:text-preto'
            }`}
          >
            {item.nome}
          </button>
        ))}
      </div>

      {aba === 'listas' ? (
        <Listas />
      ) : (
        <>
          <div className="mb-4 w-full sm:w-80">
            <Entrada
              type="search"
              aria-label="Buscar membro"
              placeholder="Buscar por nome, e-mail ou setor"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>
          <div className="mb-4"><Erro>{envio.erro}</Erro></div>

          {lista.length === 0 ? (
            <Vazio titulo="Nenhum membro encontrado.">Mude a busca.</Vazio>
          ) : (
            <ul className="grid gap-2">
              {lista.map((membro) => (
                <li
                  key={membro.id}
                  className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded border border-linha p-4 ${
                    membro.ativo ? 'bg-white' : 'bg-painel'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {membro.nome}
                      {membro.id === eu.id && <span className="font-normal text-suave"> (você)</span>}
                    </p>
                    <p className="break-all text-sm text-suave">{membro.email}</p>
                    <p className="text-sm text-suave">
                      {[membro.setor, membro.cargo].filter(Boolean).join(' · ') || 'Sem setor e cargo'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <Etiqueta destaque={membro.perfil === 'gestao'}>
                      {membro.perfil === 'gestao' ? 'Gestão' : 'Associado'}
                    </Etiqueta>
                    {!membro.ativo && <Etiqueta>Desativado</Etiqueta>}
                    <button className="btn-texto min-h-[44px]" onClick={() => setAberto(membro)}>
                      Editar
                    </button>
                    {membro.ativo ? (
                      <button className="btn-perigo min-h-[44px]" onClick={() => setDesativando(membro)}>
                        Desativar
                      </button>
                    ) : (
                      <button className="btn-texto min-h-[44px]" onClick={() => reativar(membro)}>
                        Reativar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {aberto !== undefined && (
        <FormMembro
          membro={aberto}
          aoFechar={() => setAberto(undefined)}
          aoSalvar={() => {
            setAberto(undefined);
            recarregarMembros();
          }}
        />
      )}
      {desativando && (
        <Desativar
          membro={desativando}
          aoFechar={() => setDesativando(null)}
          aoSalvar={() => {
            setDesativando(null);
            recarregarMembros();
          }}
        />
      )}
    </>
  );
}
