/* =========================================================
   Saint Paul Jr · comportamento do site
   ========================================================= */

/*
  CONTATOS DA SPJ: preencha aqui e o site inteiro se atualiza
  (menu lateral, seção de contato, rodapé e botão de WhatsApp).
  Enquanto um campo estiver vazio, o site mostra "a definir".
*/
const CONTATO = {
  email: 'saintpauljr29@gmail.com',
  whatsapp: '556281770062', // só números, com DDI e DDD
  whatsappTexto: '+55 (62) 8177-0062', // como o número aparece no site
  linkedin: 'https://www.linkedin.com/company/saintpauljr/',
  linkedinTexto: 'Saint Paul Jr', // como o LinkedIn aparece no site
  instagram: 'https://www.instagram.com/saintpauljrr/',
  instagramTexto: 'Saintpauljrr', // como o Instagram aparece no site
};

/*
  MENSAGENS DO WHATSAPP: texto que já chega escrito quando a pessoa abre a conversa.
  "geral" vale para o botão flutuante e os links de WhatsApp; as demais valem para
  os botões "Conversar sobre..." / "Fale conosco" de cada frente (contato.html?frente=...).
*/
const MENSAGENS_WHATSAPP = {
  geral: 'Olá, Saint Paul Jr! Vim pelo site e gostaria de saber mais sobre as consultorias de vocês.',
  'Plano de negócios':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em um plano de negócios (validação, plano GTM, OKRs, expansão ou pitch). Podemos conversar?',
  'Análise mercadológica':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em uma análise mercadológica (tamanho de mercado, concorrentes, PESTEL ou SWOT). Podemos conversar?',
  'Análise do consumidor':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em uma análise do consumidor (perfil, NPS, jornada do cliente ou fidelização). Podemos conversar?',
  Marketing:
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria de marketing (marca, redes sociais, tráfego pago ou funil de vendas). Podemos conversar?',
  Financeiro:
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria financeira (valuation, viabilidade, fluxo de caixa, precificação ou custos). Podemos conversar?',
  Operações:
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria de operações (processos, POPs, gestão ágil ou estrutura organizacional). Podemos conversar?',
  IA:
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria de IA (chatbots, agentes, automação, dashboards ou treinamento). Podemos conversar?',
};

const linkWhatsapp = (mensagem = MENSAGENS_WHATSAPP.geral) =>
  `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`;

document.addEventListener('DOMContentLoaded', () => {
  preencherContatos();
  iniciarCabecalho();
  iniciarGaveta();
  iniciarSubmenus();
  iniciarAbas();
  iniciarDicasEscopos();
  iniciarCases();
  iniciarCtaDor();
  iniciarRede();
  iniciarEmendas();
  montarPontosEcossistema();
  iniciarAcordeoes();
  iniciarMetodo();
  iniciarHeroSlides();
  iniciarHistoria();
  iniciarFormulario();
  iniciarAnimacoes();
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

/* ---------- Contatos ---------- */

function preencherContatos() {
  const dados = {
    email: {
      href: CONTATO.email && `mailto:${CONTATO.email}`,
      texto: CONTATO.email || 'E-mail a definir',
    },
    whatsapp: {
      href: CONTATO.whatsapp && linkWhatsapp(),
      texto: CONTATO.whatsappTexto || (CONTATO.whatsapp ? 'WhatsApp' : 'WhatsApp a definir'),
    },
    linkedin: {
      href: CONTATO.linkedin,
      texto: CONTATO.linkedin ? CONTATO.linkedinTexto || 'LinkedIn' : 'LinkedIn a definir',
    },
    instagram: {
      href: CONTATO.instagram,
      texto: CONTATO.instagram ? CONTATO.instagramTexto || 'Instagram' : 'Instagram a definir',
    },
  };

  document.querySelectorAll('[data-contato]').forEach((el) => {
    const item = dados[el.dataset.contato];
    if (!item) return;
    const rotulo = el.querySelector('[data-rotulo]');
    if (rotulo) rotulo.textContent = item.texto;

    if (item.href) {
      el.setAttribute('href', item.href);
      if (!item.href.startsWith('mailto:')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    } else {
      el.removeAttribute('href');
      el.classList.add('a-definir');
    }
  });

  // Botão flutuante: sem número configurado, leva para a seção de contato
  const flutuante = document.querySelector('[data-whatsapp-flutuante]');
  if (flutuante && CONTATO.whatsapp) {
    flutuante.href = linkWhatsapp();
    flutuante.target = '_blank';
    flutuante.rel = 'noopener';
    flutuante.setAttribute('aria-label', 'Fale com a gente pelo WhatsApp');
  }

  // Botão flutuante só aparece depois que a primeira seção (capa) sai da tela
  const capa = document.querySelector('main > section');
  if (flutuante && capa && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => flutuante.classList.toggle('escondido', entrada.isIntersecting), {
      rootMargin: '-50% 0px 0px 0px', // aparece quando a capa sobe acima da metade da tela
    }).observe(capa);
  }

  // Botões de cada frente (contato.html?frente=...) abrem o WhatsApp com a mensagem da frente
  if (!CONTATO.whatsapp) return;
  document.querySelectorAll('a[href*="contato.html?frente="]').forEach((link) => {
    const frente = new URL(link.href).searchParams.get('frente');
    link.href = linkWhatsapp(MENSAGENS_WHATSAPP[frente] || MENSAGENS_WHATSAPP.geral);
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

/* ---------- Cabeçalho: fica sólido ao rolar ---------- */

function iniciarCabecalho() {
  const cabecalho = document.querySelector('[data-cabecalho]');
  if (!cabecalho) return;
  if (cabecalho.hasAttribute('data-sempre-solido')) {
    cabecalho.classList.add('solido');
    return;
  }
  const atualizar = () => cabecalho.classList.toggle('solido', window.scrollY > 24);
  atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });
}

/* ---------- Menu lateral ---------- */

function iniciarGaveta() {
  const gaveta = document.querySelector('[data-gaveta]');
  const botao = document.querySelector('[data-abrir-gaveta]');
  if (!gaveta || !botao) return;

  let focoAnterior = null;

  const abrir = () => {
    focoAnterior = document.activeElement;
    gaveta.inert = false;
    gaveta.classList.add('aberta');
    gaveta.setAttribute('aria-hidden', 'false');
    botao.setAttribute('aria-expanded', 'true');
    document.body.classList.add('travado');
    gaveta.querySelector('[data-fechar-gaveta]')?.focus();
  };

  const fechar = (devolverFoco = true) => {
    gaveta.classList.remove('aberta');
    gaveta.setAttribute('aria-hidden', 'true');
    gaveta.inert = true;
    botao.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('travado');
    if (devolverFoco && focoAnterior) focoAnterior.focus();
  };

  botao.addEventListener('click', abrir);
  gaveta.querySelectorAll('[data-fechar-gaveta]').forEach((el) => el.addEventListener('click', () => fechar()));
  gaveta.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => fechar(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gaveta.classList.contains('aberta')) fechar();
  });
}

/* ---------- Menu suspenso "Nossas soluções" ---------- */

function iniciarSubmenus() {
  document.querySelectorAll('[data-submenu]').forEach((item) => {
    const botao = item.querySelector('button');
    const definir = (aberto) => {
      item.classList.toggle('aberto', aberto);
      botao.setAttribute('aria-expanded', String(aberto));
    };

    botao.addEventListener('click', () => definir(!item.classList.contains('aberto')));
    item.addEventListener('mouseleave', () => definir(false));
    item.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => definir(false)));
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) definir(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && item.classList.contains('aberto')) {
        definir(false);
        botao.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) definir(false);
    });
  });
}

