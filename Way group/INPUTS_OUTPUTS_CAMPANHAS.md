# Inputs e Outputs das Campanhas — Way Group

Referência de INPUT (o que inicia a campanha) e OUTPUT / Evento de Conversão (o que encerra a participação do lead na campanha) de cada campanha do Way Group na AWSales. Modelo conceitual em `Estrutura/INPUT_OUTPUT_CAMPANHAS.md`.

Organização Way Group na AWSales: `dc38edd7-5bfe-413f-ad19-0658b527d2bf`.

> ATENÇÃO: diferente do Tintim, aqui quase nenhum evento está configurado/testado ainda. A maior parte depende de integração que NÃO foi construída (Assiny, MemberKit, submit do formulário CNPJ, split 50/50). Cada item marcado como A DEFINIR ou NÃO CONFIRMADO é trabalho pendente, não fato. Este doc é ao mesmo tempo o mapa alvo e a lista de integração que falta.

## Contexto: são dois funis

O cliente (Cardoso, 16/07) confirmou 6 campanhas em 2 funis:
- Funil 1 (backend do VTD): quem comprou o VTD. Campanhas REC, Onboarding, SDR pós-compra, SDR pós-aula 2. Nesse funil, o próprio SDR vende FAS e oferta o CNPJ inline (Etapas 3B/3C do checkpoint SDR).
- Funil 2 (base fria de formulários): leads antigos de formulário que hoje não são trabalhados. Reaproveita as campanhas Venda FAS e Venda CNPJ como abordagem ativa direta.

Ou seja, Venda FAS e Venda CNPJ existem como campanhas próprias para o Funil 2, mas o comportamento de venda de FAS/CNPJ também vive dentro do SDR no Funil 1.

## Resumo

| Campanha | Tipo | INPUT | OUTPUT (Evento de Conversão) | Status |
|---|---|---|---|---|
| REC de vendas VTD | Recuperação (ativa) | Assiny / abandono de checkout do VTD | Assiny / compra do VTD | INPUT e OUTPUT a construir (integração Assiny não confirmada) |
| Onboarding VTD | Customer Success (ativa) | Assiny / compra do VTD aprovada | Assistiu as 2 primeiras aulas (MemberKit) — ou sem output | A DEFINIR (MemberKit não integrado) |
| SDR pós-compra | SDR (ativa) | Assiny / compra do VTD (fatia sem onboarding, 50%) | Agendou call OU comprou FAS OU preencheu form CNPJ | A DEFINIR (split 50/50 + 3 conversões) |
| SDR pós-aula 2 | SDR (ativa) | Assistiu as 2 primeiras aulas (MemberKit) | Agendou call OU comprou FAS OU preencheu form CNPJ | BLOQUEADO (gatilho MemberKit não existe) |
| Venda FAS | Venda Direta (ativa) | Handoff de lead perfil FAS (Funil 2: base de forms) | Assiny / compra do FAS | INPUT a definir; OUTPUT a construir |
| Venda CNPJ | Venda Direta (ativa) | Handoff de lead perfil CNPJ (Funil 2: base de forms) | Formulário CNPJ preenchido (link.wayecom / HighLevel) | INPUT a definir; OUTPUT a construir |

## 1. REC de vendas VTD

- Tipo: recuperação. Abre com template quando o lead abandona o checkout do VTD.
- INPUT (alvo): evento de abandono de checkout do VTD na Assiny.
  - Plataforma de origem: Assiny (credencial de integração ainda NÃO criada na AWSales).
  - Produto: oferta do VTD no checkout, nome "[VTD] - Treinamento Venda Todo Dia".
  - Evento: abandono de carrinho / checkout iniciado e não concluído. NÃO CONFIRMADO que a Assiny dispara evento de abandono e que a AWSales recebe. Validar o que a Assiny expõe (webhook de abandono existe?).
- OUTPUT (Evento de Conversão, alvo): compra do VTD confirmada na Assiny. Quando o lead finaliza, a REC para de recuperar.
  - Mesmo evento de compra que serve de INPUT para Onboarding e SDR pós-compra.
