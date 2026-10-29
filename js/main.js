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
  Marketing:
    'Olá, Saint Paul Jr! Vim pelo site e tenho interesse em marketing (reestruturação de site com SEO e GEO). Podemos conversar?',
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
  iniciarCarrossel();
  iniciarCtaDor();
  iniciarRede();
  iniciarValores();
  iniciarMetodo();
  iniciarHeroSlides();
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
    '.valores-explorar',
    '.politicas > *',
    '.cta-final-conteudo > *',
    '.cta-dor-grid > *',
    '.rodape-grid > *',
    '.servico-card',
    '.nps-grid > *',
    '.projetos-topo > *',
    '.projeto',
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

/* ---------- Carrossel de projetos (Resultados) ---------- */

function iniciarCarrossel() {
  const trilho = document.querySelector('[data-carrossel]');
  if (!trilho) return;
  const voltar = document.querySelector('[data-carrossel-voltar]');
  const avancar = document.querySelector('[data-carrossel-avancar]');
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Um passo = largura de um card mais o espaço entre eles
  const passo = () => {
    const card = trilho.firstElementChild;
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(trilho).columnGap || 0) : trilho.clientWidth;
  };
  const mover = (direcao) => trilho.scrollBy({ left: direcao * passo(), behavior: semMovimento ? 'auto' : 'smooth' });

  const atualizar = () => {
    const fim = trilho.scrollWidth - trilho.clientWidth;
    voltar.disabled = trilho.scrollLeft <= 4;
    avancar.disabled = trilho.scrollLeft >= fim - 4;
    // Todos os projetos cabem na tela: as setas não têm o que fazer
    voltar.parentElement.hidden = fim <= 4;
  };

  voltar.addEventListener('click', () => mover(-1));
  avancar.addEventListener('click', () => mover(1));
  trilho.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
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

/* ---------- Rede de pontos que reage ao cursor ---------- */

// Uma rede em cada fundo marcado com data-rede: Sobre nós e o topo das páginas internas
function iniciarRede() {
  document.querySelectorAll('[data-rede]').forEach(montarRede);
}

