// Ecossistema em órbita, integrado ao fundo escuro:
// logos sem fundo branco (recoloridos em creme), ligados ao centro por "ponto a ponto"
const fs = require('fs');
const [,, entrada, logoNegativo, saida] = process.argv;
const s = fs.readFileSync(entrada, 'utf8');

const cabeca = s.slice(0, s.indexOf('<g id="pontos"'));
const pontos = s.slice(s.indexOf('<g id="pontos"'), s.indexOf('<g id="palavras"'));
const logos = s.slice(s.indexOf('<g id="logos">') + 14, s.lastIndexOf('</g>'));
const entre = (inicio, fim) => {
  const a = logos.indexOf(inicio);
  return logos.slice(a, logos.indexOf(fim, a) + fim.length);
};
const saintPaul = entre('<svg x="137.9"', '</svg>');
const btg = entre('<image x="498.7"', '/>');
const exame = entre('<image x="122.3"', '/>');
const negativo = fs.readFileSync(logoNegativo).toString('base64');

const logo = (markup, cx, cy, escala) =>
  `<g filter="url(#eco-claro)"><g transform="scale(${escala}) translate(${-cx} ${-cy})">${markup}</g></g>`;
const titulo = 'font-family:&quot;Inter Tight&quot;,Inter,Arial,sans-serif;font-weight:800;letter-spacing:-.03em';
const apoio = 'font-family:Inter,Arial,sans-serif;font-weight:600;letter-spacing:-.01em';
const palavra = (txt, tam, cor, estilo) =>
  `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="${tam}" fill="${cor}" style="${estilo}">${txt}</text>`;

const itens = [
  logo(saintPaul, 227, 147, 0.78),
  palavra('Estratégia', 21, '#9fd3cb', apoio),
  palavra('Ecossistema', 26, '#f6d995', titulo),
  logo(btg, 550, 163, 0.7),
  palavra('Mentorias', 26, '#f8f5e6', titulo),
  palavra('Conexão', 21, '#9fd3cb', apoio),
  logo(exame, 225, 525, 0.68),
  palavra('Orientação', 26, '#f6d995', titulo),
  palavra('Networking', 21, '#9fd3cb', apoio),
  palavra('Inovação', 26, '#f6d995', titulo),
  palavra('Planejamento', 20, '#9fd3cb', apoio),
];

const C = 345;
const raio = 262;
const polar = (r, ang) => [(C + r * Math.cos(ang)).toFixed(1), (C + r * Math.sin(ang)).toFixed(1)];
const raios = [];
const anel = itens
  .map((conteudo, i) => {
    const ang = (-90 + (i * 360) / itens.length) * (Math.PI / 180);
    const [x, y] = polar(raio, ang);
    const [x1, y1] = polar(104, ang);
    const [x2, y2] = polar(205, ang);
    // Traço reto do centro até um ponto, como o grafismo "ponto a ponto"
    raios.push(`<line class="eco-raio" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="eco-no" cx="${x2}" cy="${y2}" r="3.5"/>`);
    return `<g transform="translate(${x} ${y})"><g class="eco-item">${conteudo}</g></g>`;
  })
  .join('\n');

const estilo = `<defs>
<filter id="eco-claro" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.973  0 0 0 0 0.961  0 0 0 0 0.902  0 0 0 1 0"/></filter>
</defs>
<style>
#pontos{opacity:.45}
.eco-orbita{transform-origin:345px 345px;animation:eco-girar 90s linear infinite}
.eco-item{transform-box:fill-box;transform-origin:center;animation:eco-girar 90s linear infinite reverse}
.eco-trilha{fill:none;stroke:#9fd3cb;stroke-opacity:.16;stroke-width:1.5}
.eco-raio{stroke:#9fd3cb;stroke-opacity:.22;stroke-width:1.5}
.eco-no{fill:#b38201}
.eco-halo{fill:none;stroke:#9fd3cb;stroke-width:2;transform-box:fill-box;transform-origin:center;animation:eco-halo 3.6s ease-out infinite}
svg:hover .eco-orbita,svg:hover .eco-item{animation-play-state:paused}
@keyframes eco-girar{to{transform:rotate(360deg)}}
@keyframes eco-halo{from{transform:scale(1);opacity:.5}to{transform:scale(1.45);opacity:0}}
@media (prefers-reduced-motion:reduce){.eco-orbita,.eco-item,.eco-halo{animation:none}.eco-halo{opacity:0}}
</style>
`;

const centro = `<g class="eco-centro">
<circle class="eco-halo" cx="345" cy="345" r="86"/>
<circle cx="345" cy="345" r="86" fill="#184848" stroke="#9fd3cb" stroke-opacity=".45" stroke-width="2"/>
<image x="${345 - 62}" y="${345 - 34}" width="124" height="65.5" href="data:image/png;base64,${negativo}" role="img" aria-label="Saint Paul Jr"/>
</g>`;

const novo =
  cabeca.replace('<svg ', '<svg overflow="visible" ') +
  estilo +
  pontos +
  `<circle class="eco-trilha" cx="345" cy="345" r="${raio}"/>\n` +
  `<g class="eco-orbita">\n${raios.join('\n')}\n${anel}\n</g>\n` +
  centro +
  '\n</svg>\n';
fs.writeFileSync(saida, novo);
console.log('ok', (novo.length / 1024).toFixed(0) + ' KB');
