# Site interno da Saint Paul Jr — Instruções para construir (vibe code)

> **Versão:** 2.0 (simplificada) · novembro de 2026
> **Princípio:** simples, rápido e útil. Cada tela tem que responder uma pergunta do dia a dia. Se uma função não vai ser usada toda semana, ela fica para depois.

---

## 1. Como usar este arquivo

1. Abra a ferramenta de vibe code (Lovable, Bolt, Cursor ou Claude Code).
2. Cole as **seções 2 a 5** como contexto e peça: "Leia e confirme que entendeu."
3. Cole o **prompt da Fase 1** (seção 8). Teste. Só depois passe para a próxima fase.
4. Guarde o projeto no GitHub e nas contas **da SPJ**, nunca na conta pessoal de um membro.

---

## 2. O que é o site

Um site interno com login que junta num lugar só o CRM, a agenda, as tarefas, os processos e os modelos da Saint Paul Jr.

**Regras de simplicidade (a ferramenta deve seguir):**
- Poucas telas, poucos cliques. Cadastrar um lead ou registrar um contato tem que levar menos de 1 minuto.
- Formulários curtos: só os campos obrigatórios aparecem; o resto fica em "mais detalhes".
- Nada de etapas de aprovação, fluxos travados ou campos obrigatórios em excesso.
- Textos longos (processos, FAQ, onboarding) são páginas em Markdown que a gestão edita direto.
- Arquivos ficam no **Google Drive**; o site só guarda o link da pasta.
- Interface em português, datas dd/mm/aaaa, valores em R$, funciona no celular.

**Fora da versão 1:** portal do cliente, assinatura de contrato, nota fiscal, chat, app nativo, e-mails automáticos.

---

## 3. Tecnologia

- **React + Tailwind** (o que a ferramenta já usa por padrão)
- **Supabase**: banco de dados, login com Google e permissões
- **Hospedagem:** a própria ferramenta (Lovable/Bolt) ou Vercel
- Planos gratuitos são suficientes para começar.

---

## 4. Login e perfis

- Entrar **só com conta Google**. Só entra quem estiver cadastrado em **Membros** com status ativo. Os outros veem: "Seu acesso ainda não foi liberado. Fale com a Diretoria."
- Dois perfis:

| | **Gestão** (diretores e gerentes) | **Associado** |
|---|---|---|
| Início, Calendário, Tarefas, Equipe, Processos, Modelos, Mural, FAQ, Onboarding | vê e edita | vê; edita as próprias tarefas e o próprio perfil |
| CRM (leads, clientes, contatos, contatos feitos) | vê e edita tudo | vê tudo **sem valores e sem CPF/CNPJ**; edita os leads em que é responsável |
| Projetos | vê e edita | vê; edita os projetos em que está na equipe |
| Precificação, Financeiro, Indicadores com R$ | sim | **não** |
| Viabilidade | sim | preenche |
| Sugestões | lê e responde | envia (pode ser anônima) |
| Membros e configurações | sim | não |

- **Regra de segurança obrigatória:** as permissões são aplicadas **no banco** (RLS do Supabase), e não só escondendo botões. Valores, CPF/CNPJ e o financeiro ficam em tabelas que o associado não consegue ler.
- **Sugestão anônima:** é gravada sem nenhuma informação de quem enviou. Nem a gestão consegue saber.

---

## 5. Visual (marca SPJ)

- **Cores:** fundo branco #FFFFFF · texto preto #191818 · destaque, botões e links em verde-petróleo #184848 · faixas de destaque em areia #F8F5E6 · bordas #D9D9D9.
- **Fontes:** títulos em **Inter Tight 800**, texto em **Inter 400** (16px), botões em Inter 600.
- **Estilo:** limpo, cards com borda fina e cantos de 6px, **sem sombras, sem gradientes, sem emoji**.
- O marcador da marca é um **ponto verde-petróleo** (círculo pequeno). Use-o no lugar de ícones decorativos e para mostrar etapas (pontos ligados por uma linha reta).
- **Logo:** use o arquivo oficial (não recrie o logo com fonte).
- **Menu:** lateral, fundo preto, item ativo marcado com o ponto. No celular vira um menu de gaveta.
- Nome sempre "Saint Paul Jr" ou "SPJ".

---

## 6. As telas

