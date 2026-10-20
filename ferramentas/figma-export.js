// Gera uma versão autocontida de cada página (CSS e imagens embutidos, sem JS)
// para colar no editor do plugin html.to.design no Figma.
// Uso: node figma-export.js <pasta-do-site> <pasta-de-saida>
const fs = require('fs');
const path = require('path');
const [, , site, saida] = process.argv;
fs.mkdirSync(saida, { recursive: true });

const tipos = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const dataUri = (rel) => {
  const arq = path.join(site, rel);
  return `data:${tipos[path.extname(arq).toLowerCase()]};base64,${fs.readFileSync(arq).toString('base64')}`;
};

const css = ['css/style.css', 'css/paginas.css', 'css/animacoes.css'].map((f) => fs.readFileSync(path.join(site, f), 'utf8')).join('\n');
// Ajustes só para a captura: cabeçalho no topo da página, sem elementos flutuantes
const ajustes = `
.cabecalho{position:absolute!important}
.whatsapp-flutuante,.gaveta,.pular{display:none!important}
.hero{min-height:900px!important}
`;

const svgEcossistema = fs
  .readFileSync(path.join(site, 'assets/img/ecossistema-escuro.svg'), 'utf8')
  .replace(/<svg ([^>]*?)width="690" height="690"/, '<svg $1')
  .replace('<svg ', '<svg role="img" aria-label="Ecossistema da Saint Paul Jr" ');

const paginas = ['index.html', 'servicos.html', 'cases.html', 'contato.html', 'dor-caixa.html', 'dor-inovacao.html', 'dor-recorrencia.html'];
for (const p of paginas) {
  let h = fs.readFileSync(path.join(site, p), 'utf8');
  h = h
    .replace('<html lang="pt-BR">', '<html lang="pt-BR" class="estatico">')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="stylesheet" href="css\/[^"]+">\n?/g, '')
    .replace(/<link rel="icon"[^>]*>\n?/, '')
    .replace('</head>', `<style>${css}${ajustes}</style>\n</head>`)
    // Órbita: o SVG entra direto no HTML (no site isso é feito pelo JS)
    .replace(/<img src="assets\/img\/ecossistema-escuro\.svg"[^>]*>/, svgEcossistema)
    // Contatos ainda sem dados aparecem como "a definir", como no site
    .replace(/<span data-rotulo>(E-mail|WhatsApp|LinkedIn|Instagram)<\/span>/g, '<span data-rotulo>$1 a definir</span>')
    // Mapa do Google não importa no Figma: vira um bloco vazio do mesmo tamanho
    .replace(/<iframe title="Mapa[\s\S]*?<\/iframe>/, '')
    .replace(/(src|href)="(assets\/img\/[^"]+)"/g, (_, attr, rel) => `${attr}="${dataUri(rel)}"`);
  fs.writeFileSync(path.join(saida, p), h);
  console.log(p, (h.length / 1024).toFixed(0) + ' KB');
}
