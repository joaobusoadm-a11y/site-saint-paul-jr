// Gera as páginas do site a partir do mapa do site:
// Início (com Sobre nós), Serviços, Resultados e Contate-nos.
// Uso: node gerar.js <pasta-backup> <pasta-do-site>
const fs = require('fs');
const path = require('path');
const [, , backup, site] = process.argv;

const indexAntigo = fs.readFileSync(path.join(backup, 'index.html'), 'utf8');
const sobreAntigo = fs.readFileSync(path.join(backup, 'sobre.html'), 'utf8');

// Trecho entre um comentário "<!-- ===== X ===== -->" e o próximo
const secao = (html, nome) => {
  const marca = `<!-- ===== ${nome}`;
  const a = html.indexOf(marca);
  if (a < 0) throw new Error('Seção não encontrada: ' + nome);
  const inicio = html.indexOf('<section', a);
  const fim = html.indexOf('</section>', inicio) + '</section>'.length;
  return html.slice(inicio, fim);
};

const FRENTES = [
  ['plano-de-negocios', 'Plano de negócios', 'Modelagem, pitch e valuation, viabilidade'],
  ['analise-mercadologica', 'Análise mercadológica', 'Mercado, concorrência e público-alvo'],
  ['consultoria-operacional', 'Consultoria operacional', 'Processos e ferramentas de gestão'],
  ['consultoria-financeira', 'Consultoria financeira', 'Diagnóstico financeiro e precificação'],
  ['consultoria-de-ia', 'Consultoria de IA', 'Oportunidades, automação e capacitação'],
];

const SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICONE = {
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  whatsapp: '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.04 3C8.86 3 3.04 8.82 3.04 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3zm0 23.6c-2 0-3.95-.54-5.65-1.56l-.4-.24-3.97 1.04 1.06-3.87-.26-.4A10.56 10.56 0 0 1 5.43 16c0-5.85 4.76-10.6 10.61-10.6 5.84 0 10.57 4.75 10.57 10.6 0 5.85-4.73 10.6-10.57 10.6zm5.8-7.94c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.88-1.76-2.2-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37z"/></svg>',
};
const contatoItem = (tipo, rotulo) =>
  `<a class="contato-item" data-contato="${tipo}" href="#"><span class="icone" aria-hidden="true">${ICONE[tipo]}</span><span data-rotulo>${rotulo}</span></a>`;


// Links que mudam conforme a página atual (âncoras na própria página não recarregam)
const link = (atual, pagina, ancora = '') => (atual === pagina ? (ancora ? `#${ancora}` : pagina) : `${pagina}${ancora ? '#' + ancora : ''}`);

