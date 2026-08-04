/**
 * Fluxo n8n: Tintim | Handoff Nao-MQL   (webhook: kommo-cal)
 * No: "Normaliza handoff"   (tipo: Code, typeVersion 2)
 * Ordem: Webhook3 (kommo-cal) -> [ESTE NO] -> Registra na AWSales
 *
 * O que faz: recebe { telefone, nome, resumo } que o "Filtra handoff" (fluxo tintim-kommo-card)
 * manda quando o card do lead entra em "Oferta Enviada", e traduz para o schema de INPUT da
 * AWSales (custom_action). O POST vai para a credential kommo-nao-mql, que abre a campanha
 * Venda - Nao-MQL com esse lead.
 *
 * source.id = 'sdr-nao-mql' -> e o que materializa o produto "SDR Tintim - Nao-MQL" na AWSales.
 * Nao mudar sem trocar o Produto de atuacao no painel da campanha de Venda.
 *
 * E-MAIL MOCKADO: o schema da AWSales exige email, e o nao-MQL geralmente nao informou nenhum
 * (o SDR nao coleta e-mail de quem nao vai agendar). Quando falta, este no gera
 * <telefone>@naoinformado.tintim.app. E dado sintetico entrando na plataforma, de proposito.
 * Consequencia importante: o lead entra na Venda com e-mail falso, entao o OUTPUT da Venda
 * (assinatura na Vindi, que traz o e-mail REAL do comprador) nao casa por e-mail. Ver a secao
 * "Casamento do lead" em ../Vindi/CONFIG_OUTPUT_VINDI.md.
 *
 * Doc do fluxo: ../CONFIG_HANDOFF_NAO_MQL.md
 * Estado: conferido contra o export real do n8n em 2026-07-30.
 */
const b = $input.first().json.body || {};
const dig = String(b.telefone || '').replace(/\D/g, '');

// email e obrigatorio no schema; se o lead nao tem (comum no nao-MQL), manda mockado unico por telefone
const email = (b.email && String(b.email).trim())
  ? String(b.email).trim()
  : (dig ? (dig + '@naoinformado.tintim.app') : 'naoinformado@tintim.app');

const payload = {
  event: 'custom_action',
  timestamp: new Date().toISOString(),
  source: { id: 'sdr-nao-mql', name: 'SDR Tintim - Nao-MQL' },
  lead: {
    phone: dig ? ('+' + dig) : '',
    email: email,
    name: b.nome || 'Lead WhatsApp'
  },
  utm: { source: 'awsales' },
  metadata: {
    action_details: 'Lead classificado como nao-MQL no SDR, encaminhado para a IA de vendas.',
    intent_level: 'interested',
    context_notes: b.resumo || ''
  }
};

return [{ json: { bodyJson: JSON.stringify(payload) } }];