### 6.1 Início
O que eu preciso fazer hoje e nesta semana. Mostra:
- **Avisos fixados** do Mural (até 3).
- **Meus prazos da semana:** minhas tarefas, meus próximos contatos com clientes e as entregas dos meus projetos, com os **atrasados no topo, em destaque**.
- **Agenda dos próximos 7 dias** (inclui aniversários).
- **Atalhos:** até 6 botões que cada pessoa escolhe.
- **Só para a gestão:** 4 números (leads no mês, propostas em aberto, projetos ativos, valores a receber) e a lista "parado há mais de 7 dias".

### 6.2 Calendário
- Visão de mês e de lista, com filtro por tipo.
- **Tipos:** Reunião · Evento · Entrega · Aniversário.
- Entregas de projeto e aniversários (da equipe e dos contatos de clientes) entram **automaticamente**. Reuniões e eventos são cadastrados à mão (título, data/hora, link ou local, descrição).

### 6.3 Tarefas
- Kanban com 4 colunas: **A fazer · Fazendo · Parado · Feito**.
- Campos: título, responsável, setor, prazo, descrição (opcional), projeto (opcional).
- Filtro por setor e por responsável. Tarefa com prazo vencido fica destacada.
- A coluna **Parado** mostra o que está travado. Ao mover para ela, a pessoa escreve o motivo em uma linha.

### 6.4 Equipe
- Cards com foto, nome, setor, cargo, e-mail e botão de WhatsApp. Busca e filtro por setor.
- Cada pessoa edita a própria foto, o telefone e uma bio curta.
- Aniversário (dia/mês) aparece no calendário.

### 6.5 Processos
- Uma página por processo, agrupada por setor (Comercial, Projetos, Marketing, Gente & Gestão, Financeiro).
- Conteúdo em **Markdown**: objetivo, passo a passo numerado, quem faz, prazo e links para os modelos. O documento do Comercial é o padrão a seguir.
- Busca por palavra. Mostra "atualizado em".

### 6.6 Modelos
- Lista com filtro por tipo: **Ficha Diagnóstica, Ata, Ficha de Viabilidade, Proposta, Contrato, Mensagens para clientes**.
- Cada modelo tem o texto e um **botão Copiar** (mostra "Copiado"). Documentos maiores (proposta, contrato) também têm o link do arquivo no Drive.
- Mensagens para clientes com botão **Abrir no WhatsApp**.
- Mensagens iniciais: primeiro contato, confirmação de reunião, envio de proposta, follow-up de proposta, boas-vindas ao cliente, entrega de etapa, pedido de avaliação, cobrança amigável, aniversário.

### 6.7 CRM (substitui a planilha CRM_SPJr)

**Leads (tela principal do CRM):** kanban com as etapas
**Lead · Qualificação · Diagnóstico · Proposta enviada · Negociação · Ganha · Perdida**
- O card mostra cliente, título, responsável e **data do próximo contato** (vermelha se já passou).
- Arrastar o card muda a etapa. Ao mover para Perdida, escolher o motivo (lista).
- Ao mover para Ganha, o site oferece "Criar projeto?" com um clique.
- Campos do lead: título, cliente, contato, serviço, origem, responsável, valor (só gestão), próximo passo, data do próximo contato, observações.

**Clientes:** lista com busca e filtro por status (Prospect, Ativo, Inativo, Perdido).
- Ficha do cliente: dados da empresa, contatos, leads, histórico de contatos feitos, projetos e **link da pasta no Drive**.
- Mostra a **etapa atual da jornada** com os pontos: Lead → Diagnóstico → Proposta → Fechado → Em projeto → Entregue.

**Contatos:** nome, cargo, e-mail, WhatsApp, papel na decisão e aniversário. Pertencem a um cliente.

**Registrar contato** (botão em todo o CRM e no Início): data, cliente, tipo (reunião, ligação, WhatsApp, e-mail), resumo em poucas linhas, próximo passo e data. Isso atualiza automaticamente o próximo contato do lead.

**Propostas (só gestão):** número, cliente, valor, data de envio, validade, status (Enviada, Em negociação, Aceita, Recusada) e link do documento.

### 6.8 Projetos
- Lista com status: **Em andamento · Pausado · Concluído**.
- Campos: nome, cliente, responsável, equipe, início, prazo final, valor (só gestão), link da pasta no Drive.
- **Entregas:** uma lista simples com nome e data de cada entrega (aparecem no calendário).
- **Handoff:** um checklist curto preenchido ao criar o projeto: escopo combinado, o que **não** está no escopo, contatos do cliente, link da proposta, link do contrato, pasta criada, kickoff marcado.

### 6.9 Precificação (Comercial, só gestão)
Uma calculadora em **uma tela**:
- Linhas de atividade com horas estimadas
- Valor-hora (padrão definido pela gestão)
- Custos extras
- Margem (%)
- Resultado: **preço sugerido**, mais um campo "preço final" e as condições de pagamento
- Botão **Salvar no lead**, que grava o valor no lead e na proposta.

