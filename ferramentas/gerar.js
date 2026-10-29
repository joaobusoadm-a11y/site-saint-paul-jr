// Gera as páginas do site a partir do mapa do site:
// Início (com Sobre nós), Serviços, Resultados e Contate-nos.
// Uso: node gerar.js <pasta-backup> <pasta-do-site>
const fs = require('fs');
const path = require('path');
const [, , backup, site] = process.argv;

// Quebra de linha do Windows (CRLF) atrapalha as substituições abaixo
const ler = (arquivo) => fs.readFileSync(path.join(backup, arquivo), 'utf8').replace(/\r\n/g, '\n');
const indexAntigo = ler('index.html');
const sobreAntigo = ler('sobre.html');

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
  ['plano-de-negocios', 'Plano de negócios', 'GTM, OKRs, expansão e pitch'],
  ['analise-mercadologica', 'Análise mercadológica', 'Mercado, concorrentes, PESTEL e SWOT'],
  ['analise-do-consumidor', 'Análise do consumidor', 'Perfil, NPS, jornada e fidelização'],
  ['marketing', 'Marketing', 'Marca, redes sociais, tráfego e vendas'],
  ['financeiro', 'Financeiro', 'Valuation, KPIs, fluxo de caixa e custos'],
  ['operacoes', 'Operações', 'Processos, POPs, gestão ágil e cargos'],
  ['ia', 'IA', 'Agentes, automação, sites e treinamento'],
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
        <span class="logo-anim logo-fixo gaveta-logo" role="img" aria-label="Saint Paul Jr"><span>S</span><span>P</span><span class="logo-j">ȷ<i class="logo-ponto"></i></span><span>r</span></span>
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
    </div>
  </div>`;
}

function rodape(atual) {
  return `  <!-- ===== Rodapé ===== -->
  <footer class="rodape escuro">
    <div class="container rodape-grid">
      <div>
        <span class="logo-anim logo-fixo rodape-logo" role="img" aria-label="Saint Paul Jr"><span>S</span><span>P</span><span class="logo-j">ȷ<i class="logo-ponto"></i></span><span>r</span></span>
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
    <section class="pagina-topo fundo-grade fundo-rede escuro" aria-labelledby="${id}">
      <canvas class="rede" aria-hidden="true" data-rede></canvas>
      <div class="container">
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="titulo titulo-barra" id="${id}">${h1}</h1>
        <p class="lead">${lead}</p>
      </div>
    </section>`;

// Topo claro, com textura de pontos e ponto cortado: para páginas cuja seção seguinte é escura
const PONTO_TOPO = '<div class="ponto-cortado ponto-cortado-topo" aria-hidden="true"></div>';
const topoClaro = (eyebrow, h1, lead, id) => `    <!-- ===== Topo da página ===== -->
    <section class="pagina-topo pagina-topo-clara secao-textura" aria-labelledby="${id}">
      ${PONTO_TOPO}
      <div class="container">
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="titulo titulo-barra" id="${id}">${h1}</h1>
        <p class="lead">${lead}</p>
      </div>
    </section>`;

// Chamada final: clara e centralizada, com o ponto a ponto da marca acima do título.
// fundo: 'areia' (padrão) ou 'branco', para não emendar com uma seção areia logo antes.
// Botão segue o tom de voz da Sprint 1 (item H: "Agendar diagnóstico").
const ctaFinal = (titulo, texto, botao, href, fundo = 'areia') => `    <!-- ===== Chamada final ===== -->
    <section class="secao cta-final cta-final-${fundo}" aria-labelledby="titulo-cta">
      <div class="ponto-cortado" aria-hidden="true"></div>
      <div class="ponto-cortado ponto-cortado-esquerda" aria-hidden="true"></div>
      <div class="container cta-final-conteudo">
        <div class="ponto-a-ponto cta-final-pontos" aria-hidden="true"><span></span><i></i><span></span><i></i><span></span></div>
        <p class="eyebrow">Conversa de diagnóstico</p>
        <h2 class="titulo" id="titulo-cta">${titulo}</h2>
        <p class="lead">${texto}</p>
        <a class="btn btn-mostarda btn-grande" href="${href}">${botao} ${SETA}</a>
      </div>
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
    frente: ['financeiro', 'Financeiro'],
    // Título da seção "Como resolvemos" e texto do link para a frente
    titulo: 'Consultoria financeira',
    link: 'Ver os escopos de consultoria financeira',
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
    frente: ['operacoes', 'Operações'],
    titulo: 'Consultoria operacional',
    link: 'Ver os serviços de operações',
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

