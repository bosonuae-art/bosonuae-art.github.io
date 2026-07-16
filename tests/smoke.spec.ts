import { test, expect } from "@playwright/test";

const routes = ["/", "/portfolio", "/comp-cards", "/about", "/contact"];

for (const route of routes) {
  test(`${route} loads with hero, nav, and footer`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status(), `status for ${route}`).toBeLessThan(400);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("[data-nav] .nav__link")).toHaveCount(4);
    await expect(page.locator("footer")).toContainText("All rights reserved");
  });
}

test("home stays noindex while SITE_READY is false", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("portfolio gallery renders and the lightbox opens/closes", async ({ page }) => {
  await page.goto("/portfolio");
  const thumbs = page.locator(".gallery__btn");
  expect(await thumbs.count()).toBeGreaterThan(0);

  await thumbs.first().click();
  const lb = page.locator("[data-lightbox]");
  await expect(lb).toBeVisible();
  await expect(lb.locator("[data-lb-img]")).toHaveAttribute("src", /.+/);

  await page.keyboard.press("Escape");
  await expect(lb).toBeHidden();
});

test("portfolio category filter narrows the grid", async ({ page }) => {
  await page.goto("/portfolio");
  const total = await page.locator(".gallery__cell").count();
  await page.locator('.gallery__tab[data-filter="Conceptual"]').click();
  const visible = page.locator(".gallery__cell:not([hidden])");
  const visibleCount = await visible.count();
  expect(visibleCount).toBeGreaterThan(0);
  expect(visibleCount).toBeLessThan(total);
});

test("contact form exposes the key fields", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('form [name="name"]')).toBeVisible();
  await expect(page.locator('form [name="email"]')).toBeVisible();
  await expect(page.locator('form [name="message"]')).toBeVisible();
  await expect(page.locator('form button[type="submit"]')).toBeVisible();
});

test("comp-cards exposes downloadable files", async ({ page }) => {
  await page.goto("/comp-cards");
  const pdfLinks = page.locator('a[href$=".pdf"][download]');
  expect(await pdfLinks.count()).toBeGreaterThan(0);
});