function cabecalho(atual) {
  const frente = ([id, nome, desc]) => `<li><a href="${link(atual, 'servicos.html', id)}">${nome}<small>${desc}</small></a></li>`;
  const atualAttr = (p) => (atual === p ? ' aria-current="page"' : '');
  return `  <!-- ===== Cabeçalho ===== -->
  <header class="cabecalho escuro" data-cabecalho${atual === 'index.html' ? '' : ' data-sempre-solido'}>
    <div class="container cabecalho-inner">
      <button class="menu-toggle" type="button" aria-controls="gaveta" aria-expanded="false" aria-label="Abrir menu" data-abrir-gaveta>
        <span></span><span></span><span></span>
      </button>
      <a class="logo" href="index.html" aria-label="Saint Paul Jr, página inicial" data-logo>
        <span class="logo-anim" aria-hidden="true"><span>S</span><span class="logo-ext"><span>aint&nbsp;</span></span><span>P</span><span class="logo-ext"><span>aul&nbsp;</span></span><span class="logo-j">ȷ<i class="logo-ponto"></i></span><span>r</span></span>
      </a>
      <nav class="nav-principal" aria-label="Principal">
        <ul>
          <li><a class="nav-link" href="index.html"${atualAttr('index.html')}>Início</a></li>
          <li class="tem-sub" data-submenu>
            <button class="nav-link${atual === 'servicos.html' ? ' ativo' : ''}" type="button" aria-expanded="false" aria-controls="sub-servicos">
              Serviços
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <ul class="submenu" id="sub-servicos">
              ${FRENTES.map(frente).join('\n              ')}
              <li><a class="submenu-todos" href="servicos.html">Ver todos os serviços</a></li>
            </ul>
          </li>
          <li><a class="nav-link" href="${link(atual, 'index.html', 'sobre-nos')}">Sobre nós</a></li>
          <li><a class="nav-link" href="resultados.html"${atualAttr('resultados.html')}>Resultados</a></li>
          <li><a class="nav-link" href="contato.html"${atualAttr('contato.html')}>Contato</a></li>
        </ul>
      </nav>
      <a class="btn btn-mostarda btn-cabecalho" href="contato.html">Fale conosco</a>
    </div>
  </header>

  <!-- ===== Menu lateral ===== -->
  <div class="gaveta escuro" id="gaveta" aria-hidden="true" inert data-gaveta>
    <div class="gaveta-fundo" data-fechar-gaveta></div>
    <div class="gaveta-painel" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="gaveta-topo">
        <img class="gaveta-logo" src="assets/img/spjr-logo-negativo.png" alt="Saint Paul Jr" width="780" height="412">
        <button class="gaveta-fechar" type="button" aria-label="Fechar menu" data-fechar-gaveta>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <nav aria-label="Menu completo">
        <ul class="gaveta-links" role="list">
          <li><a href="index.html"${atualAttr('index.html')}>Início</a></li>
          <li>
            <a class="gaveta-grupo" href="servicos.html"${atualAttr('servicos.html')}>Serviços</a>
            <ul class="gaveta-sub">
              ${FRENTES.map(([id, nome]) => `<li><a href="${link(atual, 'servicos.html', id)}">${nome}</a></li>`).join('\n              ')}
            </ul>
          </li>
          <li><a href="${link(atual, 'index.html', 'sobre-nos')}">Sobre nós</a></li>
          <li><a href="resultados.html"${atualAttr('resultados.html')}>Resultados</a></li>
          <li><a href="contato.html"${atualAttr('contato.html')}>Contato</a></li>
        </ul>
      </nav>
      <a class="btn btn-mostarda" href="contato.html">Fale conosco</a>
      <div class="gaveta-contato">
        <p class="eyebrow">Contato</p>
        ${contatoItem('email', 'E-mail')}
      </div>
    </div>
  </div>`;
}

function rodape(atual) {
  return `  <!-- ===== Rodapé ===== -->
  <footer class="rodape escuro">
    <div class="container rodape-grid">
      <div>
        <img class="rodape-logo" src="assets/img/spjr-logo-negativo.png" alt="Saint Paul Jr" width="780" height="412" loading="lazy">
        <p class="rodape-frase">Onde o potencial ganha direção.</p>
        <p class="rodape-desc">Consultoria estratégica dos alunos da Escola de Negócios Saint Paul.</p>
      </div>
      <div>
        <h2 class="rodape-titulo">Nossas áreas</h2>
        <ul role="list">
          ${FRENTES.map(([id, nome]) => `<li><a href="${link(atual, 'servicos.html', id)}">${nome}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h2 class="rodape-titulo">Navegação</h2>
        <ul role="list">
          <li><a href="index.html">Início</a></li>
          <li><a href="servicos.html">Serviços</a></li>
          <li><a href="${link(atual, 'index.html', 'sobre-nos')}">Sobre nós</a></li>
          <li><a href="resultados.html">Resultados</a></li>
          <li><a href="contato.html">Contato</a></li>
        </ul>
      </div>
      <div>
        <h2 class="rodape-titulo">Contato</h2>
        <ul role="list">
          <li>${contatoItem('email', 'E-mail')}</li>
          <li>${contatoItem('linkedin', 'LinkedIn')}</li>
          <li>${contatoItem('instagram', 'Instagram')}</li>
          <li>${contatoItem('whatsapp', 'WhatsApp')}</li>
        </ul>
      </div>
    </div>
    <div class="container rodape-base">
      <p>© <span data-ano>2026</span> Saint Paul Jr. Todos os direitos reservados.</p>
    </div>
  </footer>

  <a class="whatsapp-flutuante" href="contato.html" aria-label="Fale com a gente" data-whatsapp-flutuante>
    <span class="bolha">${ICONE.whatsapp.replace('<svg ', '<svg aria-hidden="true" ')}</span>
    <span class="rotulo">Fale com a gente</span>
  </a>`;
}

function pagina(arquivo, titulo, descricao, conteudo) {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo}</title>
  <meta name="description" content="${descricao}">
  <meta name="theme-color" content="#142627">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/paginas.css">
  <link rel="stylesheet" href="css/animacoes.css">
  <script>/* ?estatico mostra tudo parado (para capturar e levar ao Figma) */document.documentElement.classList.add(/[?&]estatico/.test(location.search) ? 'estatico' : 'js')</script>
  <script src="js/main.js" defer></script>
</head>
<body>
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>

${cabecalho(arquivo)}

  <main id="conteudo">
${conteudo}
  </main>

${rodape(arquivo)}
</body>
</html>
`;
  fs.writeFileSync(path.join(site, arquivo), html);
  console.log('gerado', arquivo, (html.length / 1024).toFixed(0) + ' KB');
}

