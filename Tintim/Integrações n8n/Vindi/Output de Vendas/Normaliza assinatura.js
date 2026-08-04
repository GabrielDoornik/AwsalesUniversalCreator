/**
 * Fluxo n8n: Tintim | Output de vendas   (webhook: integracao-vindi)
 * No: "Code in JavaScript"   <- nome DEFAULT no canvas; renomear para "Normaliza assinatura"
 * Ordem: Webhook4 (integracao-vindi) -> [ESTE NO] -> HTTP Request (output-vendas)
 *
 * O que faz: recebe o webhook de notificacao da Vindi, ignora tudo que nao for
 * subscription_created (test, bill_paid, renovacao mensal, etc.) via return [], e traduz a
 * assinatura criada para o schema de OUTPUT da AWSales (custom_action). O POST vai para a
 * credential output-vendas e encerra a participacao do lead na campanha Venda - Nao-MQL.
 *
 * Por que subscription_created e nao bill_paid: bill_paid dispara todo mes na renovacao e
 * fecharia a campanha de novo a cada fatura. subscription_created dispara uma vez, no signup.
 * Ressalva conhecida: assume checkout no cartao; com boleto a assinatura pode ser criada antes
 * de pagar.
 *
 * PENDENCIA CRITICA - lead.phone vai VAZIO. O lead entrou na Venda pelo kommo-nao-mql com
 * telefone real + e-mail mockado (<tel>@naoinformado.tintim.app), e aqui vem o e-mail REAL do
 * comprador e nenhum telefone. Ou seja: nao ha campo em comum para a AWSales casar o output com
 * o lead, e a campanha pode nao encerrar nunca. Preencher lead.phone a partir do customer da
 * Vindi (conferir no payload real se vem em customer.phones[].number ou customer.code) antes de
 * considerar o output pronto. Detalhe em ../CONFIG_OUTPUT_VINDI.md (secao "Casamento do lead").
 *
 * Doc do fluxo: ../CONFIG_OUTPUT_VINDI.md
 * Estado: conferido contra o export real do n8n em 2026-07-30.
 */
const b = $input.first().json.body || {};
const ev = b.event || {};

// so processa assinatura criada; test/bill_paid/etc. -> ignora sem erro
if (ev.type !== 'subscription_created') {
  return [];
}

const sub = (ev.data && ev.data.subscription) || {};
const cus = sub.customer || {};
const item = (sub.product_items && sub.product_items[0]) || {};

const payload = {
  event: 'custom_action',
  timestamp: ev.created_at || new Date().toISOString(),
  source: { id: 'vindi', name: 'Vindi' },
  lead: {
    phone: '',
    email: cus.email || '',
    name: cus.name || ''
  },
  metadata: {
    action_details: 'Assinatura criada na Vindi',
    plano: (sub.plan && sub.plan.name) || '',
    valor: (item.pricing_schema && item.pricing_schema.short_format) || '',
    subscription_id: String(sub.id || '')
  },
  utm: { source: 'awsales', medium: '', campaign: '', term: '', content: '' }
};

return [{ json: { bodyJson: JSON.stringify(payload) } }];
