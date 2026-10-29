# Anexo ao Brand Book · Site

Decisões do site que o Brand Book v1.0 não cobre. Valem como proposta nova até a próxima revisão do manual pelo Marketing.

## 1. Textura de pontos

**O que é:** um campo de pontos pequenos em verde-petróleo, todos iguais, em grade regular. É o ponto do j do logo repetido em escala pequena. Usa a mesma forma e a mesma cor sólida, sem transparência (Brand Book, p. 12).

**Medidas no site:**
- Ponto: 2,4 px de diâmetro, cor #184848.
- Espaço entre pontos: 26 px nas duas direções.
- Área: um bloco no canto superior direito da seção, com cerca de um terço da largura e até 380 px de altura. No celular, um bloco menor, de 110 px de altura.

**Sempre junto com o ponto cortado:** o ponto grande petróleo, cortado pela borda de cima (Brand Book, p. 12, "Cortado no canto"), fica por cima do campo de pontos.

**Onde usar:** em seções de fundo branco que ficam muito vazias. Hoje a textura está na seção de serviços da página inicial (classe `secao-textura` em `css/style.css`).

**Não pode:**
- Cobrir texto, título ou foto. O campo fica no espaço livre da seção.
- Usar sobre fundo areia ou escuro.
- Pontos em outra cor, com gradiente, de tamanhos variados ou fora da grade.
- Mais de uma seção com textura seguida da outra.

## 2. Cores de destaque no site

| Onde | Fundo claro | Fundo escuro |
|---|---|---|
| Botão principal | Verde-petróleo #184848, texto branco | Petróleo claro #9FD3CB, texto petróleo escuro #193B3D |
| Barra abaixo do título | Verde-petróleo #184848 | Petróleo claro #9FD3CB |
| Pontos e traços do grafismo | Verde-petróleo #184848 | Petróleo claro #9FD3CB |

O Brand Book lista o petróleo claro como cor de texto sobre fundo escuro e do ponto do logo na versão negativa (p. 9 e 10). Usar essa cor também em botões e grafismos sobre fundo escuro é uma decisão do time para o site.

A mostarda saiu do site. Pelo Brand Book (p. 9 e 12), ela fica só no Daily e no TikTok.

No código, essas cores ficam nas variáveis `--destaque`, no topo de `css/style.css`.
