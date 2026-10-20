# Ferramentas do site Saint Paul Jr

As páginas `.html` da raiz são geradas pelo `gerar.js`. Para mudar texto ou estrutura
de qualquer página, edite o `gerar.js` (ou os trechos em `base/`) e rode, na raiz do site:

    node ferramentas/gerar.js ferramentas/base .

Editar só o `.html` da raiz funciona, mas a mudança some na próxima vez que o gerador rodar.

- `gerar.js`: monta Início, Serviços, Cases, Contato e as 3 páginas de sintoma.
- `base/`: versão anterior do Início e do Sobre, de onde o gerador copia seções.
- `orbita.js`: monta a arte do ecossistema em órbita (`assets/img/ecossistema-escuro.svg`).
  Uso: `node ferramentas/orbita.js ferramentas/base/ecossistema-original.svg assets/img/spjr-logo-negativo.png assets/img/ecossistema-escuro.svg`
- `figma-export.js`: gera versões autocontidas das páginas para importar no Figma (plugin html.to.design, aba Editor).
  Uso: `node ferramentas/figma-export.js . figma-export`
