# Site Saint Paul Jr

Site da Saint Paul Jr, consultoria estratégica da Escola de Negócios Saint Paul.
Publicado pelo GitHub Pages a partir da branch `main`: toda alteração salva aqui entra no ar em cerca de 1 minuto.

## Como editar

**Pelo navegador (mais simples):** abra o arquivo aqui no GitHub, clique no lápis (Edit), faça a mudança e clique em **Commit changes**.

**Onde fica cada coisa:**

| O que mudar | Arquivo |
|---|---|
| Textos e seções da página inicial | `index.html` |
| Frentes e escopos | lista `FRENTES` em `ferramentas/gerar.js` e as abas em `ferramentas/base/index.html` |
| Resultados (NPS e projetos) | `NPS` e `PROJETOS` em `ferramentas/gerar.js` |
| Contato e formulário | `contato.html` |
| Páginas dos 3 sintomas | `dor-caixa.html`, `dor-inovacao.html`, `dor-recorrencia.html` |
| Cores, fontes, espaçamentos | `css/style.css` e `css/paginas.css` |
| Animações | `css/animacoes.css` |
| E-mail, WhatsApp, LinkedIn e Instagram | bloco `CONTATO` no topo de `js/main.js` |
| Imagens | pasta `assets/img/` |

**Atenção:** as páginas foram montadas pelo gerador em `ferramentas/gerar.js`.
Depois de editar o gerador ou `ferramentas/base/`, rode `node ferramentas/gerar.js ferramentas/base .` na raiz.

**Antes de publicar:** `grep -l 'class="preencher"' *.html` não pode listar nenhum arquivo.
Trechos com essa classe são dados que ainda faltam e aparecem destacados na página.
Se alguém rodar o gerador de novo, as edições feitas direto nos `.html` são substituídas.
Combine com o time antes de rodar (veja `ferramentas/LEIA-ME.md`).

## Ver no computador antes de publicar

Com o Node.js instalado, na pasta do projeto:

    node .claude/servidor.js

e abra http://localhost:5173.