/* ---------- Abas das frentes de consultoria ---------- */

function iniciarAbas() {
  const abas = document.querySelector('[data-abas]');
  if (!abas) return;

  const lista = abas.querySelector('[role="tablist"]');
  const botoes = [...lista.querySelectorAll('[role="tab"]')];
  const paineis = botoes.map((b) => document.getElementById(b.getAttribute('aria-controls')));
  const secao = document.getElementById('solucoes');

  const ativar = (indice, focar = false) => {
    botoes.forEach((b, i) => {
      const ativo = i === indice;
      b.setAttribute('aria-selected', String(ativo));
      b.tabIndex = ativo ? 0 : -1;
      paineis[i].hidden = !ativo;
    });
    if (focar) botoes[indice].focus();
    // No celular a lista de abas rola na horizontal: traz a aba ativa para a vista
    if (lista.scrollWidth > lista.clientWidth) {
      lista.scrollTo({ left: botoes[indice].offsetLeft - lista.offsetLeft, behavior: 'smooth' });
    }
  };

  botoes.forEach((botao, i) => {
    botao.addEventListener('click', () => {
      ativar(i);
      history.replaceState(null, '', `#${paineis[i].id}`);
    });
    botao.addEventListener('keydown', (e) => {
      const teclas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let destino = null;
      if (e.key in teclas) destino = (i + teclas[e.key] + botoes.length) % botoes.length;
      if (e.key === 'Home') destino = 0;
      if (e.key === 'End') destino = botoes.length - 1;
      if (destino === null) return;
      e.preventDefault();
      ativar(destino, true);
    });
  });

  // Links para uma frente (#financeiro etc.) abrem a aba certa
  const abrirPorHash = (hash) => {
    const indice = paineis.findIndex((p) => `#${p.id}` === hash);
    if (indice < 0) return false;
    ativar(indice);
    secao.scrollIntoView(); // suave via CSS, respeitando "reduzir movimento"
    return true;
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (abrirPorHash(link.getAttribute('href'))) {
      e.preventDefault();
      history.pushState(null, '', link.getAttribute('href'));
    }
  });

  window.addEventListener('hashchange', () => abrirPorHash(location.hash));

  // Chegou de outra página com #frente: abre a aba e, depois que imagens e
  // fontes carregarem, corrige a posição final da rolagem
  if (abrirPorHash(location.hash)) {
    window.addEventListener('load', () => secao.scrollIntoView({ behavior: 'instant' }), { once: true });
  }
}

/* ---------- Serviços: um quadro explica cada escopo ao passar o mouse ---------- */

