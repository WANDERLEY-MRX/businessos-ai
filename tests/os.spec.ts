import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function seedAndGo(page: import('@playwright/test').Page) {
  // Navigate to app first so localStorage is accessible, then wait for initializeStore to finish
  await page.goto(BASE_URL + '/os');
  await page.waitForLoadState('networkidle');
  // Now overwrite localStorage with our test data
  await page.evaluate(() => {
    localStorage.clear();
    const now = new Date().toISOString();
    const products = [
      { id: 'p1', name: 'Fone Bluetooth', price: 79.9, cost: 40, stock: 10, minStock: 2, barcode: '1001', active: true, createdAt: now, updatedAt: now },
    ];
    const customers = [
      { id: 'c1', name: 'Joao Silva', phone: '11999990000', email: 'joao@test.com', cpf: '12345678901', address: 'Rua A, 123', city: 'SP', state: 'SP', notes: '', createdAt: now, updatedAt: now },
      { id: 'c2', name: 'Maria Santos', phone: '11988887777', email: 'maria@test.com', cpf: '', address: '', city: '', state: '', notes: '', createdAt: now, updatedAt: now },
    ];
    const settings = {
      store: { name: 'TechFix', logo: '', address: 'Rua X', phone: '1133334444', cnpj: '12345678000190', city: 'Sao Paulo', state: 'SP', hours: '9h-18h' },
      receipt: { showLogo: false, showCNPJ: true, showAddress: true, thankYouMessage: 'Obrigado!', terms: '', footerText: '', format: 'Termica' },
      os: { showLogo: false, showFiscalData: true, defaultMessage: '', validityDays: 30, autoNumber: true },
      rules: { paymentMethods: ['dinheiro', 'credito', 'debito', 'pix'], allowCredit: true, creditLimit: 500, requireCPF: false, printAfterSale: false },
      print: { paperWidth: 80, fontSize: 12, showBarcode: false, showQRCode: false, copies: 1 },
    };
    localStorage.setItem('businessos_products', JSON.stringify(products));
    localStorage.setItem('businessos_customers', JSON.stringify(customers));
    localStorage.setItem('businessos_sales', JSON.stringify([]));
    localStorage.setItem('businessos_service_orders', JSON.stringify([]));
    localStorage.setItem('businessos_financial', JSON.stringify([]));
    localStorage.setItem('businessos_settings', JSON.stringify(settings));
    localStorage.setItem('businessos_counters', JSON.stringify({ os: 0, sale: 0 }));
  });
  // Reload so the page picks up our seeded data
  await page.reload();
  await page.waitForLoadState('networkidle');
}

const main = (page: import('@playwright/test').Page) => page.locator('main');

async function selectCustomer(page: import('@playwright/test').Page, name: string) {
  const searchInput = page.locator('input[placeholder*="Buscar cliente"]');
  await searchInput.fill(name);
  const dropdown = page.locator('.absolute.z-10.mt-1');
  await expect(dropdown).toBeVisible({ timeout: 5000 });
  await dropdown.locator(`button:has-text("${name}")`).click();
}

async function createOS(page: import('@playwright/test').Page, customerName: string, brand: string, model: string, defect: string) {
  await main(page).getByRole('link', { name: 'Nova OS' }).click();
  await expect(page).toHaveURL(/\/os\/nova/);
  await selectCustomer(page, customerName);
  await page.fill('input[placeholder*="Samsung"]', brand);
  await page.fill('input[placeholder*="Galaxy"]', model);
  await page.fill('textarea[placeholder*="defeito"]', defect);
  await page.click('button:has-text("Salvar OS")');
  await expect(page).toHaveURL(/\/os$/);
}

