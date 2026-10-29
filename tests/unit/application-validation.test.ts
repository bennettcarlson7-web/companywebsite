import { describe, expect, it } from "vitest";
import { APPLICATION_LIMITS, applicationFieldErrors, applicationSchema } from "@/lib/validation/job-application";
import { inquirySchema } from "@/lib/validation/project-inquiry";
import { validApplication, validInquiry } from "./fixtures";

function errorsFor(input: unknown) {
  const result = applicationSchema.safeParse(input);
  return result.success ? {} : applicationFieldErrors(result.error);
}

describe("applicationSchema (candidate applications)", () => {
  it("accepts a valid application and drops empty optional links", () => {
    const result = applicationSchema.parse(validApplication);
    expect(result.role).toBe("senior-software-engineer-data-engineering");
    expect(result.resumeUrl).toBeUndefined();
  });

  it("requires name, email, role, introduction, and consent", () => {
    const errors = errorsFor({ name: "", email: "", role: "", introduction: "", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "introduction", "name", "role"]);
  });

  it("only accepts the three real roles", () => {
    for (const role of ["senior-software-engineer-ai-ml", "senior-software-engineer-data-engineering", "talent-recruiter"]) {
      expect(applicationSchema.safeParse({ ...validApplication, role }).success).toBe(true);
    }
    expect(errorsFor({ ...validApplication, role: "ceo" }).role).toBeDefined();
  });

  it("enforces introduction length", () => {
    expect(errorsFor({ ...validApplication, introduction: "Hi, hire me." }).introduction).toMatch(/a little more/);
    expect(errorsFor({ ...validApplication, introduction: "x".repeat(APPLICATION_LIMITS.introMax + 1) }).introduction).toMatch(/under/);
  });

  it("rejects unsafe or malformed links", () => {
    expect(errorsFor({ ...validApplication, portfolioUrl: "javascript:alert(1)" }).portfolioUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, portfolioUrl: "http://example.com" }).portfolioUrl).toMatch(/https/);
    expect(errorsFor({ ...validApplication, resumeUrl: "data:text/html,<script>" }).resumeUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, resumeUrl: "https://user:pass@example.com/cv.pdf" }).resumeUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, portfolioUrl: "https://localhost" }).portfolioUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, portfolioUrl: `https://example.com/${"a".repeat(400)}` }).portfolioUrl).toBeDefined();
  });

  it("requires LinkedIn links to point at linkedin.com", () => {
    expect(errorsFor({ ...validApplication, linkedinUrl: "https://linkedin.com.evil.example/in/x" }).linkedinUrl).toMatch(/linkedin\.com/);
    expect(applicationSchema.safeParse({ ...validApplication, linkedinUrl: "https://linkedin.com/in/x" }).success).toBe(true);
  });

  it("keeps the two tracks separate: neither schema accepts the other's payload", () => {
    expect(applicationSchema.safeParse(validInquiry).success).toBe(false);
    expect(inquirySchema.safeParse(validApplication).success).toBe(false);
  });
});
