import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useApoio } from '../componentes/Apoio.jsx';
import {
  AcoesDoFormulario, AreaTexto, Cabecalho, Campo, Entrada, Erro, Foto, LinkExterno, Modal, Selecao, Vazio,
} from '../componentes/Basicos.jsx';
import { atualizarMeuPerfil } from '../lib/dados.js';
import { aniversarioBR, aniversarioISO, contem, linkWhatsApp, textoOuNulo } from '../lib/formato.js';
import { useCampos, useEnvio } from '../lib/useEnvio.js';

// Cada pessoa edita a própria foto, telefone, bio e aniversário
function FormPerfil({ aoFechar, aoSalvar }) {
  const { membro, fotoDoGoogle } = useAuth();
  const envio = useEnvio();
  const [f, mudar, setF] = useCampos({
    foto: membro.foto || '',
    telefone: membro.telefone || '',
    bio: membro.bio || '',
    aniversario: aniversarioBR(membro.aniversario),
  });

  const aoEnviar = (evento) => {
    evento.preventDefault();
    const aniversario = aniversarioISO(f.aniversario);
    if (aniversario === undefined) {
      envio.setErro('Escreva o aniversário como dia/mês, por exemplo 05/09.');
      return;
    }
    envio.enviar(async () => {
      await atualizarMeuPerfil({
        telefone: textoOuNulo(f.telefone),
        foto: textoOuNulo(f.foto),
        bio: textoOuNulo(f.bio),
        aniversario,
      });
      aoSalvar();
    });
  };

  return (
    <Modal titulo="Meu perfil" rotulo="Equipe" aoFechar={aoFechar}>
      <form className="grid gap-4" onSubmit={aoEnviar}>
        <div className="flex items-center gap-4">
          <Foto src={f.foto} nome={membro.nome} tamanho={72} />
          <div className="min-w-0">
            <p className="font-semibold">{membro.nome}</p>
            <p className="text-sm text-suave">Nome, setor e cargo são alterados pela gestão.</p>
          </div>
        </div>
        <Campo rotulo="Foto (link da imagem)">
          <Entrada
            type="url"
            pattern="https://.*"
            title="O link precisa começar com https://"
            value={f.foto}
            onChange={mudar('foto')}
            placeholder="https://…"
          />
        </Campo>
        {fotoDoGoogle && f.foto !== fotoDoGoogle && (
          <p>
            <button type="button" className="btn-texto" onClick={() => setF((a) => ({ ...a, foto: fotoDoGoogle }))}>
              Usar a foto da minha conta Google
            </button>
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="WhatsApp">
            <Entrada type="tel" value={f.telefone} onChange={mudar('telefone')} placeholder="(11) 90000-0000" />
          </Campo>
          <Campo rotulo="Aniversário (dia/mês)">
            <Entrada inputMode="numeric" value={f.aniversario} onChange={mudar('aniversario')} placeholder="dd/mm" />
          </Campo>
        </div>
        <Campo rotulo="Bio curta" dica={`${f.bio.length}/280`}>
          <AreaTexto maxLength={280} value={f.bio} onChange={mudar('bio')} placeholder="O que você faz na SPJ, em uma ou duas frases" />
        </Campo>
        <Erro>{envio.erro}</Erro>
        <AcoesDoFormulario salvando={envio.salvando} aoCancelar={aoFechar} />
      </form>
    </Modal>
  );
}

export default function Equipe() {
  const { membro, conferirAcesso } = useAuth();
  const { membrosAtivos, opcoes, recarregarMembros } = useApoio();
  const [busca, setBusca] = useState('');
  const [setor, setSetor] = useState('');
  const [editando, setEditando] = useState(false);

  const pessoas = useMemo(
    () =>
      membrosAtivos.filter(
        (m) => (!setor || m.setor === setor) && contem(busca, m.nome, m.cargo, m.setor, m.email),
      ),
    [membrosAtivos, busca, setor],
  );

  return (
    <>
      <Cabecalho titulo="Equipe" rotulo="Pessoas">
        <button className="btn-secundario" onClick={() => setEditando(true)}>
          Editar meu perfil
        </button>
      </Cabecalho>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-full sm:w-80">
          <Entrada
            type="search"
            aria-label="Buscar pessoa"
            placeholder="Buscar por nome ou cargo"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Selecao
            aria-label="Filtrar por setor"
            value={setor}
            onChange={(evento) => setSetor(evento.target.value)}
            vazio="Todos os setores"
            opcoes={opcoes('setor')}
          />
        </div>
      </div>

      {pessoas.length === 0 ? (
        <Vazio titulo="Ninguém encontrado.">Mude a busca ou o filtro.</Vazio>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pessoas.map((pessoa) => {
            const whatsapp = linkWhatsApp(pessoa.telefone);
            return (
              <li key={pessoa.id} className="rounded border border-linha bg-white p-4">
                <div className="flex items-start gap-4">
                  <Foto src={pessoa.foto} nome={pessoa.nome} tamanho={64} />
                  <div className="min-w-0">
                    <p className="rotulo truncate">{pessoa.setor || 'Sem setor'}</p>
                    <h2 className="font-titulo text-xl font-bold leading-tight">{pessoa.nome}</h2>
                    <p className="text-sm text-suave">{pessoa.cargo || 'Sem cargo'}</p>
                  </div>
                </div>
                {pessoa.bio && <p className="mt-3">{pessoa.bio}</p>}
                <p className="mt-3 break-all">
                  <a className="btn-texto" href={`mailto:${pessoa.email}`}>{pessoa.email}</a>
                </p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                  {whatsapp && <LinkExterno href={whatsapp}>WhatsApp</LinkExterno>}
                  {pessoa.id === membro.id && (
                    <button className="btn-texto" onClick={() => setEditando(true)}>
                      Editar meu perfil
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editando && (
        <FormPerfil
          aoFechar={() => setEditando(false)}
          aoSalvar={() => {
            setEditando(false);
            recarregarMembros();
            conferirAcesso(); // atualiza a foto e o nome no menu
          }}
        />
      )}
    </>
  );
}