function montarRede(canvas) {
  if (!canvas.getContext) return;
  const secao = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const estatico = document.documentElement.classList.contains('estatico');

  const COR = '159, 211, 203'; // petróleo claro
  const LIGA = 130; // distância máxima para ligar dois pontos
  const ALCANCE_CURSOR = 190; // distância em que o cursor puxa as linhas
  const larguraCelular = () => window.matchMedia('(max-width: 640px)').matches;
  let pontos = [];
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
    // Densidade pela área: telas grandes ganham mais pontos, com teto para não pesar
    const celular = larguraCelular();
    const total = Math.min(celular ? 38 : 90, Math.round((largura * altura) / (celular ? 28000 : 15000)));
    pontos = Array.from({ length: total }, () => ({
      x: Math.random() * largura,
      y: Math.random() * altura,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 1.6,
    }));
  };

  const desenhar = () => {
    ctx.clearRect(0, 0, largura, altura);

    // Brilho suave que acompanha o cursor
    if (cursor) {
      const brilho = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 260);
      brilho.addColorStop(0, 'rgba(24, 72, 72, 0.55)');
      brilho.addColorStop(1, 'rgba(24, 72, 72, 0)');
      ctx.fillStyle = brilho;
      ctx.fillRect(0, 0, largura, altura);
    }

    for (let i = 0; i < pontos.length; i++) {
      const a = pontos[i];
      for (let j = i + 1; j < pontos.length; j++) {
        const b = pontos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LIGA) {
          ctx.strokeStyle = `rgba(${COR}, ${(1 - d / LIGA) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (cursor) {
        const d = Math.hypot(a.x - cursor.x, a.y - cursor.y);
        if (d < ALCANCE_CURSOR) {
          ctx.strokeStyle = `rgba(${COR}, ${(1 - d / ALCANCE_CURSOR) * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(cursor.x, cursor.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = `rgb(${COR})`;
    for (const p of pontos) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const mover = () => {
    for (const p of pontos) {
      // Perto do cursor, o ponto é empurrado de leve para fora
      if (cursor) {
        const dx = p.x - cursor.x;
        const dy = p.y - cursor.y;
        const d = Math.hypot(dx, dy);
        if (d < 120 && d > 0.1) {
          p.vx += (dx / d) * 0.06;
          p.vy += (dy / d) * 0.06;
        }
      }
      // Atrito leve para a velocidade voltar ao ritmo calmo
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (Math.hypot(p.vx, p.vy) < 0.12) {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > largura) p.vx *= -1;
      if (p.y < 0 || p.y > altura) p.vy *= -1;
      p.x = Math.max(0, Math.min(largura, p.x));
      p.y = Math.max(0, Math.min(altura, p.y));
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
  if (semMovimento || estatico) {
    window.addEventListener('resize', () => { montar(); desenhar(); });
    return;
  }

  secao.addEventListener('pointermove', (e) => {
    const caixa = secao.getBoundingClientRect();
    cursor = { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
  });
  secao.addEventListener('pointerleave', () => { cursor = null; });
  window.addEventListener('resize', () => { montar(); desenhar(); });
  document.addEventListener('visibilitychange', atualizarAnimacao);

  // Anima apenas enquanto a seção está visível e a aba do navegador está ativa.
  new IntersectionObserver(([entrada]) => {
    intersectando = entrada.isIntersecting;
    atualizarAnimacao();
  }).observe(secao);
}

/* ---------- Valores: escolher um ponto do caminho abre o valor ---------- */

function iniciarValores() {
  const caixa = document.querySelector('[data-valores]');
  if (!caixa) return;
  const abas = [...caixa.querySelectorAll('[role="tab"]')];
  const paineis = abas.map((aba) => document.getElementById(aba.getAttribute('aria-controls')));
  caixa.classList.add('ativo');

  const abrir = (indice, focar) => {
    abas.forEach((aba, i) => {
      const atual = i === indice;
      aba.setAttribute('aria-selected', String(atual));
      aba.tabIndex = atual ? 0 : -1;
      paineis[i].hidden = !atual;
    });
    // Até onde o caminho chegou: o traço se preenche até o ponto escolhido
    caixa.style.setProperty('--progresso', abas.length > 1 ? indice / (abas.length - 1) : 0);
    if (focar) abas[indice].focus();
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => abrir(i));
    aba.addEventListener('keydown', (e) => {
      const ultimo = abas.length - 1;
      const destino = { ArrowRight: i === ultimo ? 0 : i + 1, ArrowLeft: i === 0 ? ultimo : i - 1, Home: 0, End: ultimo }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      abrir(destino, true);
    });
  });

  abrir(Math.max(0, abas.findIndex((aba) => aba.getAttribute('aria-selected') === 'true')));
}

/* ---------- Como trabalhamos: seletor de etapas acessível ---------- */

function iniciarMetodo() {
  const caixa = document.querySelector('[data-metodo]');
  if (!caixa) return;
  const trilho = caixa.querySelector('.metodo-trilho');
  const abas = [...trilho.querySelectorAll('.etapa-aba')];
  const paineis = abas.map((aba) => document.getElementById(aba.getAttribute('aria-controls')));
  let atual = Math.max(0, abas.findIndex((aba) => aba.getAttribute('aria-selected') === 'true'));

  const mostrar = (indice, focar) => {
    atual = indice;
    abas.forEach((aba, i) => {
      const selecionada = i === indice;
      aba.setAttribute('aria-selected', String(selecionada));
      aba.tabIndex = selecionada ? 0 : -1;
      paineis[i].hidden = !selecionada;
    });
    if (focar) abas[indice].focus();
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => mostrar(i));
    aba.addEventListener('keydown', (e) => {
      const ultimo = abas.length - 1;
      const destino = { ArrowRight: i === ultimo ? 0 : i + 1, ArrowLeft: i === 0 ? ultimo : i - 1, Home: 0, End: ultimo }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      mostrar(destino, true);
    });
  });

  mostrar(atual);

  const flutuante = document.querySelector('[data-whatsapp-flutuante]');
  const secoesDeAbertura = [...document.querySelectorAll('.sobre-secao, .metodo-secao, .ej-secao')];
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
