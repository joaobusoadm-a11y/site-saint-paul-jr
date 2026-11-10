// Peças pequenas usadas em todas as telas
import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import { dataBR, dataISO, iniciais, linkSeguro } from '../lib/formato.js';

// O ponto da marca: círculo sólido, no lugar de ícones
export function Ponto({ className = 'bg-petroleo', tamanho = 10 }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ width: tamanho, height: tamanho }}
    />
  );
}

export function Cabecalho({ titulo, rotulo, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {rotulo && <p className="rotulo mb-2">{rotulo}</p>}
        <h1 className="titulo break-words">{titulo}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

export function Vazio({ titulo, children }) {
  return (
    <div className="rounded bg-painel p-6">
      <p className="font-semibold">{titulo}</p>
      {children && <p className="mt-1 text-suave">{children}</p>}
    </div>
  );
}

export function Erro({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 font-medium text-alerta">
      <Ponto className="mt-[7px] bg-alerta" />
      <span>{children}</span>
    </p>
  );
}

// Mostra "Carregando", o erro ou o conteúdo de uma busca
export function Carregando({ consulta, children }) {
  if (consulta.carregando && consulta.dados === null) return <p className="text-suave">Carregando…</p>;
  if (consulta.erro && consulta.dados === null) return <Erro>{consulta.erro}</Erro>;
  return (
    <>
      {consulta.erro && <div className="mb-4"><Erro>{consulta.erro}</Erro></div>}
      {children}
    </>
  );
}

export function Etiqueta({ children, destaque = false }) {
  const cor = destaque ? 'border-petroleo bg-petroleo text-white' : 'border-linha bg-white text-preto';
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-sm font-semibold ${cor}`}>
      {children}
    </span>
  );
}

export function Foto({ src, nome, tamanho = 56 }) {
  const link = linkSeguro(src);
  const estilo = { width: tamanho, height: tamanho };
  if (link) {
    return (
      <img
        src={link}
        alt=""
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full border border-linha object-cover"
        style={estilo}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-areia font-titulo font-bold text-petroleo-escuro"
      style={{ ...estilo, fontSize: tamanho * 0.36 }}
    >
      {iniciais(nome)}
    </span>
  );
}

// ---------- Formulários ----------

export function Campo({ rotulo, obrigatorio, dica, children, className = '' }) {
  const idDaDica = useId();
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">
          {rotulo}
          {obrigatorio && <span className="text-petroleo"> *</span>}
        </span>
        {dica ? cloneElement(children, { 'aria-describedby': idDaDica }) : children}
      </label>
      {dica && (
        <p id={idDaDica} className="mt-1 text-sm text-suave">
          {dica}
        </p>
      )}
    </div>
  );
}

export function Entrada(props) {
  return <input className="entrada" {...props} />;
}

// Campo de data sempre em dd/mm/aaaa, em qualquer navegador.
// value e onChange usam 'aaaa-mm-dd' (como o banco guarda). Digitar só "15/11" assume o ano atual.
// "ate" é a data máxima aceita (por exemplo, hoje).
export function EntradaData({ value, onChange, ate, ...props }) {
  const [texto, setTexto] = useState(dataBR(value));
  const campo = useRef(null);

  // Se o valor mudar por fora (outro campo, recarga), o texto acompanha
  useEffect(() => {
    setTexto((atual) => ((dataISO(atual) ?? '') === (value || '') ? atual : dataBR(value)));
  }, [value]);

  // Data inválida trava o envio do formulário com um aviso do próprio navegador
  useEffect(() => {
    const iso = dataISO(texto);
    let aviso = '';
    if (iso === undefined) aviso = 'Escreva a data como dia/mês/ano, por exemplo 15/11/2026.';
    else if (iso && ate && iso > ate) aviso = `A data não pode passar de ${dataBR(ate)}.`;
    campo.current?.setCustomValidity(aviso);
  }, [texto, ate]);

  const aoDigitar = (evento) => {
    const numeros = evento.target.value.replace(/\D/g, '').slice(0, 8);
    const comBarras = [numeros.slice(0, 2), numeros.slice(2, 4), numeros.slice(4)].filter(Boolean).join('/');
    setTexto(comBarras);
    onChange(dataISO(comBarras) ?? '');
  };

  return (
    <input
      ref={campo}
      className="entrada"
      inputMode="numeric"
      autoComplete="off"
      placeholder="dd/mm/aaaa"
      value={texto}
      onChange={aoDigitar}
      onBlur={() => dataISO(texto) && setTexto(dataBR(dataISO(texto)))}
      {...props}
    />
  );
}

export function AreaTexto(props) {
  return <textarea className="entrada" rows={3} {...props} />;
}

// opcoes: lista de textos ou de { id, nome }. "vazio" é o texto da opção em branco.
export function Selecao({ opcoes, vazio, ...props }) {
  return (
    <select className="entrada" {...props}>
      {vazio !== undefined && <option value="">{vazio}</option>}
      {opcoes.map((opcao) => {
        const id = typeof opcao === 'string' ? opcao : opcao.id;
        const nome = typeof opcao === 'string' ? opcao : opcao.nome;
        return (
          <option key={id} value={id}>
            {nome}
          </option>
        );
      })}
    </select>
  );
}

// Campos opcionais ficam escondidos aqui para o formulário continuar curto
export function MaisDetalhes({ children, aberto = false }) {
  return (
    <details className="group rounded border border-linha" open={aberto}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 font-semibold text-petroleo [&::-webkit-details-marker]:hidden">
        <Ponto />
        <span className="group-open:hidden">Mais detalhes</span>
        <span className="hidden group-open:inline">Menos detalhes</span>
      </summary>
      <div className="grid gap-4 border-t border-linha p-4">{children}</div>
    </details>
  );
}

// Janela sobre a tela. No celular ocupa a tela inteira.
export function Modal({ titulo, rotulo, aoFechar, children, largo = false }) {
  const idTitulo = useId();

  useEffect(() => {
    const aoTeclar = (evento) => evento.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', aoTeclar);
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = rolagem;
    };
  }, [aoFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-preto/60 sm:items-center sm:p-4"
      onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={`flex max-h-full w-full flex-col bg-white sm:max-h-[92vh] sm:rounded ${largo ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-linha px-4 py-4 sm:px-6">
          <div className="min-w-0">
            {rotulo && <p className="rotulo">{rotulo}</p>}
            <h2 id={idTitulo} className="subtitulo break-words">
              {titulo}
            </h2>
          </div>
          <button type="button" className="btn-texto min-h-[44px] shrink-0" onClick={aoFechar}>
            Fechar
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}

// Rodapé padrão de formulário: Excluir à esquerda, Cancelar e Salvar à direita
export function AcoesDoFormulario({ salvando, aoCancelar, aoExcluir, textoSalvar = 'Salvar', podeSalvar = true }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div>
        {aoExcluir && (
          <button type="button" className="btn-perigo min-h-[44px]" onClick={aoExcluir} disabled={salvando}>
            Excluir
          </button>
        )}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-secundario" onClick={aoCancelar}>
          {podeSalvar ? 'Cancelar' : 'Fechar'}
        </button>
        {podeSalvar && (
          <button type="submit" className="btn-primario" disabled={salvando}>
            {salvando ? 'Salvando…' : textoSalvar}
          </button>
        )}
      </div>
    </div>
  );
}

// Link que abre em outra aba, só se for https
export function LinkExterno({ href, children, className = 'btn-texto' }) {
  const link = linkSeguro(href);
  if (!link) return null;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
