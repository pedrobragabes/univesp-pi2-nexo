import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';
import { ViaCepError } from '../src/viacep.js';

const viaCep = {
  async lookup(cep) {
    if (!/^\d{8}$/.test(cep)) throw new ViaCepError('INVALID_CEP', 'Informe um CEP com 8 dígitos.');
    if (cep === '99999999') throw new ViaCepError('NOT_FOUND', 'CEP não encontrado.');
    return { cep, logradouro: 'Praça da Sé', complemento: '', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', ibge: '3550308' };
  },
};

async function withServer(run, { seed = false } = {}) {
  const database = createDatabase({ filename: ':memory:', seed });
  const server = createApp({ database, viaCep }).listen(0);
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try { await run({ baseUrl, database }); }
  finally { await new Promise((resolve) => server.close(resolve)); database.close(); }
}

test('health check confirma disponibilidade do servico', () => withServer(async ({ baseUrl }) => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'nexo' });
}));

test('página inicial expõe o propósito e indicadores', () => withServer(async ({ baseUrl }) => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /O que você procura pode estar/);
  assert.match(html, /0<\/strong><span>serviços/);
}));

test('cadastro válido persiste serviço não verificado', () => withServer(async ({ baseUrl, database }) => {
  const body = new URLSearchParams({
    nome: 'Oficina Comunitária Central',
    descricao: 'Espaço comunitário que oferece oficinas básicas de manutenção e reaproveitamento.',
    categoria: 'Educação', cep: '01001000', logradouro: 'Praça da Sé', numero: '10', complemento: '',
    bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', telefone: '', site: 'https://example.com',
    horario: 'Segunda a sexta, das 9h às 17h', acessibilidade: 'Entrada em nível.', fonte: 'Entrevista de demonstração',
  });
  const response = await fetch(`${baseUrl}/servicos`, { method: 'POST', body, redirect: 'manual' });
  assert.equal(response.status, 302);
  const item = database.list()[0];
  assert.equal(item.nome, 'Oficina Comunitária Central');
  assert.equal(item.verificado, 0);
}));

test('validação rejeita cadastro incompleto', () => withServer(async ({ baseUrl, database }) => {
  const response = await fetch(`${baseUrl}/servicos`, { method: 'POST', body: new URLSearchParams({ nome: 'X' }) });
  assert.equal(response.status, 422);
  assert.match(await response.text(), /Revise os campos/);
  assert.equal(database.indicators().total, 0);
}));

test('escrita iniciada por outro site é bloqueada', () => withServer(async ({ baseUrl, database }) => {
  const response = await fetch(`${baseUrl}/servicos`, {
    method: 'POST',
    headers: { 'sec-fetch-site': 'cross-site' },
    body: new URLSearchParams({ nome: 'Cadastro externo indevido' }),
  });
  assert.equal(response.status, 403);
  assert.equal(database.indicators().total, 0);
}));

test('respostas incluem cabeçalhos defensivos', () => withServer(async ({ baseUrl }) => {
  const response = await fetch(baseUrl);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
}));

test('busca e API própria filtram o catálogo', () => withServer(async ({ baseUrl }) => {
  const page = await fetch(`${baseUrl}/servicos?busca=Biblioteca`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Biblioteca Comunitária/);

  const api = await fetch(`${baseUrl}/api/servicos?categoria=Educa%C3%A7%C3%A3o`);
  assert.equal(api.status, 200);
  const data = await api.json();
  assert.equal(data.items.length, 1);
  assert.equal(data.items[0].categoria, 'Educação');
}, { seed: true }));

test('proxy de CEP valida formato, sucesso e ausência', () => withServer(async ({ baseUrl }) => {
  const invalid = await fetch(`${baseUrl}/api/cep/123`);
  assert.equal(invalid.status, 400);

  const found = await fetch(`${baseUrl}/api/cep/01001000`);
  assert.equal(found.status, 200);
  assert.equal((await found.json()).cidade, 'São Paulo');

  const missing = await fetch(`${baseUrl}/api/cep/99999999`);
  assert.equal(missing.status, 404);
}));