function iniciarDicasEscopos() {
  const itens = [...document.querySelectorAll('.escopos-lista li')].filter((li) => li.querySelector('.escopo-explica'));
  if (!itens.length) return;
  document.documentElement.classList.add('com-dicas');
  const comMouse = window.matchMedia('(hover: hover) and (pointer: fine)');

  const quadro = document.createElement('div');
  quadro.className = 'escopo-quadro';
  quadro.hidden = true;
  quadro.innerHTML = '<strong></strong><p></p>';
  document.body.appendChild(quadro);
  let aberto = null;
  let espera = null;

  const posicionar = (li) => {
    const MARGEM = 16;
    const linha = li.getBoundingClientRect();
    const ponto = li.querySelector('.escopo-ponto').getBoundingClientRect();
    const larguraTela = document.documentElement.clientWidth;
    const { offsetWidth: largura, offsetHeight: altura } = quadro;
    const esquerda = Math.min(Math.max(ponto.left - 12, MARGEM), larguraTela - largura - MARGEM);
    const cabeBaixo = linha.bottom + altura + MARGEM < window.innerHeight;
    quadro.style.left = `${esquerda}px`;
    quadro.style.top = `${cabeBaixo ? linha.bottom + 8 : linha.top - altura - 8}px`;
    quadro.classList.toggle('acima', !cabeBaixo);
    quadro.style.setProperty('--seta', `${ponto.left + ponto.width / 2 - esquerda}px`);
  };

  const abrir = (li) => {
    clearTimeout(espera);
    if (aberto === li) return;
    if (aberto) aberto.classList.remove('dica-aberta');
    aberto = li;
    li.classList.add('dica-aberta');
    li.querySelector('.escopo-ponto').setAttribute('aria-expanded', 'true');
    quadro.querySelector('strong').textContent = li.querySelector('h4').textContent;
    quadro.querySelector('p').textContent = li.querySelector('.escopo-explica').textContent;
    quadro.hidden = false;
    posicionar(li);
  };

  const fechar = () => {
    clearTimeout(espera);
    if (!aberto) return;
    aberto.classList.remove('dica-aberta');
    aberto.querySelector('.escopo-ponto').setAttribute('aria-expanded', 'false');
    aberto = null;
    quadro.hidden = true;
  };

  // Com um quadro já aberto a troca é imediata; o atraso só evita abrir ao atravessar a lista
  const pedirAbrir = (li) => {
    clearTimeout(espera);
    if (aberto) abrir(li);
    else espera = setTimeout(() => abrir(li), 120);
  };
  const pedirFechar = () => {
    clearTimeout(espera);
    espera = setTimeout(fechar, 140);
  };

  itens.forEach((li, i) => {
    const titulo = li.querySelector('h4').textContent;
    const explica = li.querySelector('.escopo-explica');
    explica.id = `escopo-explica-${i}`;
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.className = 'escopo-ponto';
    ponto.textContent = 'i';
    ponto.setAttribute('aria-label', `O que é: ${titulo}`);
    ponto.setAttribute('aria-describedby', explica.id);
    ponto.setAttribute('aria-expanded', 'false');
    li.prepend(ponto);

    li.addEventListener('pointerenter', () => {
      if (comMouse.matches) pedirAbrir(li);
    });
    li.addEventListener('pointerleave', () => {
      if (comMouse.matches) pedirFechar();
    });
    ponto.addEventListener('focus', () => {
      if (ponto.matches(':focus-visible')) abrir(li);
    });
    ponto.addEventListener('blur', fechar);
    // Toque: a linha inteira abre e fecha o quadro
    li.addEventListener('click', () => {
      if (comMouse.matches) return;
      if (aberto === li) fechar();
      else abrir(li);
    });
  });

  // O quadro continua aberto enquanto o mouse estiver sobre ele
  quadro.addEventListener('pointerenter', () => clearTimeout(espera));
  quadro.addEventListener('pointerleave', pedirFechar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fechar();
  });
  document.addEventListener('click', (e) => {
    if (aberto && !aberto.contains(e.target) && !quadro.contains(e.target)) fechar();
  });
  window.addEventListener('scroll', fechar, { passive: true });
  window.addEventListener('resize', fechar);

  // Aviso discreto no início de cada lista
  document.querySelectorAll('.escopos-lista').forEach((lista) => {
    const aviso = document.createElement('p');
    aviso.className = 'escopos-aviso';
    aviso.textContent = comMouse.matches
      ? 'Passe o mouse em um item para entender o que ele é.'
      : 'Toque em um item para entender o que ele é.';
    lista.before(aviso);
  });
}

/* ---------- Formulário de contato ---------- */