const topo = (eyebrow, h1, lead, id) => `    <!-- ===== Topo da página ===== -->
    <section class="pagina-topo fundo-grade escuro" aria-labelledby="${id}">
      <div class="container">
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="titulo titulo-barra" id="${id}">${h1}</h1>
        <p class="lead">${lead}</p>
      </div>
    </section>`;

const ctaFinal = (titulo, botao, href) => `    <!-- ===== Chamada final ===== -->
    <section class="secao secao-escura cta-faixa" aria-labelledby="titulo-cta">
      <div class="container">
        <h2 class="titulo" id="titulo-cta">${titulo}</h2>
        <div class="cta-acoes">
          <a class="btn btn-mostarda btn-grande" href="${href}">${botao}</a>
        </div>
      </div>
      <div class="ponto-cortado" aria-hidden="true"></div>
    </section>`;

/* ================= Início ================= */

const hero = secao(indexAntigo, 'Hero')
  .replace('href="#solucoes"', 'href="servicos.html"')
  .replace(/<li><a href="#([a-z-]+)">/g, '<li><a href="servicos.html#$1">');

// Sintomas da página inicial: cada botão leva a uma página que explica a dor
const DORES = [
  {
    arquivo: 'dor-caixa.html',
    num: '01',
    sintoma: 'Sua empresa gera lucro, mas o caixa não acompanha.',
    problema: 'Baixa conversão do potencial de geração de caixa em caixa efetivo.',
    explicacao: 'Lucro é o que a empresa ganha no papel. Caixa é o dinheiro que entra de fato na conta. Quando os dois se distanciam, a empresa cresce e mesmo assim falta dinheiro para pagar as contas do mês.',
    porque: [
      ['Prazos desencontrados', 'O cliente paga em 60 dias e o fornecedor cobra em 30. A diferença sai do caixa.'],
      ['Dinheiro parado', 'Estoque alto e contas a receber atrasadas prendem o dinheiro que já é seu.'],
      ['Preço que não cobre o custo real', 'Custos que crescem com a operação e não entram na conta do preço comem a margem.'],
      ['Decisão sem número', 'Sem fluxo de caixa projetado, o aperto só aparece quando já chegou.'],
    ],
    frente: ['consultoria-financeira', 'Consultoria financeira'],
    etapas: [
      ['Diagnóstico', 'Mapeamos o ciclo de caixa: prazos de recebimento, de pagamento e de estoque, e onde a margem se perde.'],
      ['Redesenho', 'Ajustamos prazos, política de cobrança e preço a partir do custo real.'],
      ['Implementação', 'O fluxo de caixa projetado e os indicadores passam a rodar na rotina da equipe.'],
    ],
  },
  {
    arquivo: 'dor-inovacao.html',
    num: '02',
    sintoma: 'Sua empresa investe em inovação, mas não vê resultado.',
    problema: 'Hierarquias rígidas e excesso de burocracia.',
    explicacao: 'A ideia nasce, mas trava no caminho. Quando cada passo depende de várias aprovações e ninguém é dono do projeto, a inovação vira custo em vez de resultado.',
    porque: [
      ['Aprovações demais', 'Três áreas aprovam o mesmo pedido e nenhuma sabe quem decide.'],
      ['Projeto sem dono', 'Sem um responsável por etapa, as iniciativas param antes do primeiro teste.'],
      ['Decisão concentrada', 'Tudo sobe para a mesma pessoa, que vira o gargalo da empresa.'],
      ['Processo feito para repetir', 'A rotina foi desenhada para executar o de sempre, não para testar o novo.'],
    ],
    frente: ['consultoria-operacional', 'Consultoria operacional'],
    etapas: [
      ['Diagnóstico', 'Acompanhamos o caminho real de uma iniciativa, da ideia à execução, e marcamos onde ela para.'],
      ['Redesenho', 'Redesenhamos o fluxo de decisão com a sua equipe: menos aprovações e um dono por etapa.'],
      ['Implementação', 'Indicadores e uma rotina de acompanhamento fazem a inovação virar resultado medido.'],
    ],
  },
  {
    arquivo: 'dor-recorrencia.html',
    num: '03',
    sintoma: 'Sua empresa capta clientes, mas não consegue recorrência.',
    problema: 'Dor não definida e pouco valor gerado ao consumidor.',
    explicacao: 'O cliente chega, compra uma vez e não volta. Normalmente não é falta de venda: é uma oferta que não resolve um problema claro para quem compra.',
    porque: [
      ['Oferta pensada a partir do produto', 'A empresa fala do que vende, não do problema que resolve.'],
      ['Público amplo demais', 'Quando a oferta tenta servir a todos, não fica relevante para ninguém.'],
      ['Valor que o cliente não percebe', 'Se o cliente não vê o ganho depois da compra, não tem motivo para voltar.'],
      ['Concorrência pouco conhecida', 'Sem saber o que o concorrente entrega, fica difícil mostrar por que ficar com você.'],
    ],
    frente: ['analise-mercadologica', 'Análise mercadológica'],
    etapas: [
      ['Diagnóstico', 'Ouvimos clientes que voltaram e os que não voltaram para entender a dor de verdade.'],
      ['Redesenho', 'Definimos o público-alvo e ajustamos a proposta de valor e o posicionamento frente à concorrência.'],
      ['Implementação', 'A nova oferta entra na rotina comercial, com um indicador de recompra para acompanhar.'],
    ],
  },
];