> O Comercial confirma a fórmula e o valor-hora antes de liberar esta tela.

### 6.10 Viabilidade (Projetos)
Uma ficha curta ligada ao lead, preenchida depois do Diagnóstico:
- 6 perguntas de **sim / não / com ressalva**, cada uma com um comentário opcional:
  1. O pedido está dentro do que a SPJ faz?
  2. Temos gente que sabe fazer (ou um orientador que cubra)?
  3. Temos equipe disponível no período?
  4. O prazo é realista?
  5. O cliente vai dar acesso às informações e às pessoas?
  6. O risco é aceitável?
- **Parecer final:** Viável · Viável com ressalvas · Inviável, mais uma linha de justificativa.
- O resultado aparece como etiqueta no card do lead.

### 6.11 Indicadores
Uma página só, com filtro de mês, em números grandes:
- Leads novos · Leads por etapa · Taxa de conversão (ganhas ÷ ganhas + perdidas) · Motivos de perda
- Propostas enviadas e aceitas
- Projetos ativos e concluídos
- **NPS** (0–10: % de notas 9–10 menos % de notas 0–6) e **CSAT** (1–5: % de notas 4–5)
- Só para a gestão: valor vendido e valor a receber.

As notas de NPS e CSAT são lançadas pela gestão em cada projeto concluído (nota NPS, nota CSAT e comentário). Um formulário para o próprio cliente responder fica para uma próxima versão.

### 6.12 Financeiro (só gestão)
Uma lista de parcelas: projeto, valor, vencimento, data de pagamento.
O status é automático: **A vencer · Atrasado · Pago**. No topo, os totais a receber e em atraso.

### 6.13 Mural, FAQ e Sugestões
- **Mural:** avisos com título, texto e a opção de fixar no Início. Só a gestão publica.
- **FAQ:** perguntas e respostas por categoria, com busca.
- **Sugestões:** campo de texto, categoria e a caixa "Enviar anonimamente". A gestão lê, marca o status (Recebida, Em análise, Feito, Não será feito) e pode responder publicamente.

### 6.14 Onboarding
- **Trilha de leitura:** lista de links para processos, FAQ e modelos, com uma caixa de "li" em cada item e o progresso em pontos.
- **Checklist da primeira semana:** acesso liberado · perfil preenchido · conversa com o diretor do setor · padrinho definido · trilha lida · acompanhou uma reunião · primeira tarefa feita.
- A gestão vê quem já terminou.

### 6.15 Arquivos
Não existe upload no site. Cada cliente e cada projeto tem o **link da pasta no Google Drive**, que segue sempre a mesma estrutura:
`01 Comercial · 02 Proposta e Contrato · 03 Handoff · 04 Projeto · 05 Encerramento`
A página **Arquivos** lista os clientes com o botão "Abrir pasta".

### 6.16 Membros (só gestão)
Cadastrar membro (nome, e-mail, setor, cargo, perfil), ativar e desativar. Ao desativar alguém, a pessoa perde o acesso na hora e o site mostra o que estava no nome dela, para reatribuir.

---

## 7. Banco de dados (enxuto)

| Tabela | Campos principais |
|---|---|
| membros | nome, email, perfil (gestao/associado), setor, cargo, telefone, foto, aniversario, ativo |
| clientes | empresa, documento*, segmento, porte, cidade, origem, status, responsavel, pasta_drive |
| contatos | cliente, nome, cargo, email, telefone, papel, aniversario |
| leads | titulo, cliente, contato, servico, origem, etapa, valor*, responsavel, proximo_passo, data_proximo_contato, motivo_perda, viabilidade |
| contatos_feitos | data, cliente, lead, tipo, resumo, responsavel, proximo_passo, data_proximo |
| propostas* | numero, lead, valor, envio, validade, status, link |
| projetos | nome, cliente, lead, responsavel, equipe, inicio, prazo, status, valor*, pasta_drive, handoff (checklist), nps, csat, comentario_cliente |
| entregas | projeto, nome, data, feita |
| parcelas* | projeto, valor, vencimento, pagamento |
| precificacoes* | lead, itens, valor_hora, custos, margem, preco_sugerido, preco_final, condicoes |
| viabilidades | lead, respostas, parecer, justificativa |
| tarefas | titulo, responsavel, setor, prazo, status, motivo_parado, projeto |
| eventos | titulo, tipo, inicio, fim, local_link, descricao |
| paginas | tipo (processo/faq/onboarding), setor, titulo, conteudo_markdown, ordem |
| modelos | tipo, titulo, texto, link_arquivo |
| avisos | titulo, texto, fixado, data |
| sugestoes | categoria, texto, anonima, autor (vazio se anônima), status, resposta |
| onboarding | membro, itens_concluidos, checklist |
| listas | lista, valor (motivos de perda, origens, serviços, segmentos, setores) |

