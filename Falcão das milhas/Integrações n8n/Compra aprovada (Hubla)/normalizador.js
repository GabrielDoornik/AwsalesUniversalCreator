/**
 * Fluxo n8n: Falcão das Milhas | Compra aprovada (Hubla)
 * Nó: "Normaliza compra aprovada"  (tipo: Code, typeVersion 2, modo: Run Once for All Items)
 * Ordem: Webhook (compra-aprovada-asinny) -> [ESTE NÓ] -> HTTP Request AWSales
 *
 * Entrada: Hubla, evento invoice.payment_succeeded.
 * Saída: schema de transação da AWSales, event APPROVED_PURCHASE.
 * Destino: POST https://app.awsales.io/api/webhooks/organizations/
 *          a21b2ab2-e4d4-4cf4-a1af-74674b75d568/credentials/compra-aprovada-hubla
 *
 * Papel no funil: input do Onboarding 1 e output da Recuperação de Vendas 297.
 *
 * IMPORTANTE: metadata.email_compra é o que resolve a pendência do e-mail no Onboarding 1.
 * A IA referencia como {{metadata.email_compra}} e diz ao cliente com qual e-mail ele cria a conta.
 * Este é o e-mail do PAGADOR, ou seja, o e-mail de compra de verdade. Não confundir com o
 * email_compra do fluxo de primeiro acesso, que vem do flook e é o e-mail da CONTA.
 *
 * HTTP Request: Body Content Type JSON, Specify Body em Using JSON, {{ JSON.stringify($json) }}.
 * Header Accept: application/json. Autenticação None (credencial no path). Retry On Fail ligado.
 *
 * Doc do fluxo: ../README.md
 * Criado em 2026-07-28. Filtros de produto e renovação adicionados em 2026-07-30.
 */

// ==================== FLAGS ====================

const FORCE_AWSALES_SOURCE = true;   // doc da AWSales exige utm.source = "awsales" p/ contar no dashboard
const IGNORAR_SANDBOX      = false;  // true em produção

// Só deixa passar compra do Buscador Automático. A conta Hubla vende outros produtos
// (Comunidade VIP, order bumps, combos) e sem este filtro o Onboarding 1 dispara para todos.
const FILTRAR_PRODUTO = true;

// DESLIGADO de propósito. Ver payload de 30/07: a Hubla quebra o pedido em uma fatura por
// oferta, e o próprio Buscador chega como fatura filha (id terminando em "-offer-1", com
// parentInvoiceId preenchido). Ou seja, parentInvoiceId NÃO distingue renovação de compra
// nova, e ligar isto derruba compra legítima. Não religar sem um payload de renovação real.
const FILTRAR_RENOVACAO = false;

// Sobre os dois ids de produto do Buscador, para quem for mexer aqui depois:
//
// A Hubla alterna entre "D9iZv1Spo65gBqj1G6BQ" e "LrkO2DIV9UsmAiQ9uPeH" em products[].id.
// Cada id novo fez a AWSales criar um produto separado, então existem dois objetos
// "Buscador Automático" na org, ambos com as 6 ofertas cadastradas e validadas:
//   330b450a-a6c4-4f46-bcc0-7c183f96a9cb  ->  ref D9iZv1Spo65gBqj1G6BQ
//   7dcafb32-791c-4886-a13c-90c51c7fc85c  ->  ref LrkO2DIV9UsmAiQ9uPeH
//
// Se o id que chega não bate com o produto configurado no input da campanha, o evento
// responde "received" e não vira transação nem janela. Foi o que travou o Onboarding 1
// entre 29 e 30 de julho: a Hubla passou a mandar LrkO2 e a campanha apontava para D9iZv1.
//
// Solução adotada em 2026-07-30: o Onboarding 1 tem os DOIS produtos como input, então
// qualquer um dos ids casa. Por isso este nó repassa o id original, sem forçar nenhum.
// Se algum dia a campanha voltar a ter só um produto, ou a Hubla inventar um terceiro id,
// o sintoma é o mesmo: execução verde no n8n, "received" no HTTP, e nenhuma janela.

