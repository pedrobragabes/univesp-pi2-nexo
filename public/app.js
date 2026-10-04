const cepInput = document.querySelector('[data-cep]');
const lookupButton = document.querySelector('[data-cep-lookup]');
const status = document.querySelector('[data-cep-status]');
let lookupSequence = 0;
let pendingLookup;
const addressFields = ['logradouro', 'bairro', 'cidade', 'uf'];
function addressSnapshot() {
  return addressFields.map((name) => document.querySelector(`[name="${name}"]`)?.value || '');
}

function setStatus(message, kind = '') {
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
}

function fillAddress(address) {
  const authoritativeFields = {
    logradouro: address.logradouro,
    bairro: address.bairro,
    cidade: address.cidade,
    uf: address.uf,
  };
  for (const [name, value] of Object.entries(authoritativeFields)) {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) input.value = value || '';
  }
  const complement = document.querySelector('[name="complemento"]');
  if (complement && address.complemento && !complement.value) complement.value = address.complemento;
}

async function lookupCep() {
  const cep = cepInput?.value.replace(/\D/g, '') || '';
  if (!/^\d{8}$/.test(cep)) {
    setStatus('Digite um CEP com 8 números.', 'error');
    cepInput?.focus();
    return;
  }

  const sequence = ++lookupSequence;
  pendingLookup?.abort();
  const controller = new AbortController();
  pendingLookup = controller;
  const originalAddress = JSON.stringify(addressSnapshot());
  const timer = setTimeout(() => controller.abort(), 10000);
  lookupButton.disabled = true;
  setStatus('Consultando endereço…', 'loading');
  try {
    const response = await fetch(`/api/cep/${cep}`, { headers: { accept: 'application/json' }, signal: controller.signal });
    const data = await response.json();
    if (sequence !== lookupSequence || cepInput.value.replace(/\D/g, '') !== cep) return;
    if (!response.ok) throw new Error(data.error || 'Consulta indisponível.');
    if (!data || data.cep !== cep || addressFields.some((name) => typeof data[name] !== 'string')) throw new Error('A consulta retornou um endereço inválido. Preencha manualmente ou tente novamente.');
    if (JSON.stringify(addressSnapshot()) !== originalAddress) {
      setStatus('Campos de endereço alterados durante a consulta. Sua edição foi preservada; consulte novamente para preencher.', 'error');
      return;
    }
    fillAddress(data);
    setStatus('Endereço localizado. Confira e complete os campos.', 'success');
  } catch (error) {
    if (sequence === lookupSequence) setStatus(error.name === 'AbortError' ? 'A consulta demorou demais. Preencha manualmente ou tente novamente.' : error.message, 'error');
  } finally {
    clearTimeout(timer);
    if (sequence === lookupSequence) { lookupButton.disabled = false; pendingLookup = undefined; }
  }
}

if (cepInput && lookupButton) {
  cepInput.addEventListener('input', () => {
    const digits = cepInput.value.replace(/\D/g, '').slice(0, 8);
    cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    const wasPending = Boolean(pendingLookup);
    lookupSequence++;
    pendingLookup?.abort();
    pendingLookup = undefined;
    lookupButton.disabled = false;
    setStatus(wasPending ? 'CEP alterado. Consulte novamente para preencher o endereço atual.' : '');
  });
  lookupButton.addEventListener('click', lookupCep);
}

for (const element of document.querySelectorAll('[data-reveal]')) {
  element.classList.add('is-visible');
}
