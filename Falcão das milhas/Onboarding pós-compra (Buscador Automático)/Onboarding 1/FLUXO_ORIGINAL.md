# Onboarding 1 — Fluxo original desenhado pelo cliente

Reconstrução do board enviado pelo CS em 2026-07-27. Fontes: 6 prints do board + `Insumo/board-onboarding-1.csv` (o CSV traz só o texto dos nós, sem ordem e sem as conexões; os prints trazem as conexões, mas cortam parte dos textos. Este documento junta os dois).

Este arquivo é o desenho do cliente, não a versão AWSales. A avaliação de viabilidade está em `ANALISE_VIABILIDADE_AWSALES.md`.

---

## Objetivo do fluxo

Levar quem acabou de comprar o Buscador Automático a: (1) fazer o primeiro acesso, (2) completar o cadastro de perfil, (3) receber a campanha de indicação como recompensa por ter completado.

## Máquina de estados

O fluxo inteiro gira em torno de três status do lead, empurrados de fora para dentro:

- E0 — Não acessou
- E1 — Acessou, sem cadastro
- E2 — Completo

---

## Tronco principal

```txt
Webhook: compra_confirmada
        ↓
MSG 01 - Utility (template com botão "Continuar")
        ↓
   Interagiu?
   ├── Sim → Fluxo de acesso BA
   └── Não → Não interagiu com a mensagem
              ↓ Atraso inteligente: 24 horas
              Condição: status = "E0 - Não acessou" E não interagiu
              ├── Não → Encerra a automação
              └── Sim → MSG 10 - Utility [Follow-up]
                         ↓ Interagiu?
                         ├── Não → Encerra a automação
                         └── Sim → Fluxo de acesso BA
```

## Sub-fluxo reutilizável: Fluxo de acesso BA

Chamado de dois lugares (após MSG 01 e após MSG 10).

```txt
Fluxo de acesso BA
        ↓
MSG 02 - Nativa (email de compra + botão ACESSAR BUSCADOR)
        ↓
   Acessou o Buscador?
   ├── Sim → Completou o cadastro?
   │          ├── Sim → GATILHO EXTERNO (Push) status = E2
   │          └── Não → GATILHO EXTERNO (Push) status = E1
   └── Não → permanece E0
```

## Ramo E0 — Não acessou

Cadência de lembretes enquanto o status seguir E0:

| Espera | Mensagem |
|---|---|
| 5 min | "vi que você ainda não chegou a acessar o Buscador Automático..." + email de compra + BOTÃO A: ACESSAR BUSCADOR / BOTÃO B: Quero ajuda |
| 1 hora | "acabei de verificar aqui, e vi que você ainda não chegou acessou... Aconteceu alguma coisa?" |
| 12 horas | "estou preocupado com você! Já faz muito tempo que você comprou o Buscador Automático, mas ainda nem chegou a acessar. Você desistiu de olhar passagem com desconto?" |
| 24 horas | MSG 10 - Utility: "Alerta: Seu acesso pode expirar!" + BOTÃO: Continuar |

## Ramo E1 — Acessou, sem cadastro

| Espera | Mensagem |
|---|---|
| 5 min | "vi que você ainda não completou seu perfil... e por isso, você não conseguiu acessar o Buscador" + BOTÃO A: COMPLETAR MEU PERFIL |
| 1 hora | "Você está com uma pendência... Sou a {{nome_IA}} da plataforma Buscador Automático" + BOTÃO: APROVAR MEU PERFIL |
| 12 horas | "Ação Necessária: Finalize o cadastro do seu perfil de viagens" + BOTÃO A: ACESSAR BUSCADOR / BOTÃO B: Quero ajuda |

## Ramo E2 — Completo (campanha de indicação)

```txt
GATILHO EXTERNO (Push) status = E2
        ↓
Condição: status = "E2 - Completo"
        ↓
campanha de indicação
        ↓
MSG 03 - Nativa: "agora sim, está tudo pronto para você começar a usar o Buscador Automático...
                  PRESENTE GRATUITO: Por ter completado o seu perfil, você acaba de ganhar
                  um presente exclusivo! BOTÃO: RESGATAR MEU PRESENTE"
        ↓
"Você acaba de receber um presente exclusivo! Agora, você tem direito a adicionar uma pessoa
 no Buscador Automático de graça. Você tem algum amigo(a) que gosta de viajar? BOTÃO: SIM"
        ↓
Mensagem a) "Você acabou de ganhar o direito de presentear aquele seu amigo(a) que também
             ama viajar... Agora, você pode adicionar ele(a) de graça no Buscador."
Mensagem b) "Para adicionar seu amigo de graça, é bem simples.
             1) Você vai tocar no botão abaixo, e vai encaminhar a mensagem pronta pra ele(a).
             2) Ele vai responder um formulário rápido.
             3) Por último, basta ele criar a conta no Buscador Automático."
Mensagem c) "Toque no botão abaixo e mande seu presente agora: BOTÃO: ENVIAR PRESENTE"
        ↓
"Deu tudo certo? Conseguiu enviar o presente para o seu amigo?
 BOTÃO: SIM / BOTÃO: Preciso de ajuda"
        ↓
"Excelente! Depois, confere certinho se ele conseguiu acessar.
 Qualquer ajuda que precisar, pode me chamar aqui."
```

Esperas de 5 min e 1 hora também aparecem dentro desse ramo no board.

---

## Variáveis usadas no desenho

- `{primeiro nome}` / `{{first_name}}`: primeiro nome do comprador (o board usa duas grafias diferentes)
- `{{email_compra}}`: e-mail usado na compra
- `{{nome_IA}}`: nome da IA

## Textos completos, na íntegra

Preservados em `Insumo/board-onboarding-1.csv`.