function iniciarFormulario() {
  const form = document.querySelector('[data-form-contato]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const selectFrente = form.querySelector('select[name="frente"]');

  // Vindo de Serviços (contato.html?frente=...), a frente já chega escolhida
  const frenteNaUrl = new URLSearchParams(location.search).get('frente');
  if (selectFrente && frenteNaUrl && [...selectFrente.options].some((o) => o.value === frenteNaUrl)) {
    selectFrente.value = frenteNaUrl;
  }

  // Botões "Conversar sobre..." já deixam a frente escolhida no formulário
  document.querySelectorAll('[data-interesse]').forEach((botao) => {
    botao.addEventListener('click', () => {
      if (selectFrente) selectFrente.value = botao.dataset.interesse;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const d = new FormData(form);
    const assunto = `Contato pelo site: ${d.get('empresa')}`;
    const corpo = [
      `Nome: ${d.get('nome')}`,
      `Empresa: ${d.get('empresa')}`,
      `E-mail: ${d.get('email')}`,
      `Telefone: ${d.get('telefone') || '-'}`,
      `Frente de interesse: ${d.get('frente')}`,
      '',
      d.get('mensagem'),
    ].join('\n');

    if (!CONTATO.email) {
      status.textContent = 'O envio ainda não está ativo: falta definir o e-mail de contato em js/main.js.';
      return;
    }

    window.location.href = `mailto:${CONTATO.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    status.textContent = 'Abrimos o seu e-mail com a mensagem pronta. É só enviar.';
  });
}

/* ---------- Animações ---------- */

function iniciarAnimacoes() {
  // Modo estático (?estatico): nada se move, tudo aparece no estado final
  if (document.documentElement.classList.contains('estatico')) return;
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // Blocos que aparecem ao rolar; irmãos entram um pouco depois do outro
  const grupos = [
    '.secao-cabeca',
    '.sintomas-grid > *',
    '.lista-pontos > li',
    '.abas',
    '.nota-ia',
    '.metodo-etapa',
    '.garantias > div',
    '.metodo-orientador',
    '.canais-grid > *',
    '.proposito-grid > *',
    '.valores-intro',
    '.acordeao',
    '.politicas > *',
    '.cta-final-conteudo > *',
    '.cta-dor-grid > *',
    '.rodape-grid > *',
    '.servico-card',
    '.nps-grid > *',
    '.case-logo',
    '.sintoma-card',
    '.dor-problema',
    '.dor-porques > li',
  ];
  const alvos = document.querySelectorAll(grupos.join(','));
  if (semMovimento || !('IntersectionObserver' in window)) return;

  alvos.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((irmao) => irmao.matches(grupos.join(',')));
    el.classList.add('revelar');
    el.style.setProperty('--atraso', `${Math.min(irmaos.indexOf(el), 6) * 0.09}s`);
  });

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  alvos.forEach((el) => observador.observe(el));
}

/* ---------- História do caminho: a etapa acompanha a rolagem da página ---------- */

function iniciarHistoria() {
  const caixa = document.querySelector('[data-historia]');
  const trilho = document.querySelector('[data-historia-trilho]');
  if (!caixa || !trilho) return;
  const secao = trilho.querySelector('.historia-secao');
  const espaco = trilho.querySelector('.historia-espaco');
  const abas = [...caixa.querySelectorAll('[role="tab"]')];
  const paineis = [...caixa.querySelectorAll('[role="tabpanel"]')];
  const bolas = abas.map((aba) => aba.querySelector('.historia-bola'));
  const MENOR = 0.39;
  let atual = 0;
  let pedido = false;
  let topoFixo = 0;

  // Onde a seção gruda: logo abaixo do cabeçalho, ou mais acima se ela não couber na tela
  const medir = () => {
    const cabecalho = document.querySelector('[data-cabecalho]')?.offsetHeight || 0;
    topoFixo = Math.min(cabecalho, window.innerHeight - secao.offsetHeight);
    secao.style.top = `${topoFixo}px`;
  };

  // 0 quando a seção acabou de grudar, 1 quando todo o espaço abaixo dela foi rolado
  const progresso = () => {
    const p = (topoFixo - trilho.getBoundingClientRect().top) / espaco.offsetHeight;
    return Math.min(Math.max(p, 0), 1) * (abas.length - 1);
  };

  const mostrar = (indice) => {
    if (indice === atual) return;
    atual = indice;
    abas.forEach((aba, i) => aba.setAttribute('aria-selected', String(i === indice)));
    paineis.forEach((painel, i) => painel.classList.toggle('ativo', i === indice));
  };

  // Enquanto uma bola diminui, a seguinte cresce na mesma proporção
  const atualizar = () => {
    pedido = false;
    const posicao = progresso();
    bolas.forEach((bola, i) => {
      const distancia = Math.min(Math.abs(posicao - i), 1);
      bola.style.setProperty('--escala', (1 - distancia * (1 - MENOR)).toFixed(3));
    });
    mostrar(Math.round(posicao));
  };

  const agendar = () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(atualizar);
  };

  // Clicar numa bola rola a página até a etapa dela
  abas.forEach((aba, i) =>
    aba.addEventListener('click', () => {
      const alvo = (i / (abas.length - 1)) * espaco.offsetHeight;
      const desejado = topoFixo - alvo;
      window.scrollBy({ top: trilho.getBoundingClientRect().top - desejado + 1, behavior: 'smooth' });
    })
  );

  if (document.documentElement.classList.contains('estatico')) return;
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', () => {
    medir();
    agendar();
  });
  medir();
  atualizar();
}

/* ---------- Hero: capa e depois uma foto por frente, trocando a cada 8 s ---------- */

function iniciarHeroSlides() {
  const caixa = document.querySelector('[data-hero-slides]');
  if (!caixa) return;
  // Foto que não carrega sai da rotação, para não abrir um vão escuro no hero
  const fotos = [...caixa.querySelectorAll('.hero-foto')].filter((f) => !(f.complete && f.naturalWidth === 0));
  const frentes = [...document.querySelectorAll('.hero-frentes li')];
  const DURACAO = 8000;
  let atual = 0;
  let timer = null;

  fotos.forEach((f) =>
    f.addEventListener('error', () => {
      const i = fotos.indexOf(f);
      if (i < 0 || f.classList.contains('ativo')) return;
      fotos.splice(i, 1);
      if (i < atual) atual--;
    })
  );

  const mostrar = (indice) => {
    if (indice !== atual) {
      fotos.forEach((f) => f.classList.remove('saindo'));
      fotos[atual].classList.replace('ativo', 'saindo');
      fotos[indice].classList.add('ativo');
      atual = indice;
    }
    // Reinicia a barra de progresso da frente da foto (a capa não tem frente)
    frentes.forEach((li) => li.classList.remove('ativo'));
    void caixa.offsetWidth;
    frentes[fotos[atual].dataset.frente]?.classList.add('ativo');
    clearTimeout(timer);
    timer = setTimeout(() => mostrar((atual + 1) % fotos.length), DURACAO);
  };

  document.documentElement.style.setProperty('--duracao-slide', `${DURACAO / 1000}s`);
  if (document.documentElement.classList.contains('estatico') || fotos.length < 2) return;

  // Passar o mouse sobre uma frente mostra a foto dela
  frentes.forEach((li, i) => {
    const indice = fotos.findIndex((f) => f.dataset.frente === String(i));
    if (indice >= 0) li.addEventListener('mouseenter', () => mostrar(indice));
  });
  mostrar(0);
}

/* ---------- Cases: clicar no logo abre o detalhe ---------- */

function iniciarCases() {
  document.querySelectorAll('[data-abrir-case]').forEach((botao) => {
    const janela = document.getElementById(botao.dataset.abrirCase);
    if (!janela) return;
    botao.addEventListener('click', () => {
      janela.showModal();
      janela.scrollTop = 0;
      document.body.classList.add('travado');
    });
    // Fecha pelo X, pelo Esc (nativo do dialog) ou clicando fora da janela
    janela.querySelector('[data-fechar-case]').addEventListener('click', () => janela.close());
    janela.addEventListener('click', (e) => {
      if (e.target === janela) janela.close();
    });
    janela.addEventListener('close', () => document.body.classList.remove('travado'));
  });
}

/* ---------- Chamada final dos sintomas: sinais marcados vão para a mensagem ---------- */

function iniciarCtaDor() {
  const caixa = document.querySelector('[data-cta-dor]');
  if (!caixa) return;
  const marcas = [...caixa.querySelectorAll('input[name="sinal"]')];
  const contagem = caixa.querySelector('[data-cta-dor-contagem]');
  const botao = caixa.querySelector('[data-cta-dor-botao]');
  const { sintoma, frente } = caixa.dataset;

  const atualizar = () => {
    const marcados = marcas.filter((m) => m.checked).map((m) => m.value);
    contagem.textContent = marcados.length
      ? `${marcados.length} de ${marcas.length} sinais marcados. Eles vão na sua mensagem.`
      : 'Nenhum sinal marcado ainda.';
    if (!CONTATO.whatsapp) return;
    const mensagem = marcados.length
      ? `Olá, Saint Paul Jr! Vim pela página "${sintoma.replace(/\.$/, '')}" e reconheço na minha empresa: ${marcados.join('; ').toLowerCase()}. Podemos conversar?`
      : MENSAGENS_WHATSAPP[frente] || MENSAGENS_WHATSAPP.geral;
    botao.href = linkWhatsapp(mensagem);
    botao.target = '_blank';
    botao.rel = 'noopener';
  };

  marcas.forEach((m) => m.addEventListener('change', atualizar));
  atualizar();
}

/* ---------- Malha de quadrados que reage ao cursor ---------- */

// Uma malha em cada fundo marcado com data-rede: Sobre nós e o topo das páginas internas
function iniciarRede() {
  document.querySelectorAll('[data-rede]').forEach(montarRede);
}

/* ---------- Emendas entre seções ----------
   Em vez do corte seco entre duas seções, a de cima esmaece até a cor
   do meio entre as duas e a de baixo nasce dessa mesma cor.
   A cor de cada seção é o fundo dela; seções com foto de fundo dizem
   a cor em --cor-emenda no CSS.
   As seções de Sobre nós (inclusive missão, visão e valores) ficam de fora:
   mantêm as bordas e as cores da versão do Kalil. A capa de Contato também
   fica de fora: termina com corte reto antes de "Prefere falar direto?". */
const SEM_EMENDA = '#sobre-nos, .historia-trilho, .historia-espaco, #proposito, .contato-capa';

function iniciarEmendas() {
  const main = document.querySelector('main');
  // Páginas com data-sem-emenda no <main> (hoje, Cases) mantêm o corte reto entre as seções
  if (!main || main.hasAttribute('data-sem-emenda')) return;

  // O rodapé fica de fora: a seção acima dele termina com corte reto, sem esmaecer
  const blocos = [...main.children].filter(
    (el) => el && !el.matches('script, template') && el.offsetHeight > 0
  );
  const fundoPagina = getComputedStyle(document.body).backgroundColor;
  const corDe = (el) => {
    const estilo = getComputedStyle(el);
    const declarada = estilo.getPropertyValue('--cor-emenda').trim();
    if (declarada) return declarada;
    const fundo = estilo.backgroundColor;
    return fundo === 'transparent' || /,\s*0\)$/.test(fundo) ? fundoPagina : fundo;
  };

  for (let i = 1; i < blocos.length; i++) {
    const acima = corDe(blocos[i - 1]);
    const abaixo = corDe(blocos[i]);
    if (acima === abaixo) continue;
    if (blocos[i - 1].matches(SEM_EMENDA) || blocos[i].matches(SEM_EMENDA)) continue;
    const meio = `color-mix(in oklab, ${acima}, ${abaixo})`;
    acrescentarEmenda(blocos[i - 1], 'base', meio);
    acrescentarEmenda(blocos[i], 'topo', meio);
  }
}

function acrescentarEmenda(secao, lado, cor) {
  const faixa = document.createElement('span');
  faixa.className = `emenda emenda-${lado}`;
  faixa.setAttribute('aria-hidden', 'true');
  faixa.style.setProperty('--cor', cor);
  secao.classList.add('com-emenda');
  secao.append(faixa);
}

function montarRede(canvas) {
  if (!canvas.getContext) return;
  const secao = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const estatico = document.documentElement.classList.contains('estatico');

  // Sobre fundo claro (data-rede="claro") a malha é neutra e parada, sem brilho nem cor
  const claro = canvas.dataset.rede === 'claro';
  const COR = claro ? '25, 24, 24' : '159, 211, 203'; // preto da marca, ou o petróleo claro da grade do hero
  const LINHA_BASE = claro ? 0.06 : 0.13;
  const LINHA_CURSOR = claro ? 0.16 : 0.42;
  const ALCANCE = 200; // distância em que o cursor deforma a malha
  const EMPURRAO = 16; // quanto um vértice colado no cursor se desloca
  const VELOCIDADE_ONDA = 9; // px por quadro da onda do clique
  let celula = 56;
  let colunas = 0;
  let linhas = 0;
  let vertices = [];
  let ondas = [];
  let largura = 0;
  let altura = 0;
  let cursor = null;
  let intersectando = false;
  let visivel = false;
  let quadro = null;

  const montar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = secao.clientWidth;
    altura = secao.clientHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Células miúdas, um pouco menores no celular
    celula = window.matchMedia('(max-width: 640px)').matches ? 44 : 56;
    // Ancorada à direita e ao topo, como a grade do hero
    const inicioX = (largura % celula) - celula;
    colunas = Math.ceil(largura / celula) + 2;
    linhas = Math.ceil(altura / celula) + 2;
    vertices = [];
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const bx = inicioX + c * celula;
        const by = (l - 1) * celula;
        vertices.push({ bx, by, x: bx, y: by, vx: 0, vy: 0 });
      }
    }
  };

  const vertice = (c, l) => vertices[l * colunas + c];

  // 0 longe do cursor, 1 em cima dele
  const proximidade = (x, y) => {
    if (!cursor) return 0;
    const d = Math.hypot(x - cursor.x, y - cursor.y);
    return d < ALCANCE ? 1 - d / ALCANCE : 0;
  };

  const desenhar = () => {
    ctx.clearRect(0, 0, largura, altura);

    // Brilho suave que acompanha o cursor
    if (cursor && !claro) {
      const brilho = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 280);
      brilho.addColorStop(0, 'rgba(24, 72, 72, 0.55)');
      brilho.addColorStop(1, 'rgba(24, 72, 72, 0)');
      ctx.fillStyle = brilho;
      ctx.fillRect(0, 0, largura, altura);
    }

    // Quadrados perto do cursor acendem de leve
    for (let l = 0; l < linhas - 1; l++) {
      for (let c = 0; c < colunas - 1; c++) {
        const a = vertice(c, l);
        const b = vertice(c + 1, l);
        const d = vertice(c + 1, l + 1);
        const e = vertice(c, l + 1);
        const p = claro ? 0 : proximidade((a.x + d.x) / 2, (a.y + d.y) / 2);
        if (p <= 0) continue;
        ctx.fillStyle = `rgba(${COR}, ${p * p * 0.09})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(d.x, d.y);
        ctx.lineTo(e.x, e.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Linhas: o tom da grade em CSS, mais claras perto do cursor
    const traco = (a, b) => {
      const p = proximidade((a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.strokeStyle = `rgba(${COR}, ${LINHA_BASE + p * LINHA_CURSOR})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };
    ctx.lineWidth = 1;
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const v = vertice(c, l);
        if (c < colunas - 1) traco(v, vertice(c + 1, l));
        if (l < linhas - 1) traco(v, vertice(c, l + 1));
      }
    }

    // Vértices perto do cursor ganham um ponto
    if (cursor && !claro) {
      for (const v of vertices) {
        const p = proximidade(v.x, v.y);
        if (p <= 0) continue;
        ctx.fillStyle = `rgba(${COR}, ${p * 0.9})`;
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1 + p * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const mover = () => {
    ondas = ondas.filter((o) => (o.raio += VELOCIDADE_ONDA) < Math.hypot(largura, altura));
    for (const v of vertices) {
      // O alvo é a posição de repouso, empurrada para fora pelo cursor
      let alvoX = v.bx;
      let alvoY = v.by;
      if (cursor) {
        const dx = v.bx - cursor.x;
        const dy = v.by - cursor.y;
        const d = Math.hypot(dx, dy);
        if (d < ALCANCE && d > 0.1) {
          const forca = (1 - d / ALCANCE) ** 2 * EMPURRAO;
          alvoX += (dx / d) * forca;
          alvoY += (dy / d) * forca;
        }
      }
      // A onda do clique dá um tranco nos vértices por onde passa
      for (const o of ondas) {
        const dx = v.x - o.x;
        const dy = v.y - o.y;
        const d = Math.hypot(dx, dy);
        const faixa = Math.abs(d - o.raio);
        if (faixa < 40 && d > 0.1) {
          const forca = (1 - faixa / 40) * 0.7 * Math.max(0, 1 - o.raio / 700);
          v.vx += (dx / d) * forca;
          v.vy += (dy / d) * forca;
        }
      }
      // Mola firme e bem amortecida: o vértice volta ao lugar sem balançar
      v.vx = (v.vx + (alvoX - v.x) * 0.22) * 0.6;
      v.vy = (v.vy + (alvoY - v.y) * 0.22) * 0.6;
      v.x += v.vx;
      v.y += v.vy;
    }
  };

  const ciclo = () => {
    mover();
    desenhar();
    quadro = visivel ? requestAnimationFrame(ciclo) : null;
  };

  const atualizarAnimacao = () => {
    visivel = intersectando && document.visibilityState === 'visible';
    if (visivel && !quadro) quadro = requestAnimationFrame(ciclo);
    else if (!visivel && quadro) {
      cancelAnimationFrame(quadro);
      quadro = null;
    }
  };

  montar();
  desenhar();
  // A altura da seção muda depois de montada (fontes, fotos, abas): sem medir de novo,
  // o desenho fica esticado e a malha reage longe do cursor
  const remontar = () => {
    if (canvas.width === Math.round(secao.clientWidth * Math.min(window.devicePixelRatio || 1, 2)) &&
        canvas.height === Math.round(secao.clientHeight * Math.min(window.devicePixelRatio || 1, 2))) return;
    montar();
    desenhar();
  };
  if ('ResizeObserver' in window) new ResizeObserver(remontar).observe(secao);
  else window.addEventListener('resize', remontar);
  // A malha sobre fundo claro fica parada: só as seções escuras reagem ao cursor
  if (semMovimento || estatico || claro) return;

  const posicao = (e) => {
    const caixa = secao.getBoundingClientRect();
    return { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
  };
  secao.addEventListener('pointermove', (e) => { cursor = posicao(e); });
  secao.addEventListener('pointerleave', () => { cursor = null; });
  secao.addEventListener('pointerdown', (e) => {
    ondas.push({ ...posicao(e), raio: 0 });
  });
  document.addEventListener('visibilitychange', atualizarAnimacao);

  // Anima apenas enquanto a seção está visível e a aba do navegador está ativa.
  new IntersectionObserver(([entrada]) => {
    intersectando = entrada.isIntersecting;
    atualizarAnimacao();
  }).observe(secao);
}

/* ---------- Bolinhas do esquema do ecossistema: mesma reação da malha ---------- */

function montarPontosEcossistema() {
  const dados = window.PONTOS_ECOSSISTEMA;
  const img = document.querySelector('.sobre-figura img');
  if (!dados || !img) return;
  const figura = img.parentElement;
  const secao = figura.closest('section');
  const canvas = document.createElement('canvas');
  canvas.className = 'eco-pontos';
  canvas.setAttribute('aria-hidden', 'true');
  figura.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const parado =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('estatico');

  const LADO_ARTE = 690; // as coordenadas dos dados são da arte, em 690 x 690
  const SOBRA = 48; // margem do canvas, para a bolinha empurrada não ser cortada
  const ALCANCE = 150; // distância em que o cursor empurra as bolinhas
  const EMPURRAO = 16; // quanto uma bolinha colada no cursor se desloca, como na malha
  const VELOCIDADE_ONDA = 9;
  const OPACIDADE = 0.7;
  let pontos = [];
  let ondas = [];
  let cursor = null;
  let escala = 1;
  let largura = 0;
  let altura = 0;
  let intersectando = false;
  let quadro = null;

  const montar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    escala = img.offsetWidth / LADO_ARTE;
    largura = img.offsetWidth + SOBRA * 2;
    altura = img.offsetHeight + SOBRA * 2;
    canvas.style.left = `${img.offsetLeft - SOBRA}px`;
    canvas.style.top = `${img.offsetTop - SOBRA}px`;
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pontos = [];
    for (let i = 0; i < dados.length; i += 3) {
      const bx = dados[i] * escala + SOBRA;
      const by = dados[i + 1] * escala + SOBRA;
      pontos.push({ bx, by, x: bx, y: by, vx: 0, vy: 0, r: dados[i + 2] * escala });
    }
  };

  // 0 longe do cursor, 1 em cima dele
  const proximidade = (x, y) => {
    if (!cursor) return 0;
    const d = Math.hypot(x - cursor.x, y - cursor.y);
    return d < ALCANCE ? 1 - d / ALCANCE : 0;
  };

  const desenhar = () => {
    ctx.clearRect(0, 0, largura, altura);
    ctx.fillStyle = `rgba(179, 130, 1, ${OPACIDADE})`;
    ctx.beginPath();
    const perto = [];
    for (const p of pontos) {
      const f = proximidade(p.x, p.y);
      if (f > 0) {
        perto.push([p, f]);
        continue;
      }
      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    }
    ctx.fill();
    // Perto do cursor, a bolinha cresce e fica mais viva, como as linhas da malha
    for (const [p, f] of perto) {
      ctx.fillStyle = `rgba(179, 130, 1, ${OPACIDADE + f * (1 - OPACIDADE)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + f * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Mesma mola da malha; devolve se ainda há bolinha em movimento
  const mover = () => {
    ondas = ondas.filter((o) => (o.raio += VELOCIDADE_ONDA) < largura * 1.5);
    let movendo = ondas.length > 0;
    for (const p of pontos) {
      let alvoX = p.bx;
      let alvoY = p.by;
      if (cursor) {
        const dx = p.bx - cursor.x;
        const dy = p.by - cursor.y;
        const d = Math.hypot(dx, dy);
        if (d < ALCANCE && d > 0.1) {
          const forca = (1 - d / ALCANCE) ** 2 * EMPURRAO;
          alvoX += (dx / d) * forca;
          alvoY += (dy / d) * forca;
        }
      }
      for (const o of ondas) {
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const d = Math.hypot(dx, dy);
        const faixa = Math.abs(d - o.raio);
        if (faixa < 40 && d > 0.1) {
          const forca = (1 - faixa / 40) * 0.7 * Math.max(0, 1 - o.raio / 700);
          p.vx += (dx / d) * forca;
          p.vy += (dy / d) * forca;
        }
      }
      p.vx = (p.vx + (alvoX - p.x) * 0.22) * 0.6;
      p.vy = (p.vy + (alvoY - p.y) * 0.22) * 0.6;
      p.x += p.vx;
      p.y += p.vy;
      if (Math.abs(p.vx) + Math.abs(p.vy) > 0.02) movendo = true;
    }
    return movendo;
  };

  // Só anima enquanto há o que mexer: parada, a arte não gasta processamento
  const ciclo = () => {
    const movendo = mover();
    desenhar();
    quadro = movendo && intersectando ? requestAnimationFrame(ciclo) : null;
  };

  const acordar = () => {
    if (!quadro && intersectando && document.visibilityState === 'visible') quadro = requestAnimationFrame(ciclo);
  };

  const refazer = () => {
    montar();
    desenhar();
  };

  refazer();
  if ('ResizeObserver' in window) new ResizeObserver(refazer).observe(img);
  else window.addEventListener('resize', refazer);
  if (parado) return;

  const posicao = (e) => {
    const caixa = canvas.getBoundingClientRect();
    return { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
  };
  secao.addEventListener('pointermove', (e) => {
    cursor = posicao(e);
    acordar();
  });
  secao.addEventListener('pointerleave', () => {
    cursor = null;
    acordar();
  });
  secao.addEventListener('pointerdown', (e) => {
    ondas.push({ ...posicao(e), raio: 0 });
    acordar();
  });
  document.addEventListener('visibilitychange', acordar);
  new IntersectionObserver(([entrada]) => {
    intersectando = entrada.isIntersecting;
    acordar();
  }).observe(canvas);
}

/* ---------- Listas abríveis (valores) ---------- */

function iniciarAcordeoes() {
  document.querySelectorAll('[data-acordeao]').forEach((caixa) => {
    const itens = [...caixa.querySelectorAll('.acordeao-item')];
    caixa.classList.add('ativo');

    // Um item aberto por vez; clicar no aberto o fecha
    itens.forEach((item) => {
      item.querySelector('.acordeao-botao').addEventListener('click', () => {
        const abrir = !item.classList.contains('aberto');
        itens.forEach((outro) => {
          const aberto = abrir && outro === item;
          outro.classList.toggle('aberto', aberto);
          outro.querySelector('.acordeao-botao').setAttribute('aria-expanded', String(aberto));
        });
      });
    });
  });
}

function iniciarMetodo() {
  const caixa = document.querySelector('[data-metodo]');
  if (!caixa) return;
  const trilho = caixa.querySelector('.metodo-trilho');
  const abas = [...trilho.querySelectorAll('.etapa-aba')];
  const paineis = abas.map((aba) => document.getElementById(aba.getAttribute('aria-controls')));
  const secao = caixa.closest('.metodo-secao');
  const rolagem = caixa.closest('[data-metodo-rolagem]');
  const palco = rolagem.querySelector('.metodo-palco');
  const espaco = rolagem.querySelector('.metodo-espaco');
  const ultimo = abas.length - 1;
  const podeRolar =
    !document.documentElement.classList.contains('estatico') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let atual = Math.max(0, abas.findIndex((aba) => aba.getAttribute('aria-selected') === 'true'));
  let comRolagem = false;
  let topoFixo = 0;
  let pedido = false;

  const mostrar = (indice, focar) => {
    atual = indice;
    abas.forEach((aba, i) => {
      const selecionada = i === indice;
      aba.setAttribute('aria-selected', String(selecionada));
      aba.tabIndex = selecionada ? 0 : -1;
      aba.classList.toggle('feita', i < indice);
      // Os painéis ficam empilhados: o palco não muda de altura ao trocar de etapa
      paineis[i].removeAttribute('hidden');
      paineis[i].classList.toggle('fora', !selecionada);
    });
    if (!comRolagem) caixa.style.setProperty('--progresso', indice / ultimo);
    if (focar) abas[indice].focus();
  };

  // 0 quando o palco acabou de grudar, 1 quando todo o espaço abaixo dele foi rolado
  const atualizar = () => {
    pedido = false;
    if (!comRolagem) return;
    const p = Math.min(Math.max((topoFixo - rolagem.getBoundingClientRect().top) / espaco.offsetHeight, 0), 1);
    caixa.style.setProperty('--progresso', p.toFixed(4));
    const indice = Math.round(p * ultimo);
    if (indice !== atual) mostrar(indice);
  };

  const agendar = () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(atualizar);
  };

  // Só gruda se as etapas couberem na tela; senão elas ficariam escondidas e valem os cliques
  const medir = () => {
    if (!podeRolar) return;
    const cabecalho = document.querySelector('[data-cabecalho]')?.offsetHeight || 0;
    secao.classList.add('com-rolagem');
    topoFixo = Math.min(cabecalho, window.innerHeight - palco.offsetHeight);
    const folgaEtapas = trilho.getBoundingClientRect().top - palco.getBoundingClientRect().top;
    comRolagem = topoFixo + folgaEtapas >= cabecalho;
    secao.classList.toggle('com-rolagem', comRolagem);
    palco.style.top = comRolagem ? `${topoFixo}px` : '';
    if (comRolagem) atualizar();
    else mostrar(atual);
  };

  const irPara = (indice, focar) => {
    if (!comRolagem) {
      mostrar(indice, focar);
      return;
    }
    // Com a rolagem ligada, a etapa acompanha a página: basta levar a página até ela
    const alvo = topoFixo - (indice / ultimo) * espaco.offsetHeight;
    window.scrollBy({ top: rolagem.getBoundingClientRect().top - alvo + 1, behavior: 'smooth' });
    if (focar) abas[indice].focus({ preventScroll: true });
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => irPara(i));
    aba.addEventListener('keydown', (e) => {
      const destino = { ArrowRight: i === ultimo ? 0 : i + 1, ArrowLeft: i === 0 ? ultimo : i - 1, Home: 0, End: ultimo }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      irPara(destino, true);
    });
  });

  mostrar(atual);
  medir();
  if (podeRolar) {
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', medir);
    window.addEventListener('load', medir);
  }

  const flutuante = document.querySelector('[data-whatsapp-flutuante]');
  const secoesDeAbertura = [...document.querySelectorAll('.sobre-secao, .metodo-secao')];
  if (flutuante && secoesDeAbertura.length) {
    const atualizarVisibilidade = () => {
      const celularOuTablet = window.matchMedia('(max-width: 899px)').matches;
      const secaoVisivel = secoesDeAbertura.some((secao) => {
        const limites = secao.getBoundingClientRect();
        return limites.bottom > 80 && limites.top < window.innerHeight - 80;
      });
      flutuante.classList.toggle('conteudo-em-tela', celularOuTablet && secaoVisivel);
    };

    if ('IntersectionObserver' in window) {
      const observadorDeSecoes = new IntersectionObserver(atualizarVisibilidade, {
        rootMargin: '-80px 0px -80px 0px',
      });
      secoesDeAbertura.forEach((secao) => observadorDeSecoes.observe(secao));
    } else {
      window.addEventListener('scroll', atualizarVisibilidade, { passive: true });
    }
    window.addEventListener('resize', atualizarVisibilidade);
    atualizarVisibilidade();
  }
}