// Reconhecimento do produto. O nome da oferta é o sinal mais confiável, porque existem
// várias ofertas do mesmo produto (CONTROLE, LR-UGC, etc.) com ids diferentes.
const PRODUTO_REGEX = /buscador/i;

// Ids conhecidos do Buscador, usados como reforço quando o nome vier vazio ou mudar.
const PRODUTO_IDS = new Set([
  'LrkO2DIV9UsmAiQ9uPeH', // product id
  'D9iZv1Spo65gBqj1G6BQ', // products[0] id
  'wyBoT3CDEwBQ0zv1oTEu', // offer LR-UGC
]);

// ==================== HELPERS ====================

const money = (cents) => Number(((Number(cents) || 0) / 100).toFixed(2));

const toIsoUtc = (v) => {
  const d = new Date(v);
  return isNaN(d) ? null : d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const toE164 = (raw) => {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  if (!d.startsWith('55') && (d.length === 10 || d.length === 11)) d = '55' + d;
  return '+' + d;
};

// "JOCELIA Farias Paes" -> "Jocelia Farias Paes"
const nomeBonito = (s) =>
  String(s || '')
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 2 && w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w))
    .join(' ');

const PAY_METHOD = {
  pix: 'PIX',
  boleto: 'BOLETO',
  bank_slip: 'BOLETO',
  credit_card: 'CREDIT_CARD',
  card: 'CREDIT_CARD',
};

const SUB_TYPES = ['recurring', 'subscription'];

// Alvos de reconhecimento de um produto: id e nome dele mais os das ofertas.
const alvosDe = (p) => {
  if (!p) return [];
  const a = [String(p.id || ''), String(p.name || '')];
  for (const o of (Array.isArray(p.offers) ? p.offers : [])) {
    a.push(String(o.id || ''), String(o.name || ''));
  }
  return a;
};

const casaBuscador = (alvos) =>
  alvos.some((v) => PRODUTO_REGEX.test(v) || PRODUTO_IDS.has(v));

// O evento inteiro tem Buscador em algum lugar?
const ehBuscador = (ev) => {
  const alvos = alvosDe(ev.product);
  for (const p of (Array.isArray(ev.products) ? ev.products : [])) alvos.push(...alvosDe(p));
  return casaBuscador(alvos);
};

// ==================== PROCESSAMENTO ====================

const out = [];
const descartados = [];

