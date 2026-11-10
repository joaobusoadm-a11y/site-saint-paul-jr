# Site interno da Saint Paul Jr

Site com login que junta o CRM, a equipe e (nas próximas fases) a agenda, as tarefas, os processos e os modelos da SPJ.
O que o site deve ser está em [`INSTRUCOES.md`](INSTRUCOES.md). Este arquivo explica como colocar no ar, testar e mexer.

**Pronto (Fase 1):** login com Google, perfis Gestão e Associado com permissões no banco, Membros, Equipe e o CRM
(kanban de leads, clientes, contatos, registrar contato e propostas). Da Fase 2 já entrou a base de Projetos:
lead que vai para Ganha oferece "Criar projeto?" e o projeto aparece na lista de Projetos.
**Falta:** Fase 2 (Início, Calendário, Tarefas, entregas e handoff dos projetos, Arquivos), Fase 3 (Processos, Modelos, Mural, FAQ, Sugestões,
Onboarding) e Fase 4 (Precificação, Viabilidade, Indicadores, Financeiro).

Feito com React + Tailwind (Vite) e Supabase. Os planos gratuitos bastam.

## Colocar no ar

Use as contas **da SPJ**, com dois administradores da gestão, nunca a conta pessoal de um membro.

### 1. Banco (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode os arquivos de [`supabase/migrations/`](supabase/migrations/) um por vez, na ordem do
   número (`0001_fase1.sql`, depois `0002_projetos.sql`): cole o arquivo inteiro e clique em **Run**.
3. Abra [`supabase/primeiro-acesso.sql`](supabase/primeiro-acesso.sql), troque o nome e o e-mail pela primeira pessoa
   da gestão e rode. Os outros membros são cadastrados depois, pelo site.

### 2. Login com Google

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, configure a tela de consentimento e
   crie uma credencial **ID do cliente OAuth** do tipo "Aplicativo da Web". Em "URIs de redirecionamento autorizados",
   cole o endereço de retorno que o Supabase mostra no passo seguinte (termina em `/auth/v1/callback`).
2. No Supabase, em **Authentication**, abra os provedores de login, ative o **Google** e cole o ID e a chave secreta.
3. Na mesma tela, **desative o provedor Email**. O site só aceita Google, e o banco também só reconhece conta Google.
4. Em **Authentication > URL Configuration**, coloque o endereço do site em **Site URL** e em **Redirect URLs**
   (para testar no computador, inclua também `http://localhost:5173`).

### 3. Hospedagem (Vercel)

1. Importe este repositório na Vercel.
2. Em **Environment Variables**, crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores de
   **Project Settings > API** do Supabase. A chave "anon" é pública e pode ficar no site.
   A chave `service_role` nunca entra no site.
3. Publique. A cada alteração na branch principal, a Vercel publica de novo.

### Rodar no computador

    cp .env.example .env.local     (e preencha as duas variáveis)
    npm install
    npm run dev

Abra http://localhost:5173.

## Testes rápidos (ao final de cada fase)

**Permissões no banco.** Cole [`supabase/testes/teste_permissoes.sql`](supabase/testes/teste_permissoes.sql) no SQL
Editor e rode. Tem que aparecer "Tudo certo". O teste cria dados de exemplo, confere cada regra e desfaz tudo no final.

**Pelo console, logado como associado.** Abra o site, aperte F12, vá na aba Console e rode:

    await supabase.from('propostas').select('*')

A resposta tem que ser `data: []`. Vale o mesmo para `leads_valores` (valor dos leads), `projetos_valores`
(valor dos projetos) e `clientes_documentos` (CPF/CNPJ). Logado como gestão, as mesmas linhas trazem os dados.

**Na mão:**

- [ ] Um e-mail não cadastrado em Membros não entra.
- [ ] O associado não vê Propostas nem valores, nem digitando `/crm/propostas` no endereço.
- [ ] O associado abre o lead de outra pessoa e não consegue salvar.
- [ ] Registrar um contato leva menos de 1 minuto e muda o "próximo contato" do lead.
- [ ] Desativar um membro tira o acesso dele na hora.
- [ ] Tudo funciona no celular.

## Quem pode o quê

As regras valem no banco (RLS), no arquivo da migração. O site só esconde o que a pessoa não pode usar.

| | Gestão | Associado |
|---|---|---|
| Membros e listas | cadastra e edita (inclusive o aniversário) | vê a equipe; edita a própria foto, WhatsApp e bio |
| Clientes e contatos | vê e edita tudo | vê tudo, sem CPF/CNPJ; cadastra; edita onde é responsável ou tem um lead |
| Leads | vê e edita tudo | vê tudo, sem valor; cadastra no próprio nome; edita os leads em que é responsável |
| Registrar contato | sim | sim, no próprio nome |
| Propostas | sim | não |
| Projetos | vê e edita tudo; cadastra do zero | vê tudo, sem valor; cria o projeto do próprio lead ganho; edita onde é responsável ou está na equipe |
| Excluir cliente, lead ou projeto | sim | não |

Como o login funciona: no primeiro acesso, a conta Google é ligada ao membro que tem o mesmo e-mail. Vale o e-mail
confirmado pelo Google. Se a gestão troca o e-mail de um membro, a conta antiga deixa de valer.

Regras automáticas do banco: registrar contato atualiza o próximo passo e a data do lead; lead que vai para Ganha
deixa o cliente como Ativo e pode virar um projeto (um por lead, com o valor do lead); lead só vai para Perdida com motivo; sempre sobra uma pessoa ativa na gestão.

## Onde fica cada coisa

| O que mudar | Arquivo |
|---|---|
| Cores, fontes e cantos (marca SPJ) | `tailwind.config.js` e `src/index.css` |
| Itens do menu | `MENU` em `src/componentes/Layout.jsx` |
| Etapas do kanban, status e tipos de contato | `src/lib/constantes.js` |
| Setores, serviços, origens, motivos de perda | no site, em Membros > Listas |
| Leituras e gravações do banco | `src/lib/dados.js` |
| Telas | `src/paginas/` |
| Formulários do CRM | `src/crm/` |
| Tabelas e permissões | `supabase/migrations/` (uma migração nova por fase, nunca editar uma já rodada) |

O logo em `public/spjr-logo.png` é o arquivo oficial. Não recrie o logo com fonte.

## Para não morrer depois

- Dois responsáveis pelo site na gestão (titular e suplente).
- `INSTRUCOES.md` e este arquivo são atualizados quando o site mudar.
- Antes de pedir uma função nova, a pergunta é: alguém vai usar isso toda semana?