- Lado "perdido": lead que não responde/recusa não precisa de evento — o follow-up encerra ao esgotar as tentativas.
- Checkout: `https://pay.assiny.com.br/4XZFws/node/zwGh42`.

## 2. Onboarding VTD

- Tipo: customer success. Abre logo após a compra do VTD aprovada (fatia de 50% dos compradores).
- INPUT (alvo): compra do VTD confirmada na Assiny (mesmo evento de compra do item 1).
  - PENDENTE: como o split 50/50 (onboarding vs SDR pós-compra direto) é decidido e implementado. É regra de roteamento do lado da AWSales/n8n, não definida ainda.
- OUTPUT (Evento de Conversão): A DEFINIR. O objetivo do onboarding é ativação (logar na área de membros + assistir as 2 primeiras aulas). Opções:
  - (a) Conversão = "assistiu as 2 primeiras aulas", vindo do MemberKit. Esse MESMO evento é o INPUT da SDR pós-aula 2, então ele encadeia as duas. Depende da integração MemberKit, que NÃO existe.
  - (b) Sem evento de conversão: o onboarding roda a sequência e se esgota sozinho (modelo do Lembrete do Tintim).
  - Decisão depende de existir ou não o gatilho do MemberKit (ver Pendências).
- Área de aulas: `lucas-arruda-amazon-pro.memberkit.com.br`.

## 3. SDR pós-compra

- Tipo: SDR ativa. Aborda logo após a compra do VTD a fatia de ~50% que NÃO passa por onboarding.
- INPUT (alvo): compra do VTD confirmada na Assiny (mesma da REC/Onboarding), na fatia sem onboarding.
  - PENDENTE: mecanismo do split 50/50 (mesmo do item 2).
- OUTPUT (Evento de Conversão): esta campanha tem TRÊS desfechos de sucesso, e a plataforma normalmente fecha por um evento só. A definir como configurar:
  - Agendou call (Starter/Scale) → agendamento criado no HighLevel pela tool `@criar_agendamento`. O sinal de conversão pode vir de um evento de "appointment booked" do HighLevel OU do próprio n8n disparar o output ao criar o agendamento.
  - Comprou FAS → compra na Assiny (checkout FAS).
  - Preencheu formulário CNPJ → submit do formulário (link.wayecom / HighLevel).
  - DECISÃO PENDENTE: a AWSales suporta 3 eventos de conversão numa campanha? Se não, definir o desfecho principal e tratar os outros pelo movimento de card / follow-up SKIP.
- Card no CRM: movimentação pelo pipeline (Aplicou → Prospecção → Em conversa → Agendamento → Fechado/Perdido) via a tool `@mover_card_crm` (a construir).

## 4. SDR pós-aula 2

- Tipo: SDR ativa. Aborda o aluno (a fatia onboardada) quando ele assiste as 2 primeiras aulas.
- INPUT (alvo): evento "assistiu as 2 primeiras aulas" do MemberKit.
  - BLOQUEADO: não existe integração confirmada com o MemberKit que avise progresso de aula. As integrações previstas pelo cliente são só Meta, Assiny e webhook de compras de CNPJ na Amazon. Sem esse evento, a campanha não tem gatilho — ou depende de a Way habilitar webhook/automação do MemberKit, ou vira disparo por tempo (mais fraco, perde o sentido do gatilho).
- OUTPUT (Evento de Conversão): igual ao da SDR pós-compra (agendou / comprou FAS / preencheu form CNPJ). Mesma decisão pendente sobre 3 conversões.

## 5. Venda FAS

- Tipo: venda direta ativa. No Funil 2, aborda leads da base de formulários classificados como perfil FAS ("Lead_2k", capital declarado de 2k a 5k).
- INPUT (alvo): handoff / carga de leads perfil FAS.
  - Mecanismo NÃO DEFINIDO: exportação da base de forms/CRM para a AWSales, ou handoff a partir do SDR. Cardoso perguntou (14/07) se os leads viriam do forms ou do CRM — ficou em aberto.
  - Nota: no Funil 1, quem vende FAS é o próprio SDR (Etapa 3B), sem handoff para esta campanha. Esta campanha é primariamente do Funil 2.
