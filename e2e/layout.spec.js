import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

test('quatro páginas cabem em 320 px e o atalho move o foco para o conteúdo', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, url] of [['home', '/'], ['list', '/servicos'], ['form', '/servicos/novo'], ['method', '/sobre']]) {
    await page.goto(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    await writeFile(info.outputPath(`axe-${name}.json`), JSON.stringify(result.violations, null, 2));
    expect(result.violations).toEqual([]);
    await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  }
  await page.goto('/servicos/novo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
});
