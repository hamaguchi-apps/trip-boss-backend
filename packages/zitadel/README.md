1. Ir para a home do Zitadel http://localhost:8082/ e se logar com admin.
2. Ir até a página de usuários http://localhost:8082/ui/console/users.
3. Clicar em `service users` e `new`.
4. Preencher e o tipo de token de acesso deve ser `jwt`. Lembre-se que o nome de usuário não poderá ser trocado depois.
5. Ir até a página de projetos http://localhost:8082/ui/console/projects e selecionar a quem esse service user pertence.
6. No canto direito ao lado do botão `Actions` tem um `+`, clique nele.
7. Escolha o service user recém-criado e selecione a role que tem 'owner' no nome.
8. Volte na página de usuários e selecione o service user criado.
9. Na esquerda, no menu, escolha memberships, ali deve aparecer os projetos que o service user pertence.
10. No menu à esquerda, clique em keys, crie uma sem data de expiração e faça o download do JSON.
11. Esse JSON será usado para criar o client no node. Ele deve ser tratado como um segredo e não compartilhado.