const cardSintoma = (d) => `<a class="sintoma-card" href="${d.arquivo}">
            <span class="sintoma-num">Sintoma ${d.num}</span>
            <span class="sintoma-texto">${d.sintoma}</span>
            <span class="sintoma-link">Entender por quê ${SETA}</span>
          </a>`;

const sintomas = `<section class="secao secao-sintomas-foto escuro" id="para-quem" aria-labelledby="titulo-sintomas">
      <img class="sintomas-fundo" src="assets/img/avenida-paulista.jpg" alt="" width="2000" height="1332" loading="lazy">
      <div class="container">
        <div class="secao-cabeca">
          <h2 class="titulo" id="titulo-sintomas">Sua empresa cresceu.<br>E a <span class="sublinhado">estrutura</span>?</h2>
          <p class="lead">Os sintomas aparecem antes de o problema ganhar nome. Escolha o que mais parece com a sua empresa e veja o que está por trás dele.</p>
        </div>
        <div class="sintomas-cards">
          ${DORES.map(cardSintoma).join('\n          ')}
        </div>
      </div>
    </section>`;
const comoTrabalhamos = secao(indexAntigo, 'Como trabalhamos');

const DESCRICOES = {
  'plano-de-negocios': ['Para tirar uma ideia do papel ou decidir uma expansão com número na mão.', ['Modelagem de negócio', 'Pitch e valuation', 'Viabilidade e business case']],
  'analise-mercadologica': ['Para saber onde você compete, contra quem e para quem vende.', ['Pesquisa de mercado e concorrência', 'Definição de público-alvo']],
  'consultoria-operacional': ['Para a operação que cresceu mais rápido que os processos.', ['Mapeamento e redesenho de processos', 'Implementação de ferramentas de gestão']],
  'consultoria-financeira': ['Para saber para onde vai o dinheiro e quanto cobrar.', ['Diagnóstico financeiro', 'Precificação']],
  'consultoria-de-ia': ['Para usar inteligência artificial onde ela resolve um problema real.', ['Diagnóstico de oportunidades com IA', 'Automação de processos com IA', 'Capacitação da equipe']],
};

// Foto de cada frente (em preto e branco via CSS) e o enquadramento
const FOTOS = {
  'plano-de-negocios': ['servico-plano.jpg', 'Apresentação para uma plateia na Escola de Negócios Saint Paul', 1600, 880, 'center 35%'],
  'analise-mercadologica': ['servico-mercado.jpg', 'Turma em sala de aula com painel do Valor Econômico ao fundo', 1931, 1287, 'center 40%'],
  'consultoria-operacional': ['servico-operacional.webp', 'Professor conduz discussão sobre protagonismo e accountability com a turma', 2000, 1125, 'center 45%'],
  'consultoria-financeira': ['servico-financeira.jpg', 'Palestra em auditório da Saint Paul com gráfico na tela', 1280, 735, '70% center'],
  'consultoria-de-ia': ['servico-ia.svg', 'Ilustração de uma rede de conexões representando inteligência artificial', 1600, 900, 'center'],
};

