const cepInput = document.querySelector('[data-cep]');
const lookupButton = document.querySelector('[data-cep-lookup]');
const status = document.querySelector('[data-cep-status]');

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

  lookupButton.disabled = true;
  setStatus('Consultando endereço…', 'loading');
  try {
    const response = await fetch(`/api/cep/${cep}`, { headers: { accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Consulta indisponível.');
    fillAddress(data);
    setStatus('Endereço localizado. Confira e complete os campos.', 'success');
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    lookupButton.disabled = false;
  }
}

if (cepInput && lookupButton) {
  cepInput.addEventListener('input', () => {
    const digits = cepInput.value.replace(/\D/g, '').slice(0, 8);
    cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setStatus('');
  });
  lookupButton.addEventListener('click', lookupCep);
}

for (const element of document.querySelectorAll('[data-reveal]')) {
  element.classList.add('is-visible');
}