- OUTPUT (Evento de Conversão, alvo): compra do FAS na Assiny.
  - Checkout: `https://pay.assiny.com.br/a06faa/node/k4HKSV`. Com desconto: `.../1bf813/node/qKg3Pe`.
  - Depende da integração Assiny (mesma pendência da REC).
- Lado "perdido": follow-up encerra ao esgotar; se não fechar FAS, oferece CNPJ como downsell (dentro do próprio checkpoint), e só então perdido.

## 6. Venda CNPJ

- Tipo: venda direta ativa. No Funil 2, aborda leads sem capital para produto pago (ou downsell do FAS).
- INPUT (alvo): handoff / carga de leads perfil CNPJ (capital < R$ 1.500), mesma indefinição de mecanismo do item 5.
- OUTPUT (Evento de Conversão, alvo): formulário de documentos do CNPJ preenchido.
  - Formulário: `https://link.wayecom.com.br/widget/form/0XMJFpBBCLlWtDff25n7` (domínio de funil do HighLevel).
  - Como o formulário é HighLevel, o submit pode disparar um evento/automação do HighLevel → AWSales. NÃO CONFIRMADO que existe esse gatilho hoje.
  - Cardoso também citou um "webhook das compras de CNPJ realizadas na Amazon" — é outra coisa (compra real na Amazon depois), pode ser um segundo marco, não a conversão da campanha.
- "Venda" nesta campanha = preencher o formulário, não há checkout.

## Cadeia entre campanhas (encadeamento de eventos)

```
Abandonou checkout VTD ─────────────> REC de vendas VTD
                                          │ (compra VTD)
Comprou VTD (Assiny) ──┬──> [split 50%] > Onboarding VTD
                       │                     │ (assistiu 2 aulas — MemberKit)
                       │                     └──> SDR pós-aula 2
                       └──> [split 50%] ────────> SDR pós-compra
                                                     │
                              SDR (qualquer um dos 2) roteia por capital:
                                 5-10k / +10k -> agenda call (HighLevel)
                                 1.5-3k       -> vende FAS (Assiny)
                                 < 1.5k       -> oferta CNPJ (formulário)

Funil 2 (base fria de forms): carga de leads -> Venda FAS / Venda CNPJ direto.
```

## Integrações necessárias (consolidado do que falta)

1. Assiny na AWSales: eventos de (a) abandono de checkout VTD [input REC], (b) compra VTD [output REC, input Onboarding e SDR], (c) compra FAS [output Venda FAS e desfecho do SDR]. Nenhuma confirmada.
2. MemberKit: evento "assistiu 2 aulas" [output Onboarding + input SDR pós-aula 2]. Não existe; é o bloqueador da campanha 4.
3. Split 50/50 (onboarding vs SDR direto): regra de roteamento após a compra do VTD. Não definida.
4. Formulário CNPJ (HighLevel): gatilho de submit [output Venda CNPJ]. Não confirmado.
5. Tool `@mover_card_crm` + eventual evento de conversão por card (HighLevel): a construir (integração de agendamento já feita; card em standby saindo de standby).
6. Handoff/carga de leads do Funil 2 (forms/CRM → AWSales): mecanismo não definido.
7. Meta (2 números): citado pelo cliente, fora do escopo input/output das campanhas (é origem de tráfego/número de disparo).

## Pendências

- Confirmar o que a Assiny expõe de webhook (abandono e compra) e criar a credencial de integração na AWSales. Sem isso, REC, Onboarding, SDR e Venda FAS ficam sem input/output reais.
- Resolver o gatilho do MemberKit ou redefinir a campanha SDR pós-aula 2.
- Definir o mecanismo do split 50/50 pós-compra.
- Decidir como a AWSales trata as 3 conversões possíveis do SDR (evento único vs múltiplos vs card/follow-up).
- Confirmar gatilho de submit do formulário CNPJ.
- Definir a origem/handoff dos leads do Funil 2.
- Chave de casamento input↔output (lição do Tintim): garantir que input e output de cada campanha compartilhem um campo (telefone/e-mail) para a campanha encerrar de verdade. No Tintim isso foi bloqueador; conferir por campanha aqui antes de ligar.
