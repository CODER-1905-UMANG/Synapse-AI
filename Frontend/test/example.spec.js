import { test, expect } from "@playwright/test";

// 1. Home page loads
test("Home page loads", async ({ page }) => {
  await page.goto("http://localhost:5173/", {
    waitUntil: "domcontentloaded",
  });

  await expect(page).toHaveTitle(/Synapse AI/i);

  await expect(
    page.getByRole("button", { name: "Login" })
  ).toBeVisible({
    timeout: 10000,
  });
});

// 2. Home → Auth navigation
test("Home navigates to Auth page", async ({ page }) => {
  await page.goto("http://localhost:5173/", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("button", { name: "Login" })
    .click();

  await expect(page).toHaveURL(/\/auth/, {
    timeout: 10000,
  });

  await expect(
    page.getByRole("textbox", { name: "Username" })
  ).toBeVisible({
    timeout: 10000,
  });
});

// 3. Registration flow
test("User can open registration form", async ({ page }) => {
  await page.goto("http://localhost:5173/auth", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("button", { name: "Register" })
    .click();

  await expect(
    page.getByRole("textbox", { name: "Username" })
  ).toBeVisible({
    timeout: 10000,
  });

  await expect(
    page.getByRole("textbox", { name: "Confirm Password" })
  ).toBeVisible({
    timeout: 10000,
  });

  await expect(
    page.getByRole("button", { name: "Create Account" })
  ).toBeVisible({
    timeout: 10000,
  });
});

// 4. Existing user login
test("Existing user can login", async ({ page }) => {
  const username = "playwright_test";
  const password = "Test@123456";

  await page.goto("http://localhost:5173/auth", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("textbox", { name: "Username" })
    .fill(username);

  await page
    .getByRole("textbox", {
      name: "Password",
      exact: true,
    })
    .fill(password);

  const loginSubmitButton = page
    .locator("form")
    .getByRole("button", { name: "Login" });

  await expect(loginSubmitButton).toBeVisible({
    timeout: 10000,
  });

  await loginSubmitButton.click();

  await expect(page).toHaveURL(/\/main/, {
    timeout: 10000,
  });
});

// 5. Unauthenticated user cannot access Chat
test("Unauthenticated user redirects from protected Chat route", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/main", {
    waitUntil: "domcontentloaded",
  });

  await expect(page).toHaveURL(/\/auth/, {
    timeout: 10000,
  });
});

// 6. Logged-in user can send a message
test("Logged-in user can send a message in Chat", async ({ page }) => {
  const username = "playwright_test";
  const password = "Test@123456";

  await page.goto("http://localhost:5173/auth", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("textbox", { name: "Username" })
    .fill(username);

  await page
    .getByRole("textbox", {
      name: "Password",
      exact: true,
    })
    .fill(password);

  const loginSubmitButton = page
    .locator("form")
    .getByRole("button", { name: "Login" });

  await expect(loginSubmitButton).toBeVisible({
    timeout: 10000,
  });

  await loginSubmitButton.click();

  await expect(page).toHaveURL(/\/main/, {
    timeout: 10000,
  });

  const newChatButton = page.getByRole("button", {
    name: "New Chat",
  });

  await expect(newChatButton).toBeVisible({
    timeout: 10000,
  });

  await newChatButton.click();

  const messageInput = page.getByRole("textbox", {
    name: "Message Synapse AI...",
  });

  const testMessage = "hello, introduce yourself";

  await messageInput.fill(testMessage);

  const sendButton = page.getByRole("button", {
    name: "Send message",
  });

  await expect(sendButton).toBeVisible({
    timeout: 10000,
  });

  await sendButton.click();

  await expect(
    page
      .getByRole("main")
      .getByText(testMessage, {
        exact: true,
      })
  ).toBeVisible({
    timeout: 10000,
  });
});

// 7. Logged-in user can send a message and receive AI response
test("Logged-in user can send a message and receive an AI response", async ({
  page,
}) => {
  const username = "playwright_test";
  const password = "Test@123456";

  await page.goto("http://localhost:5173/auth", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("textbox", { name: "Username" })
    .fill(username);

  await page
    .getByRole("textbox", {
      name: "Password",
      exact: true,
    })
    .fill(password);

  const loginSubmitButton = page
    .locator("form")
    .getByRole("button", { name: "Login" });

  await expect(loginSubmitButton).toBeVisible({
    timeout: 10000,
  });

  await loginSubmitButton.click();

  await expect(page).toHaveURL(/\/main/, {
    timeout: 10000,
  });

  const newChatButton = page.getByRole("button", {
    name: "New Chat",
  });

  await expect(newChatButton).toBeVisible({
    timeout: 10000,
  });

  await newChatButton.click();

  const messageInput = page.getByRole("textbox", {
    name: "Message Synapse AI...",
  });

  await expect(messageInput).toBeVisible({
    timeout: 10000,
  });

  const testMessage = "hello, introduce yourself";

  await messageInput.fill(testMessage);

  const sendButton = page.getByRole("button", {
    name: "Send message",
  });

  await expect(sendButton).toBeVisible({
    timeout: 10000,
  });

  await sendButton.click();

  await expect(
    page
      .getByRole("main")
      .getByText(testMessage, {
        exact: true,
      })
  ).toBeVisible({
    timeout: 10000,
  });

  const aiResponse = page.locator(".assistant-message");

  await expect(aiResponse.first()).toBeVisible({
    timeout: 30000,
  });

  await expect(aiResponse.first()).not.toBeEmpty({
    timeout: 30000,
  });
});

// 8. Chat conversation persists after page refresh
test("Chat conversation persists after page refresh", async ({ page }) => {
  const username = "playwright_test";
  const password = "Test@123456";

  await page.goto("http://localhost:5173/auth", {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByRole("textbox", { name: "Username" })
    .fill(username);

  await page
    .getByRole("textbox", {
      name: "Password",
      exact: true,
    })
    .fill(password);

  const loginSubmitButton = page
    .locator("form")
    .getByRole("button", { name: "Login" });

  await loginSubmitButton.click();

  await expect(page).toHaveURL(/\/main/, {
    timeout: 10000,
  });

  const newChatButton = page.getByRole("button", {
    name: "New Chat",
  });

  await expect(newChatButton).toBeVisible({
    timeout: 10000,
  });

  await newChatButton.click();

  const messageInput = page.getByRole("textbox", {
    name: "Message Synapse AI...",
  });

  const testMessage = "Explain what React is in one sentence.";

  await messageInput.fill(testMessage);

  await page
    .getByRole("button", {
      name: "Send message",
    })
    .click();

  await expect(
    page
      .getByRole("main")
      .getByText(testMessage, {
        exact: true,
      })
  ).toBeVisible({
    timeout: 10000,
  });

  const aiResponse = page.locator(".assistant-message");

  await expect(aiResponse.first()).toBeVisible({
    timeout: 30000,
  });

  await expect(aiResponse.first()).not.toBeEmpty({
    timeout: 30000,
  });

  await page.reload();

  await expect(page).toHaveURL(/\/main/, {
    timeout: 10000,
  });

  await expect(
    page
      .getByRole("main")
      .getByText(testMessage, {
        exact: true,
      })
  ).toBeVisible({
    timeout: 10000,
  });

  await expect(
    page.locator(".assistant-message").first()
  ).toBeVisible({
    timeout: 10000,
  });
});