const DESCRICOES = {
  'plano-de-negocios': ['Para tirar uma ideia do papel ou decidir uma expansão com número na mão.'],
  'analise-mercadologica': ['Para saber onde você compete, contra quem e para quem vende.'],
  'analise-do-consumidor': ['Para entender quem compra de você, por que compra e por que deixa de comprar.'],
  'marketing': ['Para fortalecer o posicionamento da marca e transformar visibilidade em vendas.'],
  'financeiro': ['Para saber para onde vai o dinheiro e quanto cobrar.'],
  'operacoes': ['Para a operação que cresceu mais rápido que os processos.'],
  'ia': ['Para usar inteligência artificial onde ela resolve um problema real.'],
};

// Foto de cada frente (em preto e branco via CSS) e o enquadramento
const FOTOS = {
  'plano-de-negocios': ['servico-plano.jpg', 'Apresentação para uma plateia na Escola de Negócios Saint Paul', 1600, 880, 'center 35%'],
  'analise-mercadologica': ['servico-mercado.jpg', 'Turma em sala de aula com painel do Valor Econômico ao fundo', 1931, 1287, 'center 40%'],
  'analise-do-consumidor': ['servico-consumidor.jpg', 'Professor conversa com alunos em sala de aula', 1200, 900, 'center 35%'],
  'marketing': ['servico-marketing.jpg', 'Alunos da Saint Paul Jr apresentam um projeto para uma banca na Escola de Negócios Saint Paul', 2080, 1235, 'center 40%'],
  'financeiro': ['servico-financeira.jpg', 'Palestra em auditório da Saint Paul com gráfico na tela', 1280, 735, '70% center'],
  'operacoes': ['servico-operacional.webp', 'Professor conduz discussão sobre protagonismo e accountability com a turma', 2000, 1125, 'center 45%'],
  'ia': ['servico-ia.jpg', 'Turma reunida no auditório da Escola de Negócios Saint Paul durante apresentação', 1599, 1066, 'center'],
};