const servicosResumo = `<section class="secao" id="servicos" aria-labelledby="titulo-servicos">
      <div class="container">
        <div class="secao-cabeca">
          <p class="eyebrow">Serviços</p>
          <h2 class="titulo titulo-barra" id="titulo-servicos">Consultoria estratégica em cinco frentes.</h2>
          <p class="lead">Cada frente tem escopos definidos. Escolha a que conversa com o seu desafio e veja exatamente o que entregamos.</p>
        </div>
        <div class="servicos-grid">
          ${FRENTES.map(([id, nome], i) => {
            const [desc] = DESCRICOES[id];
            const [arquivo, alt, w, h, foco] = FOTOS[id];
            return `<a class="servico-card" href="servicos.html#${id}">
            <span class="servico-foto"><img src="assets/img/${arquivo}" alt="${alt}" width="${w}" height="${h}" loading="lazy" style="object-position:${foco}"></span>
            <span class="servico-num">0${i + 1}</span>
            <h3>${nome}</h3>
            <p>${desc}</p>
            <span class="servico-link">Ver escopos ${SETA}</span>
          </a>`;
          }).join('\n          ')}
        </div>
      </div>
    </section>`;

const sobreHeroAntigo = secao(sobreAntigo, 'Quem está por trás');
const figura = sobreHeroAntigo.slice(sobreHeroAntigo.indexOf('<figure'), sobreHeroAntigo.indexOf('</figure>') + 9).replace('<img ', '<img loading="lazy" ');
const listaCredenciais = sobreHeroAntigo.slice(sobreHeroAntigo.indexOf('<ul class="lista-pontos'), sobreHeroAntigo.indexOf('</ul>') + 5);

const sobreNos = `<section class="secao fundo-grade escuro" id="sobre-nos" aria-labelledby="titulo-sobre">
      <div class="container ecossistema-grid">
        ${figura}
        <div class="ecossistema-texto">
          <p class="eyebrow">Sobre nós</p>
          <h2 class="titulo titulo-barra" id="titulo-sobre">Quem está por trás</h2>
          <p class="lead">Somos a consultoria estratégica da Escola de Negócios Saint Paul. Entramos na operação do cliente, mapeamos o que existe de fato e ficamos ao lado dele na implementação.</p>
          ${listaCredenciais}
        </div>
      </div>
    </section>`;

const proposito = secao(sobreAntigo, 'Propósito');
const mvv = secao(sobreAntigo, 'Missão, visão e valores');

// Hero: abre com a foto do prédio (capa) e depois desliza uma foto por frente
// a cada 8 s (iniciarHeroSlides em main.js)
const heroFotos = Object.values(FOTOS)
  .map(([arquivo, , w, h, foco], i) =>
    `<img class="hero-foto" data-frente="${i}" src="assets/img/${arquivo}" alt="" width="${w}" height="${h}" style="object-position:${foco}" decoding="async">`)
  .join('\n        ');
const heroComFotos = hero.replace(
  /<img class="hero-foto"([^>]*)>/,
  (_, atributos) => `<div class="hero-fotos" data-hero-slides>\n        <img class="hero-foto ativo"${atributos}>\n        ${heroFotos}\n      </div>`
);

pagina(
  'index.html',
  'Saint Paul Jr | Consultoria estratégica',
  'A Saint Paul Jr é a consultoria estratégica da Escola de Negócios Saint Paul: diagnóstico, redesenho e implementação para empresas que cresceram e precisam de estrutura.',
  [
    '    <!-- ===== Hero (protótipo Figma: Início) ===== -->\n    ' + heroComFotos,
    '    <!-- ===== Para quem é ===== -->\n    ' + sintomas,
    '    <!-- ===== Serviços (resumo) ===== -->\n    ' + servicosResumo,
    '    <!-- ===== Como trabalhamos ===== -->\n    ' + comoTrabalhamos,
    '    <!-- ===== Sobre nós: quem está por trás (protótipo Figma: Página-2) ===== -->\n    ' + sobreNos,
    '    <!-- ===== Sobre nós: propósito ===== -->\n    ' + proposito,
    '    <!-- ===== Sobre nós: missão, visão e valores ===== -->\n    ' + mvv,
    ctaFinal('O próximo passo é uma conversa.', 'Fale conosco', 'contato.html'),
  ].join('\n\n')
);

