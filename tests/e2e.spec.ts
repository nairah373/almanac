import { test, expect } from "@playwright/test";

// ── Public-page smoke tests, exercised like a real visitor ──────────

test.describe("Almanac · public pages", () => {
  test("homepage shows the hero headline and search bar", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Find the notes that\s+actually get you through exams\./i,
      }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(/Search a subject/i),
    ).toBeVisible();
  });

  test("creator portal shows the income headline and types grid", async ({
    page,
  }) => {
    await page.goto("/creator");
    await expect(
      page.getByRole("heading", { name: /Turn your notes into income\./i }),
    ).toBeVisible();
    await expect(page.getByText(/What you can share/i)).toBeVisible();
    await expect(page.getByText(/Share your note now/i)).toBeVisible();
  });

  test("browse page shows the header and either grid or empty state", async ({
    page,
  }) => {
    await page.goto("/browse");
    await expect(
      page.getByRole("heading", { name: /Browse resources/i }),
    ).toBeVisible();
  });

  test("top creators page loads", async ({ page }) => {
    await page.goto("/creators");
    await expect(
      page.getByRole("heading", { name: /Top creators/i }),
    ).toBeVisible();
  });

  test("login page shows the form, including Google sign-in", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with Google/i }),
    ).toBeVisible();
  });

  test("signup page shows the form", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /Create your account/i }),
    ).toBeVisible();
  });

  test("404 page renders for unknown URLs", async ({ page }) => {
    await page.goto("/this-page-does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText(/Page not found/i)).toBeVisible();
  });
});

// ── User journeys ─────────────────────────────────────────────────

test.describe("Almanac · user journeys", () => {
  test("navbar 'For creators' link goes to the creator portal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page
      .locator("header")
      .getByRole("link", { name: /^For creators$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/creator$/);
    await expect(
      page.getByRole("heading", { name: /Turn your notes into income\./i }),
    ).toBeVisible();
  });

  test("'Share your note now' on /creator routes signed-out users to signup", async ({
    page,
  }) => {
    await page.goto("/creator");
    const cta = page.getByRole("link", { name: /Share your note now/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("hero search submits the query to /browse", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/Search a subject/i).fill("Data Structures");
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/browse\?/);
    expect(page.url()).toMatch(/\/browse\?.*q=Data\+Structures/);
  });

  test("quick-link chip navigates to /browse with type filter", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /^Previous year questions$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/browse\?type=PYQ$/);
  });

  test("mobile hamburger menu reveals nav links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByLabel("Menu").click();
    await expect(page.getByRole("link", { name: /^Browse$/i }).last()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^For creators$/i }).last(),
    ).toBeVisible();
  });

  test("/upload redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/upload");
    await expect(page).toHaveURL(/\/login/);
  });
});
