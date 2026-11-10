-- Primeiro acesso: cadastra a primeira pessoa da gestão.
-- Troque o nome e o e-mail (o mesmo e-mail da conta Google que vai fazer login),
-- cole no SQL Editor do Supabase e clique em Run.
-- Os demais membros são cadastrados pelo próprio site, na tela Membros.

insert into public.membros (nome, email, perfil, setor, cargo)
values ('Nome da pessoa', 'email.da.pessoa@gmail.com', 'gestao', 'Comercial', 'Diretor(a)');