/* ================= Serviços ================= */

const solucoes = secao(indexAntigo, 'Nossas soluções')
  .replace(/\s*<div class="secao-cabeca">[\s\S]*?<\/div>\n/, '\n')
  .replace(/href="#contato" data-interesse="([^"]+)"/g, (_, frente) => `href="contato.html?frente=${encodeURIComponent(frente)}"`)
  // Foto da frente no topo de cada painel
  .replace(/(<div class="painel" role="tabpanel" id="([a-z-]+)"[^>]*>)/g, (abre, _, id) => {
    const [arquivo, alt, w, h, foco] = FOTOS[id];
    return `${abre}
              <div class="painel-foto"><img src="assets/img/${arquivo}" alt="${alt}" width="${w}" height="${h}" loading="lazy" style="object-position:${foco}"></div>`;
  });

pagina(
  'servicos.html',
  'Serviços | Saint Paul Jr',
  'Plano de negócios, análise mercadológica, consultoria operacional, consultoria financeira e consultoria de IA: os serviços da Saint Paul Jr, com escopo fechado e prazo por etapa.',
  [
    topo('Serviços', 'Consultoria estratégica em cinco frentes.', 'Cada frente tem escopos definidos, prazo por etapa e professor orientador. Escolha a que conversa com o seu desafio e veja exatamente o que entregamos.', 'titulo-pagina'),
    '    <!-- ===== Frentes e escopos ===== -->\n    ' + solucoes,
    ctaFinal('Não sabe por qual frente começar?', 'Conte o que está acontecendo', 'contato.html'),
  ].join('\n\n')
);

/* ================= Resultados ================= */

const cases = `<section class="secao" aria-labelledby="titulo-formato">
      <div class="container">
        <div class="secao-cabeca">
          <p class="eyebrow">Como mostramos cada resultado</p>
          <h2 class="titulo titulo-barra" id="titulo-formato">Do ponto de partida ao resultado.</h2>
        </div>
        <ol class="formato-case" role="list">
          <li><span class="formato-num">01</span><h3>Ponto de partida</h3><p>Como a operação funcionava e o que custava ao negócio.</p></li>
          <li><span class="formato-num">02</span><h3>O que fizemos</h3><p>Escopo, etapas e prazo de cada entrega.</p></li>
          <li><span class="formato-num">03</span><h3>Resultado</h3><p>O indicador que mudou, com número.</p></li>
          <li><span class="formato-num">04</span><h3>Antes e depois</h3><p>O processo de antes lado a lado com o que virou rotina.</p></li>
        </ol>

        <!--
          Para publicar um resultado, copie o bloco abaixo para dentro de .lista-cases
          e apague o aviso "case-vazio":
          <article class="case-card">
            <p class="eyebrow">Setor do cliente · Frente</p>
            <h3>Título curto com o resultado</h3>
            <p>Ponto de partida, o que fizemos e resultado em 2 ou 3 linhas.</p>
            <dl class="case-numeros"><div><dt>Antes</dt><dd>9 etapas</dd></div><div><dt>Depois</dt><dd>4 etapas</dd></div></dl>
          </article>
        -->
        <div class="lista-cases">
          <div class="case-vazio">
            <span class="ponto" aria-hidden="true"></span>
            <h3>Os primeiros projetos estão em andamento.</h3>
            <p>Cada um entra aqui quando o projeto termina e o cliente autoriza a publicação, com os números do antes e do depois.</p>
          </div>
        </div>
      </div>
    </section>`;

pagina(
  'resultados.html',
  'Resultados | Saint Paul Jr',
  'Projetos da Saint Paul Jr com ponto de partida, o que foi feito e o resultado medido.',
  [
    topo('Resultados', 'Resultado medido, com antes e depois.', 'Cada projeto mostra o problema, o que foi feito e o resultado com número. Prova vale mais que promessa.', 'titulo-pagina'),
    '    <!-- ===== Formato dos resultados ===== -->\n    ' + cases,
    ctaFinal('Quer ver como isso funciona na sua operação?', 'Fale conosco', 'contato.html'),
  ].join('\n\n')
);

/* ================= Contato ================= */