for (const item of $input.all()) {
  const body    = item.json.body    || item.json;
  const headers = item.json.headers || {};
  const ev      = body.event   || {};
  const inv     = ev.invoice   || {};
  const payer   = inv.payer    || ev.user || {};

  // só compra aprovada
  if (body.type !== 'invoice.payment_succeeded' || inv.status !== 'paid') {
    descartados.push({ id: inv.id || null, motivo: 'evento nao e pagamento aprovado' });
    continue;
  }

  if (IGNORAR_SANDBOX && String(headers['x-hubla-sandbox']) === 'true') {
    descartados.push({ id: inv.id || null, motivo: 'sandbox' });
    continue;
  }

  // Renovação e demais faturas de continuação: parentInvoiceId vem preenchido.
  // Na primeira compra ele é null. Vale também para order bump, que é fatura filha.
  const ehContinuacao = Boolean(inv.parentInvoiceId);
  if (FILTRAR_RENOVACAO && ehContinuacao) {
    descartados.push({ id: inv.id || null, motivo: 'renovacao ou fatura filha', parentInvoiceId: inv.parentInvoiceId });
    continue;
  }

  // Produto errado: a conta Hubla vende Comunidade VIP, combos e order bumps.
  if (FILTRAR_PRODUTO && !ehBuscador(ev)) {
    descartados.push({ id: inv.id || null, motivo: 'produto nao e o Buscador', produto: ev.product?.name || null });
    continue;
  }

  const receivers = Array.isArray(inv.receivers) ? inv.receivers : [];
  const seller    = receivers.find((r) => r.role === 'seller') || {};

  // taxa e líquido saem dos receivers, não de cálculo
  const totalValue = money(inv.amount?.totalCents);
  const feeTotal   = money(
    receivers.filter((r) => r.role !== 'seller').reduce((s, r) => s + (Number(r.totalCents) || 0), 0)
  );
  const netTotal = seller.totalCents != null
    ? money(seller.totalCents)
    : Number((totalValue - feeTotal).toFixed(2));

  const products = Array.isArray(ev.products) && ev.products.length
    ? ev.products
    : (ev.product ? [ev.product] : []);

  // no payload real products[].price não existe; o valor vive em offers[0].amountCents,
  // e em algumas ofertas nem isso vem, então cai no subtotal da fatura
  const precoCents = (p) =>
    Number(p.price) ||
    Number(p.offers?.[0]?.amountCents) ||
    (products.length === 1 ? Number(inv.amount?.subtotalCents) : 0) ||
    0;

  const somaBruta = products.reduce((s, p) => s + precoCents(p) * (Number(p.quantity) || 1), 0) || 1;

  const items = products.map((p) => {
    const qty        = Number(p.quantity) || 1;
    const unitCents  = precoCents(p);
    const brutoCents = unitCents * qty;
    const itemTotal  = money(brutoCents);
    const itemFee    = Number((feeTotal * (brutoCents / somaBruta)).toFixed(2));
    const offer      = (Array.isArray(p.offers) && p.offers[0]) || {};

    return {
      product: {
        // repassa o id que a Hubla mandou; a campanha tem os dois produtos como input
        id: String(p.id || '').trim(),
        name: String(p.name || '').trim(),
        price: money(unitCents),
        offer: {
          id: String(offer.id || p.id || '').trim(),
          name: String(offer.name || 'Geral').trim(),
        },
      },
      quantity: qty,
      total_value: itemTotal,
      fee: itemFee,
      net_value: Number((itemTotal - itemFee).toFixed(2)),
    };
  });

  const utmOrig = inv.paymentSession?.utm || {};
  const subType = ev.subscriptions?.[0]?.type;
  const emailCompra = String(payer.email || '').trim().toLowerCase();

  out.push({
    json: {
      event: 'APPROVED_PURCHASE',
      created_at: toIsoUtc(inv.saleDate || inv.createdAt),

      user: {
        name: nomeBonito([payer.firstName, payer.lastName].filter(Boolean).join(' ')),
        email: emailCompra,
        phone: toE164(payer.phone),
      },

      producer: { name: seller.name || null },

      transaction: {
        id: String(inv.id || ''),
        type: SUB_TYPES.includes(subType) ? 'subscription' : 'one_time',
        status: 'APPROVED',
        payment_method: PAY_METHOD[String(inv.paymentMethod || '').toLowerCase()] || 'CREDIT_CARD',
        total_value: totalValue,
        fee: feeTotal,
        net_value: netTotal,
        installments: Number(inv.installments) || 1,
        cycle: ehContinuacao ? 2 : 1,
        currency: inv.currency || 'BRL',
        items,
      },

      payment_links: { pix_url: null, boleto_url: null },

      utm: {
        source: FORCE_AWSALES_SOURCE ? 'awsales' : (utmOrig.source || null),
        campaign: utmOrig.campaign || null,
        medium: utmOrig.medium || null,
        content: utmOrig.content || null,
        term: utmOrig.term || null,
      },

      // o que a IA enxerga na conversa, via {{metadata.*}}
      metadata: {
        email_compra: emailCompra, // e-mail do pagador; usado no Onboarding 1 para o primeiro acesso
        status_onboarding: 'E0',   // E0 = comprou e ainda não criou a conta
        primeira_compra: !ehContinuacao,
        produto: ev.product?.name ? String(ev.product.name).trim() : null,
        hubla_order_id: inv.orderId || null,
        hubla_subscription_id: inv.subscriptionId || null,
        hubla_parent_invoice_id: inv.parentInvoiceId || null,
        hubla_idempotency: headers['x-hubla-idempotency'] || null,
        billing_cycle_months: ev.subscriptions?.[0]?.billingCycleMonths ?? null,
        document: payer.document || null,
        sandbox: String(headers['x-hubla-sandbox']) === 'true',
        utm_source_original: utmOrig.source || null,
      },
    },
  });
}

// Deixa rastro do que foi barrado, para conferir no histórico de execuções do n8n.
if (descartados.length) console.log('Descartados:', JSON.stringify(descartados));

return out;
