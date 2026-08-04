# Onboarding 3 — Indicação (presente para um amigo)

Documento vivo. Criado em 2026-07-29, a partir do board do cliente (prints do Miro) e do CSV `Onboarding 1/Insumo/board-onboarding-1.csv`.

---

## Escopo

Público: quem acabou de preencher o formulário de perfil, ou seja, quem saiu do Onboarding 2 em F2.

Disparo: imediato, no mesmo momento em que o formulário é enviado. Como a pessoa acabou de conversar com a IA no Onboarding 2, a janela de 24 horas costuma estar aberta, e por isso todas as mensagens do board são nativas, sem template. Só quem preencheu o formulário fora da janela precisaria de template.

Objetivo: entregar o presente e fazer a indicação sair, ou seja, o cliente encaminhar a mensagem pronta para um amigo.

Output: presente enviado. Se der para medir o outro lado, o ideal é fechar quando o amigo criar a conta.

---

## Fluxo do cliente, reconstruído

```txt
Formulário de perfil preenchido (E2)
        ↓ imediato
MSG 03 - Nativa
"{{first_name}}, agora sim, está tudo pronto para você começar a usar o Buscador Automático...
 PRESENTE GRATUITO: Por ter completado o seu perfil, você acaba de ganhar um presente exclusivo!"
                                                          [ RESGATAR MEU PRESENTE ]
        ↓ Interagiu?
        ├── Não → Atraso inteligente: 1 hora
        │          ↓
        │         MSG 01 - Nativo, retentativa
        │         "Você acaba de receber um presente exclusivo!
        │          Agora, você tem direito a adicionar uma pessoa no Buscador
        │          Automático de graça.
        │          Você tem algum amigo(a) que gosta de viajar?"        [ SIM ]
        │          ↓ Interagiu?
        │          ├── Não → Encerra a automação
        │          └── Sim → segue para as mensagens a, b e c
        │
        └── Sim → segue para as mensagens a, b e c
                  ↓
MSG 01 - Nativo, três mensagens em sequência

a) "Você acabou de ganhar o direito de presentear aquele seu amigo(a) que também ama viajar...
    Agora, você pode adicionar ele(a) de graça no Buscador.
    E ele vai ter acesso às melhores passagens por causa de você!"

b) "Para adicionar seu amigo de graça, é bem simples.
    1) Você vai tocar no link abaixo
    2) Vai encaminhar a mensagem para o seu amigo(a)
    3) Ele vai criar a conta gratuitamente no Buscador Automático para ter acesso
       às passagens mais baratas"
   (versão reescrita pelo cliente em 29/07/2026; a original tinha um passo de formulário)

c) "Toque no botão abaixo e mande seu presente agora:"          [ ENVIAR PRESENTE ]
        ↓ Atraso inteligente: 5 min
MSG 01 - Nativo
"Deu tudo certo? Conseguiu enviar o presente para o seu amigo?"
                                          [ SIM ]   [ Preciso de ajuda ]
        ↓ Interagiu?
        ├── Não → Encerra a automação
        └── Sim → qual botão?
                  ├── SIM → "Excelente! Depois, confere certinho se ele conseguiu acessar.
                  │           Qualquer ajuda que precisar, pode me chamar aqui."
                  └── Preciso de ajuda → ATIVA IA SUPORTE
```

São duas esperas, com papéis diferentes: 1 hora para reoferecer o presente a quem não tocou no primeiro convite, e 5 minutos para perguntar se a indicação saiu depois que o cliente recebeu o botão de enviar.

Todas as mensagens do fluxo são nativas, inclusive a retentativa de 1 hora. Isso funciona porque a janela abriu na conversa do Onboarding 2, que acabou de acontecer, e dura 24 horas. Se algum dia a campanha passar a disparar para quem preencheu o formulário fora da janela, essas mensagens precisarão de template.

---

## Botão ENVIAR PRESENTE

