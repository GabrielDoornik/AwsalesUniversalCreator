# Mensagens de Disparo — Onboarding FDS Cademi

Campanha: Onboarding Fundamentos da Sintonização (Customer Success)
Agente recomendado: Onboarding (Customer Success)
Bot sem nome (identidade neutra "equipe do Fundamentos da Sintonização")

---

## Abertura de Janela (1ª mensagem)

```
🔓 Aqui está o seu acesso ao Fundamentos da Sintonização

Sua área de membros já está liberada com tudo prontinho pra você começar:
https://fundamentosdasintonizacao.cademi.com.br

Para acessar, utilize:

*E-mail:* o mesmo cadastrado na compra
*Senha:* Mudar123

Conseguiu acessar tudo certinho?
```

### Notas

- Versão objetiva solicitada pela cliente Lu Decat (2026-05-06): substituiu o cumprimento longo e a parabenização por uma frase única de cabeçalho ("🔓 Aqui está o seu acesso..."). Onboarding precisa ser o mais direto possível.
- 1 emoji (🔓) no início da mensagem, conforme pedido explícito da cliente. Demais aberturas dessa campanha mantêm essa abertura.
- 2 destaques em negrito: E-mail e Senha (dentro do limite de 2-4).
- Apresenta credenciais de acesso: e-mail da compra + senha padrão `Mudar123` (válida para todos os novos alunos).
- Pergunta final direta para puxar resposta com 3 caminhos previsíveis no fluxo:
  - "Sim, consegui" → IA direciona para o grupo de WhatsApp.
  - "Não consegui" / "Esqueci a senha" / "Já alterei a senha" → IA pede e-mail e dispara `@gerar_deep_link_de_acesso_cademi`.
  - "Tive problema X" → IA trata via fluxo do checkpoint.
- Link da área de membros: domínio raiz da Cademi (redireciona para o login do aluno).

---

## FUP 1 — 30min após abertura (sem resposta sobre acesso à área de membros)

```
Oi, deu tudo certo no seu acesso à área de membros?

Confirma aqui que eu sigo contigo nos próximos passos pra você aproveitar o programa por inteiro.
```

### Notas

- Gatilho: 30 minutos após a abertura, caso o aluno não tenha respondido se conseguiu acessar a área de membros.
- Mudança de escopo solicitada pela cliente Lu Decat (2026-05-06): o FUP não foca mais em "entrada no grupo de WhatsApp", e sim em confirmar se o aluno conseguiu entrar na área de membros. A lógica é que sem API confirmando o acesso, não faz sentido a IA já jogar o aluno pro grupo.
- Estrutura espelha a sugestão da cliente: pergunta de status seguida de pergunta de permissão para seguir. As duas perguntas funcionam em par e abrem caminho para o checkpoint encaminhar conforme a resposta.
- 1 destaque em negrito (nome do produto), sem emojis, CTA isolado.
- O fluxo do checkpoint cobre os caminhos pós-FUP: aluno confirma acesso → IA segue para o grupo (Etapa 3); aluno reporta travamento → IA dispara `@gerar_deep_link_de_acesso_cademi` (Etapa 2).

---

## Variáveis e links da campanha

- Área de membros (Cademi): `https://fundamentosdasintonizacao.cademi.com.br`
- Senha temporária padrão para novos alunos: `Mudar123`
- Grupo principal de WhatsApp: `https://chat.whatsapp.com/JpKXqxiuT50GtoARjCZtW9`
- Grupo de contingência (Sendflow): `https://sndflw.com/i/fds-rup`
- Suporte humano (somente reembolso): `https://wa.me/5566996685192`
- Tool de deep link: `@gerar_deep_link_de_acesso_cademi` → retorna `{{login_auto}}` e `{{nome_aluno}}`
