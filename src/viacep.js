const CEP_PATTERN = /^\d{8}$/;

export class ViaCepError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = 'ViaCepError';
    this.code = code;
  }
}

export function normalizeCep(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return /^\d{5}-?\d{3}$/.test(trimmed) ? trimmed.replace('-', '') : '';
}

export function createViaCepClient({ fetchImpl = globalThis.fetch, timeoutMs = 4000 } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Uma implementação de fetch é obrigatória.');

  return {
    async lookup(value) {
      const cep = normalizeCep(value);
      if (!CEP_PATTERN.test(cep)) {
        throw new ViaCepError('INVALID_CEP', 'Informe um CEP com 8 dígitos.');
      }

      let response;
      try {
        response = await fetchImpl(`https://viacep.com.br/ws/${cep}/json/`, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        throw new ViaCepError('UNAVAILABLE', 'O serviço de CEP está temporariamente indisponível.', error);
      }

      if (!response.ok) {
        throw new ViaCepError('UNAVAILABLE', 'O serviço de CEP não respondeu como esperado.');
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new ViaCepError('UNAVAILABLE', 'O serviço de CEP retornou uma resposta inválida.', error);
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ViaCepError('UNAVAILABLE', 'O serviço de CEP retornou uma resposta inválida.');
      if (data.erro === true || data.erro === 'true') throw new ViaCepError('NOT_FOUND', 'CEP não encontrado.');
      const stringFields = ['logradouro', 'complemento', 'bairro', 'localidade', 'ibge'];
      if (normalizeCep(data.cep) !== cep || typeof data.localidade !== 'string' || !data.localidade.trim() ||
          typeof data.uf !== 'string' || !/^[A-Z]{2}$/.test(data.uf) ||
          stringFields.some((field) => data[field] !== undefined && typeof data[field] !== 'string')) {
        throw new ViaCepError('UNAVAILABLE', 'O serviço de CEP retornou uma resposta inválida.');
      }

      return {
        cep: normalizeCep(data.cep),
        logradouro: data.logradouro || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
        ibge: data.ibge || '',
      };
    },
  };
}