// Textura de pontos e ponto cortado no canto (Brand Book, p. 12; anexo de textura em ferramentas/anexo-brand-book.md)
const servicosResumo = `<section class="secao secao-textura" id="servicos" aria-labelledby="titulo-servicos">
      <div class="ponto-cortado ponto-cortado-topo" aria-hidden="true"></div>
      <div class="container">
        <div class="secao-cabeca">
          <p class="eyebrow">Serviços</p>
          <h2 class="titulo titulo-barra" id="titulo-servicos">Consultoria estratégica em sete frentes.</h2>
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
            <span class="servico-link">Ver serviços ${SETA}</span>
          </a>`;
          }).join('\n          ')}
        </div>
      </div>
    </section>`;

// Sobre, método, compromissos e vínculos (Brand Book v1.0): o HTML é escrito aqui, não vem do backup.
const spjSecoes = `<!-- ===== A. Sobre a Saint Paul Jr ===== -->
    <section class="spj-secao spj-branca" id="sobre-nos" aria-labelledby="titulo-sobre">
      <div class="spj-container sobre-grid">
        <div>
          <p class="spj-eyebrow">Sobre a Saint Paul Jr</p>
          <h2 class="spj-h2" id="titulo-sobre">Antes da solução, a pergunta certa.</h2>
        </div>
        <div class="sobre-texto">
          <p class="spj-texto">A Saint Paul Jr é a consultoria estratégica da Escola de Negócios Saint Paul. Entramos na operação da sua empresa, mapeamos como ela funciona e acompanhamos a implementação do que precisa mudar.</p>
          <p class="spj-texto">Atuamos em plano de negócios, análise mercadológica, consultoria operacional e consultoria financeira. Cada projeto tem escopo definido, etapas e acompanhamento de um professor orientador.</p>
          <div class="sobre-acoes">
            <a class="spj-botao spj-botao-primario" data-contato="whatsapp" href="contato.html">Converse sobre sua operação</a>
            <a class="spj-botao spj-botao-secundario" href="#como-trabalhamos">Veja como trabalhamos</a>
          </div>
          <p class="sobre-nota">A Saint Paul Jr é uma associação sem fins lucrativos, formada e gerida por alunos da Escola de Negócios Saint Paul.</p>
        </div>
      </div>
    </section>

    <!-- ===== B. Como trabalhamos ===== -->
    <section class="spj-secao spj-areia" id="como-trabalhamos" aria-labelledby="titulo-metodo">
      <div class="spj-container">
        <div class="metodo-cabeca">
          <p class="spj-eyebrow">Como trabalhamos</p>
          <h2 class="spj-h2" id="titulo-metodo">Entender a operação. Definir o plano. Implementar.</h2>
          <p class="spj-texto">Começamos pelo que acontece na prática. A partir do diagnóstico, definimos as ações e acompanhamos a implementação com a sua equipe.</p>
        </div>
        <div class="metodo-seletor" data-metodo>
          <div class="metodo-trilho" role="tablist" aria-label="Etapas do trabalho">
            <button class="etapa-aba" type="button" role="tab" id="aba-diagnostico" aria-controls="painel-diagnostico" aria-selected="true" tabindex="0">
              <span class="etapa-grafismo" aria-hidden="true"><span class="etapa-ponto"></span><span class="etapa-traco"></span></span>
              <span class="etapa-num">01</span>
              <span class="etapa-nome">Diagnóstico</span>
              <span class="etapa-previa">Mapear a operação e os pontos de atenção.</span>
            </button>
            <button class="etapa-aba" type="button" role="tab" id="aba-planejamento" aria-controls="painel-planejamento" aria-selected="false" tabindex="-1">
              <span class="etapa-grafismo" aria-hidden="true"><span class="etapa-ponto"></span><span class="etapa-traco"></span></span>
              <span class="etapa-num">02</span>
              <span class="etapa-nome">Planejamento</span>
              <span class="etapa-previa">Ações, entregas e prazos alinhados.</span>
            </button>
            <button class="etapa-aba" type="button" role="tab" id="aba-implementacao" aria-controls="painel-implementacao" aria-selected="false" tabindex="-1">
              <span class="etapa-grafismo" aria-hidden="true"><span class="etapa-ponto"></span><span class="etapa-traco"></span></span>
              <span class="etapa-num">03</span>
              <span class="etapa-nome">Implementação</span>
              <span class="etapa-previa">Aplicação com validações e ajustes.</span>
            </button>
          </div>
          <div class="etapa-painel" role="tabpanel" id="painel-diagnostico" aria-labelledby="aba-diagnostico">
            <div class="painel-grade">
              <div>
                <p class="painel-etapa">Etapa 01 de 03</p>
                <h3 class="spj-h3">Primeiro, entender o que acontece.</h3>
                <p class="spj-texto painel-descricao">Mapeamos a operação, ouvimos quem participa dela e identificamos os pontos que precisam de atenção.</p>
              </div>
              <ul class="painel-pontos spj-texto" role="list">
                <li>Como o trabalho acontece hoje.</li>
                <li>Onde estão os gargalos e o retrabalho.</li>
                <li>Quais problemas entram no escopo do projeto.</li>
              </ul>
            </div>
          </div>
          <div class="etapa-painel" role="tabpanel" id="painel-planejamento" aria-labelledby="aba-planejamento" hidden>
            <div class="painel-grade">
              <div>
                <p class="painel-etapa">Etapa 02 de 03</p>
                <h3 class="spj-h3">Depois, definir o que precisa mudar.</h3>
                <p class="spj-texto painel-descricao">Transformamos o diagnóstico em um plano de trabalho, com ações, entregas e prazos alinhados com a empresa.</p>
              </div>
              <ul class="painel-pontos spj-texto" role="list">
                <li>Prioridades definidas a partir do diagnóstico.</li>
                <li>Ações e entregas organizadas por etapa.</li>
                <li>Prazos e critérios de validação acordados.</li>
              </ul>
            </div>
          </div>
          <div class="etapa-painel" role="tabpanel" id="painel-implementacao" aria-labelledby="aba-implementacao" hidden>
            <div class="painel-grade">
              <div>
                <p class="painel-etapa">Etapa 03 de 03</p>
                <h3 class="spj-h3">Colocar o plano na rotina.</h3>
                <p class="spj-texto painel-descricao">Acompanhamos a aplicação das ações previstas no escopo, com validações ao longo do projeto e ajustes junto à equipe.</p>
              </div>
              <ul class="painel-pontos spj-texto" role="list">
                <li>Aplicação das soluções acordadas.</li>
                <li>Validação das entregas com a equipe.</li>
                <li>Acompanhamento da implementação.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== C. Compromissos de trabalho ===== -->
    <section class="spj-secao spj-preta" aria-label="Compromissos de trabalho">
      <div class="spj-container">
        <ul class="compromissos" role="list">
          <li class="compromisso"><strong>Escopo fechado</strong><span>Você sabe o que recebe antes de começar.</span></li>
          <li class="compromisso"><strong>Prazo por etapa</strong><span>Cada entrega tem data e validação.</span></li>
          <li class="compromisso"><strong>Professor orientador</strong><span>Todo projeto tem acompanhamento de um professor.</span></li>
        </ul>
      </div>
    </section>`;

// Propósito, missão, visão e valores numa seção só
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
    '    ' + spjSecoes,
    '    <!-- ===== Sobre nós: propósito, missão, visão e valores ===== -->\n    ' + mvv,
    ctaFinal('O próximo passo é uma conversa.', 'Conte como sua operação funciona hoje. Na conversa de diagnóstico, mostramos por onde começar, com etapas e prazo.', 'Agendar diagnóstico', 'contato.html', 'branco'),
  ].join('\n\n')
);

/* ================= Serviços ================= */

const solucoes = secao(indexAntigo, 'Nossas soluções')
  .replace(/\s*<div class="secao-cabeca">[\s\S]*?<\/div>\n/, '\n')
  .replace('<section class="secao" id="solucoes"', '<section class="secao secao-textura" id="solucoes"')
  .replace('<div class="container">', `${PONTO_TOPO}\n      <div class="container">`)
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
  'Plano de negócios, análise mercadológica, análise do consumidor, marketing, financeiro, operações e IA: os serviços da Saint Paul Jr, com escopo fechado e prazo por etapa.',
  [
    topo('Serviços', 'Consultoria estratégica em sete frentes.', 'Cada frente tem escopos definidos, prazo por etapa e professor orientador. Escolha a que conversa com o seu desafio e veja exatamente o que entregamos.', 'titulo-pagina'),
    '    <!-- ===== Frentes e escopos ===== -->\n    ' + solucoes,
    ctaFinal('Não sabe por qual frente começar?', 'Conte o que está acontecendo na empresa. Na conversa de diagnóstico, mostramos qual frente faz sentido para o seu desafio.', 'Agendar diagnóstico', 'contato.html'),
  ].join('\n\n')
);

/* ================= Resultados ================= */

// Dado que ainda falta: aparece destacado na página até ser trocado pelo valor real.
// Antes de publicar, nada marcado pode sobrar: grep -l 'class="preencher"' *.html na raiz
// não pode listar arquivo nenhum (a aba Marketing, em base/index.html, também tem marcação).
const preencher = (texto) => `<span class="preencher">${texto}</span>`;

// NPS: valor de -100 a 100. Enquanto for null, a seção do NPS não aparece na página.
const NPS = {
  valor: null,
  respostas: preencher('N respostas'),
  periodo: preencher('período da pesquisa'),
};

// Um item por projeto entregue, na ordem em que aparecem no carrossel.
// imagem: [arquivo em assets/img, descrição, largura, altura]. null mostra um bloco
// com o nome do cliente até a imagem chegar. logo, site e depoimento são opcionais.
const PROJETOS = [
  {
    cliente: 'Bankers Academy',
    frente: 'Site, SEO e GEO',
    sobre: 'Academia de finanças aplicadas: modelagem financeira, investment banking, valuation, M&A e crédito.',
    imagem: ['clientes/bankers-academy-site.webp', 'Página inicial do site da Bankers Academy', 1440, 900],
    logo: ['clientes/bankers-academy-dark.png', 1920, 342],
    site: 'https://www.bankersacademy.com.br/',
    partida: preencher('Como estava o site antes do projeto.'),
    chegada: preencher('Como ficou depois do projeto.'),
    depoimento: { texto: preencher('Depoimento do cliente sobre o projeto.'), nome: preencher('Nome'), cargo: preencher('Cargo, Bankers Academy') },
  },
  {
    cliente: 'Nutrupet',
    frente: 'Plano de negócios',
    sobre: preencher('O que a Nutrupet faz, em uma frase.'),
    imagem: null,
    logo: null,
    site: null,
    partida: preencher('O que a empresa precisava apresentar.'),
    chegada: preencher('Como ficou o pitch de investimento.'),
    depoimento: { texto: preencher('Depoimento do cliente sobre o projeto.'), nome: preencher('Nome'), cargo: preencher('Cargo, Nutrupet') },
  },
];

const temValorNps = typeof NPS.valor === 'number';
const nps = `<section class="secao" aria-labelledby="titulo-nps">
      <div class="container nps-grid">
        <div class="nps-numero">
          <p class="nps-valor"${temValorNps ? '' : ' aria-label="NPS a definir"'}>${temValorNps ? NPS.valor : preencher('00')}</p>
          <div class="nps-escala" aria-hidden="true"${temValorNps ? ` style="--nps:${NPS.valor}"` : ''}>
            <span class="nps-linha">${temValorNps ? '<i></i>' : ''}</span>
            <span>-100</span><span>0</span><span>100</span>
          </div>
        </div>
        <div class="nps-texto">
          <h2 class="titulo titulo-barra" id="titulo-nps">Quanto os clientes nos recomendam.</h2>
          <p class="lead">Cada cliente responde, de 0 a 10, se recomendaria a Saint Paul Jr a outro empresário. O NPS é a fatia de notas 9 e 10 menos a de notas de 0 a 6, e vai de -100 a 100.</p>
          <p class="nps-base">NPS ${temValorNps ? NPS.valor : '—'} · ${NPS.respostas} · ${NPS.periodo}</p>
        </div>
      </div>
    </section>`;

const projeto = (p, i) => `<article class="projeto" aria-roledescription="slide" aria-label="${i + 1} de ${PROJETOS.length}: ${p.cliente}">
            <figure class="projeto-imagem">${p.imagem
              ? `<img src="assets/img/${p.imagem[0]}" alt="${p.imagem[1]}" width="${p.imagem[2]}" height="${p.imagem[3]}" loading="lazy">`
              : `<span class="projeto-imagem-vazia" aria-hidden="true">${p.cliente}</span>${preencher('Imagem do projeto')}`}
            </figure>
            <div class="projeto-corpo">
              <header class="projeto-cabeca">
                <p class="eyebrow">${p.frente}</p>
                <h3 class="projeto-cliente">${p.logo
                  ? `<img src="assets/img/${p.logo[0]}" alt="${p.cliente}" width="${p.logo[1]}" height="${p.logo[2]}" loading="lazy">`
                  : p.cliente}</h3>
                <p class="projeto-sobre">${p.sobre}</p>
              </header>
              <dl class="projeto-trajeto">
                <div class="projeto-etapa"><dt>De onde partimos</dt><dd>${p.partida}</dd></div>
                <div class="projeto-etapa"><dt>Onde chegamos</dt><dd>${p.chegada}</dd></div>
              </dl>${p.depoimento ? `
              <blockquote class="projeto-depoimento">
                <p>${p.depoimento.texto}</p>
                <footer>${p.depoimento.nome} · ${p.depoimento.cargo}</footer>
              </blockquote>` : ''}${p.site ? `
              <a class="link-seta projeto-site" href="${p.site}" target="_blank" rel="noopener">Ver o site ${SETA}</a>` : ''}
            </div>
          </article>`;

// Carrossel: os projetos ficam lado a lado e deslizam na horizontal (iniciarCarrossel em main.js)
// Projetos sobre o fundo escuro com a rede de pontos: os cards brancos ganham contraste
const projetos = `<section class="secao fundo-grade fundo-rede escuro" aria-labelledby="titulo-projetos">
      <canvas class="rede" aria-hidden="true" data-rede></canvas>
      <div class="container">
        <div class="projetos-topo">
          <div class="secao-cabeca">
            <p class="eyebrow">Projetos entregues</p>
            <h2 class="titulo titulo-barra" id="titulo-projetos">De onde partimos. Onde chegamos.</h2>
          </div>
          <div class="carrossel-botoes">
            <button class="carrossel-botao" type="button" aria-controls="lista-projetos" aria-label="Projeto anterior" data-carrossel-voltar disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            </button>
            <button class="carrossel-botao" type="button" aria-controls="lista-projetos" aria-label="Próximo projeto" data-carrossel-avancar>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
        <div class="projetos" id="lista-projetos" role="region" aria-roledescription="carrossel" aria-label="Projetos entregues" tabindex="0" data-carrossel>
          ${PROJETOS.map(projeto).join('\n          ')}
        </div>
      </div>
    </section>`;

pagina(
  'resultados.html',
  'Resultados | Saint Paul Jr',
  `${temValorNps ? 'NPS da Saint Paul Jr e a evolução' : 'A evolução'} dos projetos entregues para Bankers Academy e Nutrupet.`,
  [
    topoClaro('Resultados', 'O que mudou para cada cliente.', 'Veja o ponto de partida e onde cada projeto chegou.', 'titulo-pagina'),
    ...(temValorNps ? ['    <!-- ===== NPS ===== -->\n    ' + nps] : []),
    '    <!-- ===== Projetos ===== -->\n    ' + projetos,
    ctaFinal('Quer ver isso na sua operação?', 'Conte como sua operação funciona hoje. Na conversa de diagnóstico, mostramos por onde começar.', 'Agendar diagnóstico', 'contato.html'),
  ].join('\n\n')
);

/* ================= Contato ================= */

// Foto de fundo da capa do Contato. Provisória: trocar por uma foto do time da Saint Paul Jr
// (o formato da página foi pensado para uma foto de grupo, como a da Insper Jr).
const FOTO_EQUIPE = ['servico-plano.jpg', 1600, 880, 'center 30%'];

// Números ao lado do formulário. O NPS entra sozinho quando NPS.valor for preenchido.
const NUMEROS_CONTATO = [
  ...(temValorNps ? [[`NPS ${NPS.valor}`, 'satisfação dos clientes']] : []),
  [`${FRENTES.length}`, 'frentes de consultoria'],
  ['100%', 'dos projetos com professor orientador'],
];

// Ecossistema da escola, no lugar dos selos (Brand Book, p. 4: a credencial é o vínculo)
const SELOS = [
  ['escola-saint-paul.svg', 'Escola de Negócios Saint Paul', 328, 118],
  ['exame.png', 'Exame', 462, 81],
  ['btg-pactual.png', 'BTG Pactual', 415, 372],
];

const contatoBase = secao(indexAntigo, 'Contato');
const trecho = (html, inicio, fim) => html.slice(html.indexOf(inicio), html.indexOf(fim, html.indexOf(inicio)) + fim.length);
const formulario = trecho(contatoBase, '<form', '</form>');
const canais = trecho(contatoBase, '<ul class="contato-lista"', '</ul>');
const onde = trecho(contatoBase, '<div class="onde">', '</a>\n          </div>');

const capaContato = `<section class="contato-capa escuro" aria-labelledby="titulo-pagina">
      <img class="contato-capa-foto" src="assets/img/${FOTO_EQUIPE[0]}" alt="" width="${FOTO_EQUIPE[1]}" height="${FOTO_EQUIPE[2]}" style="object-position:${FOTO_EQUIPE[3]}" fetchpriority="high">
      <div class="container contato-capa-grid">
        <div class="contato-capa-texto">
          <p class="eyebrow">Contato</p>
          <h1 class="titulo titulo-barra" id="titulo-pagina">O próximo passo é uma conversa.</h1>
          <p class="lead">Conte em poucas linhas o que está acontecendo na empresa. Na primeira reunião, mapeamos o cenário e mostramos qual escopo faz sentido, com etapas e prazo.</p>
          <dl class="contato-numeros">
            ${NUMEROS_CONTATO.map(([n, r]) => `<div><dt>${r}</dt><dd>${n}</dd></div>`).join('\n            ')}
          </dl>
          <ul class="contato-selos" role="list" aria-label="Ecossistema da Saint Paul Jr">
            ${SELOS.map(([a, alt, w, h]) => `<li><img src="assets/img/${a}" alt="${alt}" width="${w}" height="${h}"></li>`).join('\n            ')}
          </ul>
        </div>
        ${formulario}
      </div>
    </section>`;

const canaisContato = `<section class="secao secao-textura" aria-labelledby="titulo-canais">
      ${PONTO_TOPO}
      <div class="container canais-grid">
        <div>
          <p class="eyebrow">Outros canais</p>
          <h2 class="titulo titulo-barra" id="titulo-canais">Prefere falar direto?</h2>
          ${canais}
        </div>
        ${onde}
      </div>
    </section>`;

pagina(
  'contato.html',
  'Contato | Saint Paul Jr',
  'Fale com a Saint Paul Jr: formulário, e-mail, WhatsApp e endereço na Rua da Consolação, 1601, São Paulo.',
  [
    '    <!-- ===== Capa com formulário ===== -->\n    ' + capaContato,
    '    <!-- ===== Canais e endereço ===== -->\n    ' + canaisContato,
  ].join('\n\n')
);

/* ================= Páginas de cada dor ================= */

// Chamada final de cada sintoma: o visitante marca os sinais que reconhece e o botão
// leva esses sinais para a mensagem do WhatsApp (iniciarCtaDor em main.js).
// Sem JavaScript, o botão continua levando para o contato com a frente escolhida.
const ctaDor = (d, frenteNome) => `    <!-- ===== Chamada final: sinais que você reconhece ===== -->
    <section class="secao secao-escura cta-dor" aria-labelledby="titulo-cta" data-cta-dor data-sintoma="${d.sintoma}" data-frente="${frenteNome}">
      <div class="container cta-dor-grid">
        <div class="cta-dor-texto">
          <p class="eyebrow">Conversa de diagnóstico</p>
          <h2 class="titulo titulo-barra" id="titulo-cta">Reconhece esse cenário na sua empresa?</h2>
          <p class="lead">Marque os sinais que você vê hoje. Eles entram na mensagem, e a primeira conversa já começa pelo que importa para você.</p>
        </div>
        <div class="cta-dor-acao">
          <a class="btn btn-mostarda btn-grande" href="contato.html?frente=${encodeURIComponent(frenteNome)}" data-cta-dor-botao>Conversar sobre isso ${SETA}</a>
        </div>
        <fieldset class="cta-dor-sinais">
          <legend>Quais destes sinais aparecem na sua operação?</legend>
          ${d.porque.map(([t, p]) => `<label class="sinal">
            <input type="checkbox" name="sinal" value="${t}">
            <span class="sinal-marca" aria-hidden="true"></span>
            <span class="sinal-texto"><strong>${t}</strong>${p}</span>
          </label>`).join('\n          ')}
          <p class="cta-dor-contagem" aria-live="polite" data-cta-dor-contagem>Nenhum sinal marcado ainda.</p>
        </fieldset>
      </div>
      <div class="ponto-cortado" aria-hidden="true"></div>
    </section>`;

for (const d of DORES) {
  const [frenteId, frenteNome] = d.frente;
  const outras = DORES.filter((o) => o !== d);

  const topoDor = `    <!-- ===== Sintoma ===== -->
    <section class="pagina-topo fundo-grade fundo-rede escuro" aria-labelledby="titulo-pagina">
      <canvas class="rede" aria-hidden="true" data-rede></canvas>
      <div class="container">
        <a class="voltar" href="index.html#para-quem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>Todos os sintomas</a>
        <p class="eyebrow">Sintoma ${d.num}</p>
        <h1 class="titulo titulo-barra" id="titulo-pagina">${d.sintoma}</h1>
        <p class="lead">${d.explicacao}</p>
      </div>
    </section>`;

  const problema = `    <!-- ===== Problema e por que acontece ===== -->
    <section class="secao secao-textura" aria-labelledby="titulo-problema">
      ${PONTO_TOPO}
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
          <h2 class="titulo titulo-barra" id="titulo-solucao">${d.titulo ?? frenteNome}, etapa por etapa.</h2>
          <p class="lead">Escopo fechado, prazo por etapa e um professor orientador acompanhando o projeto.</p>
        </div>
        <ol class="metodo" role="list">
          ${d.etapas.map(([t, p]) => `<li class="metodo-etapa">
            <span class="metodo-ponto" aria-hidden="true"></span>
            <h3>${t}</h3>
            <p>${p}</p>
          </li>`).join('\n          ')}
        </ol>
        <a class="link-seta" href="servicos.html#${frenteId}">${d.link ?? `Ver os escopos de ${frenteNome.toLowerCase()}`} ${SETA}</a>
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
      ctaDor(d, frenteNome),
    ].join('\n\n')
  );
}