\* Campo ou tabela visível **só para a gestão**. Para os associados, o banco entrega versões sem esses campos.

---

## 8. Construção em 4 fases

Antes de cada prompt, cole as seções 2 a 5.

### Fase 1 — Base e CRM (o mais importante)

```
Construa a base do site interno da Saint Paul Jr seguindo as seções 2 a 5.

1. Layout com menu lateral, visual da seção 5 e login só com Google (Supabase).
   Só entra quem está em "membros" com ativo = true.
2. Perfis gestao e associado, com permissões no banco (RLS), conforme a seção 4.
   Valores, CPF/CNPJ, propostas, parcelas e precificações são invisíveis para
   associados também via API.
3. Telas: Membros (gestão), Equipe, e o CRM completo da seção 6.7: kanban de
   leads, clientes, contatos, "registrar contato" e propostas.
4. Mantenha tudo simples: formulários curtos, campos opcionais em "mais detalhes".

No final, me mostre como testar, logado como associado, que
supabase.from('propostas').select('*') não retorna nada.
```

### Fase 2 — Dia a dia

```
Fase 2, seguindo as seções 6.1 a 6.4, 6.8 e 6.15:
Início, Calendário (com entregas e aniversários automáticos), Tarefas (kanban
de 4 colunas), Projetos (com entregas e checklist de handoff) e Arquivos
(links do Drive). Quando um lead for para "Ganha", ofereça criar o projeto.
Mantenha simples.
```

### Fase 3 — Conhecimento e comunicação

```
Fase 3, seguindo as seções 6.5, 6.6, 6.13 e 6.14:
Processos, FAQ e Onboarding como páginas em Markdown editáveis pela gestão;
Modelos com botão Copiar e Abrir no WhatsApp; Mural; Sugestões com envio
anônimo que NÃO grava o autor no banco. Cadastre as mensagens da seção 6.6
com um texto provisório.
```

### Fase 4 — Gestão

```
Fase 4, seguindo as seções 6.9 a 6.12:
Precificação (calculadora em uma tela, que salva no lead), Viabilidade
(6 perguntas + parecer, etiqueta no card do lead), Indicadores (uma página,
números grandes, filtro de mês; valores só para a gestão) e Financeiro
(parcelas com status automático).
```

---

## 9. Antes de começar

- [ ] Criar as contas da SPJ (Google, GitHub, Supabase) com 2 administradores da gestão.
- [ ] Lista real dos membros: nome, e-mail, setor, cargo e perfil. Na aba Listas da planilha, os e-mails são de exemplo.
- [ ] **Arrumar a planilha do CRM antes de importar:**
  - padronizar os nomes ("Leilões Online MS", "Infornet e Lavanderia", um nome por responsável);
  - colocar os valores como número e as datas como data;
  - juntar a linha solta "Oscar" à Infornet;
  - cadastrar a Leilões Online MS em Clientes;
  - resolver os conflitos (status da Verity, motivo de perda da Rede do Futuro, propostas faltando da Exame e da Intrust);
  - criar os projetos das oportunidades ganhas (a aba Projetos não existe no arquivo).
- [ ] Comercial confirma o valor-hora e a margem da precificação.
- [ ] Logo oficial em PNG ou SVG.

## 10. Testes rápidos (ao final de cada fase)

- [ ] Um e-mail não cadastrado não entra.
- [ ] O associado não vê Precificação, Financeiro nem valores, nem digitando o endereço da página nem pelo console.
- [ ] O associado não edita a tarefa de outra pessoa.
- [ ] Registrar um contato leva menos de 1 minuto e atualiza o próximo contato do lead.
- [ ] Um item atrasado aparece no topo do Início.
- [ ] A sugestão anônima fica sem autor no banco.
- [ ] Tudo funciona no celular.

## 11. Para não morrer depois

- Dois responsáveis pelo site na gestão (titular + suplente).
- Este arquivo fica junto do código e é atualizado quando o site mudar.
- Melhorias entram pelo canal de Sugestões e são decididas uma vez por mês.
- Antes de pedir uma função nova, a pergunta é: **alguém vai usar isso toda semana?**
