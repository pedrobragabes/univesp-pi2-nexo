import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

async function fill(page) {
  await page.getByLabel('Nome do serviço ou iniciativa').fill('Serviço sintético <em>de teste</em>');
  await page.getByLabel('Descrição', { exact: true }).fill('Descrição sintética suficiente para testar o formulário local.');
  await page.getByLabel('Categoria', { exact: true }).selectOption('Educação');
  await page.getByLabel('CEP', { exact: true }).fill('01001-000');
  await page.getByLabel('Logradouro').fill('Rua preenchida manualmente');
  await page.getByLabel('Bairro').fill('Bairro de teste');
  await page.getByLabel('Cidade').fill('Cidade de teste');
  await page.getByLabel('UF', { exact: true }).fill('SP');
  await page.getByLabel('Horário de funcionamento').fill('Horário sintético de demonstração');
  await page.getByLabel('Origem das informações').fill('Fixture sintética, sem pesquisa de campo');
}

test('CEP válido preenche endereço e preserva complemento digitado', async ({ page }) => {
  await page.goto('/servicos/novo');
  await page.getByLabel('Complemento').fill('Complemento manual');
  await page.getByLabel('CEP', { exact: true }).fill('01001-000');
  await page.getByRole('button', { name: 'Consultar', exact: true }).click();
  await expect(page.locator('[data-cep-status]')).toContainText('Endereço localizado');
  await expect(page.getByLabel('Logradouro')).toHaveValue('Rua sintética');
  await expect(page.getByLabel('Complemento')).toHaveValue('Complemento manual');
});

test('resposta atrasada não aplica endereço depois de trocar o CEP', async ({ page }) => {
  let release, received;
  const gate = new Promise((resolve) => { release = resolve; });
  const requestReceived = new Promise((resolve) => { received = resolve; });
  // Simula transporte que entrega o resultado apesar do cancelamento.
  await page.addInitScript(() => {
    const original = window.fetch;
    window.fetch = async (url, options) => {
      const { signal, ...rest } = options || {};
      const response = await original(url, rest);
      const json = response.json.bind(response);
      response.json = async () => { const body = await json(); window.cepBodyRead = true; return body; };
      return response;
    };
  });
  await page.route('**/api/cep/01001000', async (route) => {
    received(); await gate;
    await route.fulfill({ json: { cep: '01001000', logradouro: 'Endereço antigo', bairro: 'Antigo', cidade: 'Cidade antiga', uf: 'SP' } });
  });
  try {
    await page.goto('/servicos/novo');
    await page.getByLabel('Logradouro').fill('Endereço manual preservado');
    await page.getByLabel('CEP', { exact: true }).fill('01001-000');
    await page.getByRole('button', { name: 'Consultar', exact: true }).click();
    await requestReceived;
    await page.getByLabel('CEP', { exact: true }).fill('13010-000');
    release();
    await page.waitForFunction(() => window.cepBodyRead);
    await expect(page.getByLabel('CEP', { exact: true })).toHaveValue('13010-000');
    await expect(page.getByLabel('Logradouro')).toHaveValue('Endereço manual preservado');
    await expect(page.locator('[data-cep-status]')).toContainText('CEP alterado');
    await expect(page.getByRole('button', { name: 'Consultar', exact: true })).toBeEnabled();
  } finally { release(); }
});

test('edição manual durante consulta não é sobrescrita pela resposta', async ({ page }) => {
  let release, received;
  const gate = new Promise((resolve) => { release = resolve; });
  const requestReceived = new Promise((resolve) => { received = resolve; });
  await page.route('**/api/cep/01001000', async (route) => {
    received(); await gate;
    await route.fulfill({ json: { cep: '01001000', logradouro: 'Endereço da consulta', bairro: 'Bairro', cidade: 'Cidade', uf: 'SP' } });
  });
  try {
    await page.goto('/servicos/novo');
    await page.getByLabel('CEP', { exact: true }).fill('01001-000');
    await page.getByRole('button', { name: 'Consultar', exact: true }).click();
    await requestReceived;
    await page.getByLabel('Logradouro').fill('Nova edição manual');
    release();
    await expect(page.locator('[data-cep-status]')).toContainText('Campos de endereço alterados');
    await expect(page.getByLabel('Logradouro')).toHaveValue('Nova edição manual');
  } finally { release(); }
});

test('falha externa preserva campos e permite envio manual escapado', async ({ page }) => {
  await page.route('**/api/cep/*', (route) => route.fulfill({ status: 503, json: { error: 'Consulta indisponível.' } }));
  await page.goto('/servicos/novo');
  await fill(page);
  await page.getByRole('button', { name: 'Consultar', exact: true }).click();
  await expect(page.locator('[data-cep-status]')).toContainText('Consulta indisponível');
  await expect(page.getByLabel('Logradouro')).toHaveValue('Rua preenchida manualmente');
  await page.getByRole('button', { name: 'Enviar para o catálogo' }).click();
  await expect(page).toHaveURL(/\/servicos\/\d+\?enviado=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Serviço sintético <em>de teste</em>');
  await expect(page.locator('h1 em')).toHaveCount(0);
  await expect(page.getByText('Não verificado', { exact: true })).toBeVisible();
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('conteúdo continua visível e cadastro funciona', async ({ page }, info) => {
    await page.goto('/');
    await expect(page.locator('.hero [data-reveal]').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.service-card').first()).toHaveCSS('opacity', '1');
    await page.goto('/servicos/novo');
    await fill(page);
    await page.screenshot({ path: info.outputPath('form-no-javascript.png'), fullPage: true });
    await page.getByRole('button', { name: 'Enviar para o catálogo' }).click();
    await expect(page).toHaveURL(/\/servicos\/\d+\?enviado=1$/);
    await expect(page.getByText('Sugestão registrada.', { exact: true })).toBeVisible();
  });
});
