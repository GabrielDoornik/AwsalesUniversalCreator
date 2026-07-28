# Nuestra RX — explicação simples (pra leigo)

Imagina que tu vai numa farmácia comprar remédio controlado. A Nuestra RX faz a mesma coisa, mas online. Pra isso funcionar, precisa de 3 ferramentas diferentes encaixadas:

---

## 🩺 DOSABLE = O médico do funil

É como um **questionário médico online** que substitui a consulta.

**Imagine:** você entra no site, ele faz 9 perguntas tipo "qual seu peso?", "tem diabetes?", "está grávida?". Aí ele junta tudo e manda pra um médico de verdade (a **Beluga Health**) revisar e assinar a receita.

**Pensa nele como:** o **secretário do consultório** que pega os dados antes do médico te ver.

**Sem ele:** você não pode comprar remédio controlado online porque é ilegal vender sem receita.

---

## 🏪 CHECKOUT CHAMP = O dono da loja

É o **sistema da loja inteira**.

**Imagine:** depois que a receita tá pronta, o cliente cai num site que mostra preço, cartão, parcelamento. Esse site é do Checkout Champ. Ele:
- Recebe o pedido
- Guarda quem é o cliente
- Sabe quanto ele deve
- **Cobra todo mês automaticamente** (rebill)
- Oferece produtos extras no checkout (upsell)

**Pensa nele como:** o **caixa + cadastro de clientes + sistema de assinatura** tudo junto. Tipo o Netflix da empresa.

**Sem ele:** você teria que cobrar manualmente cada cliente todo mês. Impossível em escala.

---

## 💳 NMI = A maquininha de cartão

É a **maquininha invisível** que efetivamente cobra do cartão.

**Imagine:** o Checkout Champ não sabe falar com Visa/Mastercard. Ele precisa de uma "maquininha" pra fazer isso. Essa maquininha é a NMI.

**O que ela faz:**
- Pega o número do cartão
- Pergunta pro banco do cliente "esse cara tem $165 na conta?"
- Banco responde "tem"
- NMI captura o dinheiro
- Devolve "aprovado" pro Checkout Champ

**Pensa nela como:** a **maquininha de cartão digital**. Mesma coisa que a Stone/Cielo, mas online.

**Sem ela:** o Checkout Champ não consegue cobrar de ninguém.

---

## 🍔 Comparação fácil — é tipo iFood

| iFood (você conhece) | Nuestra RX |
|---|---|
| Aplicativo do iFood | **Dosable** (faz o pedido, escolhe produto) |
| Sistema interno do restaurante | **Checkout Champ** (recebe pedido, gerencia, cobra) |
| Maquininha que cobra o cartão | **NMI** (faz a cobrança acontecer) |
| O cara que entrega | **Farmácia compounding** (entrega o remédio) |

Só que na Nuestra RX tem um "médico" no meio (Beluga Health), porque é remédio controlado, não comida.

---

## 🔄 O que estamos fazendo (n8n)

Pra você ENTENDER o que cada um faz na sua operação, você criou um sistema próprio (AWSales) que precisa receber notificação cada vez que:
- alguém termina o quiz (Dosable)
- alguém compra (Checkout Champ)
- o pagamento é aprovado/recusado (NMI)

O **n8n** é o "ouvido" que escuta as 3 plataformas falarem e manda essas informações pro seu sistema central.

---

## 🔄 Fluxo completo em uma imagem

```
1. Cliente entra em nuestrarx.com (Dosable)
       ↓
2. Responde quiz de 9 perguntas em espanhol
       ↓
3. Beluga Health (médico) aprova a receita
       ↓
4. Cliente vai pro checkout (Checkout Champ)
       ↓
5. Preenche cartão → Checkout Champ chama NMI
       ↓
6. NMI conversa com banco → aprovado → cobra
       ↓
7. NMI e Checkout Champ disparam webhook (notificação)
       ↓
8. n8n recebe, normaliza, e manda pro AWSales (seu sistema)
       ↓
9. Farmácia compounding (503A/503B) prepara e envia o remédio
```

---

## 📦 O que a Nuestra RX vende, exatamente

- **Semaglutide composto** ($165/mês) — versão genérica/composta do Ozempic
- **Tirzepatide composto** ($255/mês) — versão genérica/composta do Mounjaro

Ambos são GLP-1 (medicamento pra emagrecimento). Versões "compostas" são feitas em farmácias especiais (503A/503B), não aprovadas pela FDA, mas legais por exceção regulatória.

**Público:** hispanos nos EUA (site 100% em espanhol), IMC ≥30 (obesidade) ou ≥27 com problema de saúde relacionado.
