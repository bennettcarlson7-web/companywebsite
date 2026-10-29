import { describe, expect, it } from "vitest";
import { INQUIRY_LIMITS, inquiryFieldErrors, inquirySchema } from "@/lib/validation/project-inquiry";
import { validInquiry } from "./fixtures";

function errorsFor(input: unknown) {
  const result = inquirySchema.safeParse(input);
  return result.success ? {} : inquiryFieldErrors(result.error);
}

describe("inquirySchema (project inquiries)", () => {
  it("accepts a complete, valid inquiry", () => {
    expect(inquirySchema.safeParse(validInquiry).success).toBe(true);
  });

  it("trims whitespace and collapses newlines in single-line fields", () => {
    const result = inquirySchema.parse({ ...validInquiry, name: "  Jordan\r\nRivera  ", email: " jordan@example.com " });
    expect(result.name).toBe("Jordan Rivera");
    expect(result.email).toBe("jordan@example.com");
  });

  it("strips control characters but keeps line breaks in the description", () => {
    const result = inquirySchema.parse({ ...validInquiry, description: `First line\nSecond line\u0000\u0007 is here and long enough` });
    expect(result.description).toBe("First line\nSecond line is here and long enough");
  });

  it("treats empty optional fields as undefined", () => {
    const result = inquirySchema.parse({ ...validInquiry, company: "", budget: "", timeline: "" });
    expect(result.company).toBeUndefined();
    expect(result.budget).toBeUndefined();
    expect(result.timeline).toBeUndefined();
  });

  it("reports a friendly error for each missing required field", () => {
    const errors = errorsFor({ name: "", email: "", projectType: "", description: "", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["consent", "description", "email", "name", "projectType"]);
    expect(errors.email).toMatch(/valid email/i);
  });

  it("rejects malformed emails and unknown enum values", () => {
    expect(errorsFor({ ...validInquiry, email: "not-an-email" }).email).toBeDefined();
    expect(errorsFor({ ...validInquiry, email: "a@b" }).email).toBeDefined();
    expect(errorsFor({ ...validInquiry, projectType: "hack" }).projectType).toBeDefined();
    expect(errorsFor({ ...validInquiry, budget: "a-million" }).budget).toBeDefined();
  });

  it("enforces length limits", () => {
    expect(errorsFor({ ...validInquiry, description: "too short" }).description).toMatch(/more detail/);
    expect(errorsFor({ ...validInquiry, description: "x".repeat(INQUIRY_LIMITS.descriptionMax + 1) }).description).toMatch(/under/);
    expect(errorsFor({ ...validInquiry, name: "x".repeat(INQUIRY_LIMITS.name + 1) }).name).toBeDefined();
    expect(errorsFor({ ...validInquiry, company: "x".repeat(INQUIRY_LIMITS.company + 1) }).company).toBeDefined();
  });

  it("requires explicit consent (true, not truthy strings)", () => {
    expect(errorsFor({ ...validInquiry, consent: "on" }).consent).toBeDefined();
    expect(errorsFor({ ...validInquiry, consent: false }).consent).toBeDefined();
  });
});
