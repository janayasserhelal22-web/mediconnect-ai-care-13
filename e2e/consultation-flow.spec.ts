import { expect, test } from "@playwright/test";

/**
 * End-to-end test of the Connect Care consultation journey:
 *   1. Landing page → start consultation
 *   2. Complete the AI chat intake (multi-turn)
 *   3. Finish consultation → AI summary generation
 *   4. Verify the structured summary renders on /summary
 *
 * The chat and summary both hit the Lovable AI Gateway. The dev server
 * must have LOVABLE_API_KEY configured. The chat endpoint streams; we wait
 * for the assistant bubble to settle before sending the next reply.
 */

const PATIENT_REPLIES = [
  "I've had a dull throbbing headache on the right side of my head for the past 3 days.",
  "It's about a 7 out of 10 in severity. Light makes it worse and I feel nauseous.",
  "No fever, no recent injury. I've been sleeping poorly and staring at screens a lot.",
  "Ibuprofen helped briefly but the pain comes back within a couple of hours.",
];

test.describe("Connect Care consultation flow", () => {
  test("patient completes intake and clinical summary renders", async ({ page }) => {
    // --- 1. Landing page ---
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/healthcare/i);

    await Promise.all([
      page.waitForURL("**/consultation"),
      page.getByRole("link", { name: /begin symptom check/i }).first().click(),
    ]);

    // --- 2. Chat intake ---
    await expect(page.getByText(/Clinical Intake Assistant/i)).toBeVisible();
    // Welcome message rendered.
    await expect(
      page.getByText(/help prepare your case for the doctor/i),
    ).toBeVisible();

    const composer = page.getByPlaceholder("Type your response...");
    const sendBtn = page.getByRole("button", { name: "Send" });
    const finishBtn = page.getByRole("button", { name: /finish consultation/i });

    await expect(finishBtn).toBeDisabled();

    for (let i = 0; i < PATIENT_REPLIES.length; i++) {
      const reply = PATIENT_REPLIES[i];
      await composer.click();
      await composer.fill(reply);
      // Submit via Enter — the form handles Enter (no shift) → submit.
      await composer.press("Enter");

      // Patient bubble appears.
      await expect(page.getByText(reply, { exact: false }).first()).toBeVisible();

      // Wait for streaming to finish: composer re-enables.
      await expect(composer).toBeEnabled({ timeout: 60_000 });

      // Reply counter increments.
      const expected = `${i + 1} ${i + 1 === 1 ? "reply" : "replies"}`;
      await expect(page.getByText(expected)).toBeVisible();
    }
    void sendBtn; // selector retained for documentation

    // --- 3. Finish consultation → triggers summary generation ---
    await expect(finishBtn).toBeEnabled();
    await finishBtn.click();
    // Summary generation runs server-side and can take a while.
    await page.waitForURL("**/summary", { timeout: 120_000 });

    // --- 4. Verify summary page ---
    await expect(
      page.getByRole("heading", { name: /consultation summary/i }),
    ).toBeVisible();
    await expect(page.getByText(/Clinician View/i)).toBeVisible();
    await expect(page.getByText(/Ready for review/i)).toBeVisible();

    // Section labels.
    for (const label of [
      "Chief Complaint",
      "Clinical Narrative",
      "Duration",
      "Severity",
      "Flagged Symptoms",
      "Recommended Specialty",
      "Risk Level",
    ]) {
      await expect(
        page.getByRole("heading", { name: new RegExp(`^${label}$`, "i") }),
      ).toBeVisible();
    }

    // Case ID present.
    await expect(page.getByText(/Case CC-\d{6}/)).toBeVisible();

    // Risk level is one of the three allowed buckets.
    const summaryText = await page.locator("main").innerText();
    expect(summaryText).toMatch(/\b(High|Moderate|Low)\b/);

    // Summary persists in localStorage (the source of truth for /summary).
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("connectcare:lastSummary"),
    );
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.summary).toMatchObject({
      chiefComplaint: expect.any(String),
      duration: expect.any(String),
      severity: expect.any(String),
      clinicalNotes: expect.any(String),
      recommendedSpecialty: expect.any(String),
      riskLevel: expect.stringMatching(/^(High|Moderate|Low)$/),
      symptoms: expect.any(Array),
    });
    expect(parsed.summary.chiefComplaint.length).toBeGreaterThan(0);
    expect(parsed.summary.clinicalNotes.length).toBeGreaterThan(20);
  });

  test("summary page shows empty state when no consultation has been completed", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.goto("/summary");

    await expect(
      page.getByRole("heading", { name: /no consultation yet/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start a consultation/i }),
    ).toBeVisible();
  });
});
