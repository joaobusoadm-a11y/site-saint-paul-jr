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
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em um plano de negócios (modelagem de negócio, pitch e valuation ou viabilidade). Podemos conversar?',
  'Análise mercadológica':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em uma análise mercadológica (pesquisa de mercado e concorrência ou definição de público-alvo). Podemos conversar?',
  'Consultoria operacional':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria operacional (mapeamento de processos ou ferramentas de gestão). Podemos conversar?',
  'Consultoria financeira':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria financeira (diagnóstico financeiro ou precificação). Podemos conversar?',
  'Consultoria de IA':
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em consultoria de IA (diagnóstico de oportunidades, automação de processos ou capacitação da equipe). Podemos conversar?',
};

const linkWhatsapp = (mensagem = MENSAGENS_WHATSAPP.geral) =>
  `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`;

document.addEventListener('DOMContentLoaded', () => {
  preencherContatos();
  iniciarCabecalho();
  iniciarGaveta();
  iniciarSubmenus();
  iniciarAbas();
  iniciarHeroSlides();
  iniciarFormulario();
  inlinearSvgs();
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

  // Links para uma frente (#plano-de-negocios etc.) abrem a aba certa
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

  // Na página inicial o logo mostra "Saint Paul jr" uma vez ao abrir
  const logo = document.querySelector('[data-logo]');
  const telaLarga = window.matchMedia('(min-width: 600px)').matches;
  if (logo && !semMovimento && telaLarga && document.querySelector('.hero')) {
    setTimeout(() => logo.classList.add('aberto'), 900);
    setTimeout(() => logo.classList.remove('aberto'), 3200);
  }


  // Blocos que aparecem ao rolar; irmãos entram um pouco depois do outro
  const grupos = [
    '.secao-cabeca',
    '.sintomas-grid > *',
    '.lista-pontos > li',
    '.abas',
    '.nota-ia',
    '.metodo-etapa',
    '.pilares > li',
    '.ecossistema-figura',
    '.ecossistema-texto',
    '.contato-info',
    '.form-contato',
    '.proposito-grid > *',
    '.mvv-card',
    '.crenca',
    '.valores-titulo',
    '.valores > li',
    '.politicas > *',
    '.cta-faixa .container',
    '.rodape-grid > *',
    '.servico-card',
    '.formato-case > li',
    '.case-vazio',
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

/* ---------- Hero: capa e depois uma foto por frente, trocando a cada 8 s ---------- */

function iniciarHeroSlides() {
  const caixa = document.querySelector('[data-hero-slides]');
  if (!caixa) return;
  const fotos = [...caixa.querySelectorAll('.hero-foto')];
  const frentes = [...document.querySelectorAll('.hero-frentes li')];
  const DURACAO = 8000;
  let atual = 0;
  let timer = null;

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

/* ---------- SVGs com texto: insere no HTML para usar as fontes do site ---------- */

function inlinearSvgs() {
  document.querySelectorAll('img[data-svg-inline]').forEach(async (img) => {
    try {
      const resposta = await fetch(img.src);
      if (!resposta.ok) return;
      const modelo = document.createElement('template');
      modelo.innerHTML = await resposta.text();
      const svg = modelo.content.querySelector('svg');
      if (!svg) return;
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', img.alt);
      img.replaceWith(svg);
    } catch {
      // Aberto direto do disco (file://): a imagem continua como <img>
    }
  });
}