test.describe('OS Module', () => {
  test.beforeEach(async ({ page }) => {
    await seedAndGo(page);
  });

  test('OS list loads with status tabs', async ({ page }) => {
    await expect(main(page).getByRole('heading', { name: 'Ordens de Serviço' })).toBeVisible();
    await expect(main(page).getByRole('button', { name: 'Todos' })).toBeVisible();
    await expect(main(page).getByRole('button', { name: 'Aberto' })).toBeVisible();
    await expect(main(page).getByRole('button', { name: 'Em Andamento' })).toBeVisible();
    await expect(main(page).getByRole('link', { name: 'Nova OS' })).toBeVisible();
  });

  test('create a new OS and see it in list', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Samsung', 'Galaxy S24', 'Tela quebrada');
    await expect(main(page).getByText('Joao Silva')).toBeVisible();
    await expect(main(page).getByRole('table').getByText('Aberto')).toBeVisible();
  });

  test('filter OS by status', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Apple', 'iPhone 15', 'Bateria viciada');

    await main(page).getByRole('button', { name: 'Aberto' }).click();
    await expect(main(page).getByText('Joao Silva')).toBeVisible();

    await main(page).getByRole('button', { name: 'Em Andamento' }).click();
    await expect(main(page).getByText('Nenhuma ordem de serviço encontrada')).toBeVisible();

    await main(page).getByRole('button', { name: 'Todos' }).click();
    await expect(main(page).getByText('Joao Silva')).toBeVisible();
  });

  test('OS status transitions: aberto -> em_andamento -> concluido -> entregue', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Dell', 'Inspiron 15', 'Nao liga');

    const editBtn = main(page).locator('tr:has-text("Joao Silva") button').first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/os\/detalhe/);

    await expect(main(page).getByText('Aberto').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Iniciar Atendimento' }).click();
    await expect(main(page).getByText('Em Andamento').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Concluir' }).click();
    await expect(main(page).getByText('Concluido').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Entregar' }).click();
    await expect(main(page).getByText('Entregue').first()).toBeVisible();

    await expect(main(page).getByRole('button', { name: /Iniciar|Concluir|Entregar/ })).toHaveCount(0);
  });

  test('OS aguardando_peca transition', async ({ page }) => {
    await createOS(page, 'Maria Santos', 'Apple', 'MacBook Pro', 'Teclado com defeito');

    const editBtn = main(page).locator('tr:has-text("Maria Santos") button').first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/os\/detalhe/);

    await main(page).getByRole('button', { name: 'Iniciar Atendimento' }).click();
    await expect(main(page).getByText('Em Andamento').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Aguardando Peca' }).click();
    await expect(main(page).getByText('Aguardando Peca').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Retomar' }).click();
    await expect(main(page).getByText('Em Andamento').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Aguardando Peca' }).click();
    await expect(main(page).getByText('Aguardando Peca').first()).toBeVisible();

    await main(page).getByRole('button', { name: 'Concluir' }).click();
    await expect(main(page).getByText('Concluido').first()).toBeVisible();
  });

  test('edit OS device details', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Samsung', 'Galaxy S23', 'Camera com defeito');

    const editBtn = main(page).locator('tr:has-text("Joao Silva") button').first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/os\/detalhe/);

    await main(page).getByRole('button', { name: 'Editar' }).click();
    await expect(main(page).getByText('Editar Dispositivo')).toBeVisible();

    const brandInput = main(page).locator('input').nth(1);
    const modelInput = main(page).locator('input').nth(2);
    await brandInput.clear();
    await brandInput.fill('Samsung');
    await modelInput.clear();
    await modelInput.fill('Galaxy S24 Ultra');

    await main(page).getByRole('button', { name: 'Salvar' }).click();

    await expect(main(page).getByText('Samsung').nth(0)).toBeVisible();
    await expect(main(page).getByText('Galaxy S24 Ultra')).toBeVisible();
  });

  test('delete an OS', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'HP', 'Pavilion', 'Tela azul');

    const deleteBtn = main(page).locator('tr:has-text("Joao Silva") button').last();
    await deleteBtn.click();

    await expect(page.getByText('Excluir Ordem de Serviço')).toBeVisible();
    await page.click('button:has-text("Excluir")');

    await expect(main(page).getByText('Nenhuma ordem de serviço encontrada')).toBeVisible();
  });

  test('search OS by customer name', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Test', 'Device Joao', 'Defeito Joao');
    await createOS(page, 'Maria Santos', 'Test', 'Device Maria', 'Defeito Maria');

    await main(page).locator('input[placeholder*="Buscar por nº OS"]').fill('Joao');
    await expect(main(page).getByText('Joao Silva')).toBeVisible();
    await expect(main(page).getByText('Maria Santos')).toHaveCount(0);

    await main(page).locator('input[placeholder*="Buscar por nº OS"]').fill('Maria');
    await expect(main(page).getByText('Maria Santos')).toBeVisible();
    await expect(main(page).getByText('Joao Silva')).toHaveCount(0);
  });

  test('OS history shows all status transitions', async ({ page }) => {
    await createOS(page, 'Joao Silva', 'Lenovo', 'ThinkPad', 'SSD com defeito');

    const editBtn = main(page).locator('tr:has-text("Joao Silva") button').first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/os\/detalhe/);

    await main(page).getByRole('button', { name: 'Iniciar Atendimento' }).click();
    await page.waitForTimeout(200);
    await main(page).getByRole('button', { name: 'Concluir' }).click();
    await page.waitForTimeout(200);
    await main(page).getByRole('button', { name: 'Entregar' }).click();
    await page.waitForTimeout(200);

    const historyEntries = main(page).locator('.flex.gap-3');
    await expect(historyEntries).toHaveCount(4);
  });
});