É um link `wa.me` com texto pré-preenchido, que abre a lista de contatos do cliente para ele escolher com quem compartilhar. Confirmado no board.

Texto que o amigo recebe, decodificado da URL:

```
Oi! Consegui liberar um acesso grátis ao Buscador de passagens (o app que acha voo com desconto) e pensei em você, que adora viajar!

Se você quiser entrar pra ver alguma passagem com desconto, é só criar seu acesso, rapidinho:
https://novo.buscadorautomatico.com.br/cadastro
```

URL completa do botão:

```
https://wa.me/?text=Oi!%20Consegui%20liberar%20um%20acesso%20gr%C3%A1tis%20ao%20Buscador%20de%20passagens%20(o%20app%20que%20acha%20voo%20com%20desconto)%20e%20pensei%20em%20voc%C3%AA%2C%20que%20adora%20viajar!%0A%0ASe%20voc%C3%AA%20quiser%20entrar%20pra%20ver%20alguma%20passagem%20com%20desconto%2C%20%C3%A9%20s%C3%B3%20criar%20seu%20acesso%2C%20rapidinho%3A%0Ahttps%3A%2F%2Fnovo.buscadorautomatico.com.br%2Fcadastro
```

---

## Terceiro endereço do Buscador

O funil agora tem três URLs distintas, e é fácil a IA trocar uma pela outra:

- `novo.buscadorautomatico.com.br/primeiro-acesso` — quem comprou cria a conta. Onboarding 1.
- `novo.buscadorautomatico.com.br/` — login de quem já tem conta.
- `novo.buscadorautomatico.com.br/cadastro` — entrada do amigo indicado. Onboarding 3.

O checkpoint do Onboarding 3 precisa deixar explícito que o endereço do amigo é outro, e que a IA nunca manda o link de primeiro acesso para o indicado nem o link do amigo para o comprador.

---

## Pontos que precisam de confirmação

1. Resolvido em 2026-07-29: não existe formulário no caminho do amigo. O cliente reescreveu a mensagem b e tirou o passo de "responder um formulário rápido". O amigo toca no link e vai direto criar a conta. Os três passos passaram a ser: tocar no link, encaminhar a mensagem, o amigo criar a conta gratuitamente.

2. O que o amigo ganha, exatamente. A mensagem promete "acesso grátis ao Buscador". Falta saber se é acesso completo ou limitado, e por quanto tempo. Sem isso a IA não consegue responder "meu amigo vai ter o quê?" sem inventar, e essa pergunta vai aparecer.

3. Limite de indicações. A mensagem diz "adicionar uma pessoa", no singular. Se o cliente pedir para indicar dois, a IA precisa saber se pode.

4. Como saber que a indicação aconteceu. O `wa.me` não devolve nada para a plataforma: o cliente toca, escolhe o contato e envia por fora. A campanha só sabe pelo que ele responder no "Deu tudo certo?". Se o cadastro do amigo publicar evento, dá para fechar de verdade.

5. Resolvido em 2026-07-29: o nó ATIVA IA SUPORTE do board não vai ser implementado por ora. Quem toca em "Preciso de ajuda" é atendido dentro da própria campanha, pela base de conhecimento, sem troca para a campanha de Suporte. Na prática a trava quase sempre é o botão do convite não abrir, e o link alternativo resolve. Handoff para humano continua existindo apenas para os casos graves listados na Seção 9 do checkpoint, como cobrança, hostilidade e dúvida jurídica.

---

## Observação sobre o presente

O board apresenta o presente como recompensa por ter completado o perfil. Na prática é um mecanismo de aquisição: quem ganha o benefício de uso é o amigo, não quem indicou. A mensagem a resolve isso bem ao dizer "ele vai ter acesso às melhores passagens por causa de você", ou seja, o prêmio de quem indica é o gesto, não um ganho próprio.

Vale manter esse enquadramento e não deixar a IA prometer nenhuma vantagem para quem indica, tipo desconto, extensão de acesso ou bônus, porque nada disso existe no material.
