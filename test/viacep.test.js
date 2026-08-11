import test from 'node:test';
import assert from 'node:assert/strict';
import { createViaCepClient, normalizeCep, ViaCepError } from '../src/viacep.js';

test('normalizeCep preserva apenas oito dígitos do formato esperado', () => {
  assert.equal(normalizeCep('01001-000'), '01001000');
});

test('cliente mapeia resposta oficial do ViaCEP', async () => {
  const client = createViaCepClient({ fetchImpl: async () => ({
    ok: true,
    json: async () => ({ cep: '01001-000', logradouro: 'Praça da Sé', complemento: 'lado ímpar', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP', ibge: '3550308' }),
  }) });
  const result = await client.lookup('01001-000');
  assert.deepEqual(result, { cep: '01001000', logradouro: 'Praça da Sé', complemento: 'lado ímpar', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', ibge: '3550308' });
});

test('cliente diferencia CEP inexistente de indisponibilidade', async () => {
  const missing = createViaCepClient({ fetchImpl: async () => ({ ok: true, json: async () => ({ erro: true }) }) });
  await assert.rejects(() => missing.lookup('99999999'), (error) => error instanceof ViaCepError && error.code === 'NOT_FOUND');

  const unavailable = createViaCepClient({ fetchImpl: async () => { throw new Error('network'); } });
  await assert.rejects(() => unavailable.lookup('01001000'), (error) => error instanceof ViaCepError && error.code === 'UNAVAILABLE');

  const invalidJson = createViaCepClient({ fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('invalid json'); } }) });
  await assert.rejects(() => invalidJson.lookup('01001000'), (error) => error instanceof ViaCepError && error.code === 'UNAVAILABLE');
});