const contato = secao(indexAntigo, 'Contato')
  .replace('<p class="eyebrow">Contato</p>\n', '')
  .replace(/<h2 class="titulo titulo-barra" id="titulo-contato">[^<]*<\/h2>/, '<h2 class="subtitulo" id="titulo-contato">Canais de contato</h2>')
  .replace(/\s*<p class="lead">Conte em poucas linhas[^<]*<\/p>/, '');

pagina(
  'contato.html',
  'Contato | Saint Paul Jr',
  'Fale com a Saint Paul Jr: formulário, e-mail, WhatsApp e endereço na Rua da Consolação, 1601, São Paulo.',
  [
    topo('Contate-nos', 'O próximo passo é uma conversa.', 'Conte em poucas linhas o que está acontecendo na empresa. Na primeira reunião, mapeamos o cenário e mostramos qual escopo faz sentido, com etapas e prazo.', 'titulo-pagina'),
    '    <!-- ===== Formulário e canais ===== -->\n    ' + contato,
  ].join('\n\n')
);

/* ================= Páginas de cada dor ================= */

for (const d of DORES) {
  const [frenteId, frenteNome] = d.frente;
  const outras = DORES.filter((o) => o !== d);

  const topoDor = `    <!-- ===== Sintoma ===== -->
    <section class="pagina-topo fundo-grade escuro" aria-labelledby="titulo-pagina">
      <div class="container">
        <a class="voltar" href="index.html#para-quem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>Todos os sintomas</a>
        <p class="eyebrow">Sintoma ${d.num}</p>
        <h1 class="titulo titulo-barra" id="titulo-pagina">${d.sintoma}</h1>
        <p class="lead">${d.explicacao}</p>
      </div>
    </section>`;

  const problema = `    <!-- ===== Problema e por que acontece ===== -->
    <section class="secao" aria-labelledby="titulo-problema">
      <div class="container">
        <div class="dor-problema">
          <p class="eyebrow">O problema de fundo</p>
          <h2 class="dor-problema-texto" id="titulo-problema">${d.problema}</h2>
        </div>
        <div class="secao-cabeca dor-cabeca">
          <p class="eyebrow">Por que acontece</p>
          <h3 class="subtitulo">Os sinais mais comuns na operação.</h3>
        </div>
        <ul class="dor-porques" role="list">
          ${d.porque.map(([t, p]) => `<li><span class="ponto" aria-hidden="true"></span><div><h4>${t}</h4><p>${p}</p></div></li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;

  const solucao = `    <!-- ===== Como resolvemos ===== -->
    <section class="secao secao-areia" aria-labelledby="titulo-solucao">
      <div class="container">
        <div class="secao-cabeca">
          <p class="eyebrow">Como resolvemos</p>
          <h2 class="titulo titulo-barra" id="titulo-solucao">${frenteNome}, etapa por etapa.</h2>
          <p class="lead">Escopo fechado, prazo por etapa e um professor orientador acompanhando o projeto.</p>
        </div>
        <ol class="metodo" role="list">
          ${d.etapas.map(([t, p]) => `<li class="metodo-etapa">
            <span class="metodo-ponto" aria-hidden="true"></span>
            <h3>${t}</h3>
            <p>${p}</p>
          </li>`).join('\n          ')}
        </ol>
        <a class="link-seta" href="servicos.html#${frenteId}">Ver os escopos de ${frenteNome.toLowerCase()} ${SETA}</a>
      </div>
    </section>`;

  const outrosSintomas = `    <!-- ===== Outros sintomas ===== -->
    <section class="secao" aria-labelledby="titulo-outros">
      <div class="container">
        <div class="secao-cabeca">
          <p class="eyebrow">Outros sintomas</p>
          <h2 class="subtitulo" id="titulo-outros">Talvez o que você sente seja outro.</h2>
        </div>
        <div class="sintomas-cards sintomas-cards-duplo">
          ${outras.map(cardSintoma).join('\n          ')}
        </div>
      </div>
    </section>`;

  pagina(
    d.arquivo,
    `${d.problema.replace(/\.$/, '')} | Saint Paul Jr`,
    `${d.sintoma} Entenda o problema por trás e como a Saint Paul Jr resolve.`,
    [
      topoDor,
      problema,
      solucao,
      outrosSintomas,
      ctaFinal('Reconhece esse cenário na sua empresa?', 'Fale conosco', `contato.html?frente=${encodeURIComponent(frenteNome)}`),
    ].join('\n\n')
  );
}
