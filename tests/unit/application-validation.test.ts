import { describe, expect, it } from "vitest";
import { APPLICATION_LIMITS, applicationFieldErrors, applicationSchema } from "@/lib/validation/job-application";
import { inquirySchema } from "@/lib/validation/project-inquiry";
import { samplePdf, validApplication, validInquiry } from "./fixtures";

function errorsFor(input: unknown) {
  const result = applicationSchema.safeParse(input);
  return result.success ? {} : applicationFieldErrors(result.error);
}

describe("applicationSchema (candidate applications)", () => {
  it("accepts a valid application and drops empty optional links", () => {
    const result = applicationSchema.parse(validApplication);
    expect(result.role).toBe("senior-software-engineer-data-engineering");
    expect(result.videoUrl).toBe("https://www.loom.com/share/sam-okafor-intro");
    expect(applicationSchema.parse({ ...validApplication, portfolioUrl: "" }).portfolioUrl).toBeUndefined();
    expect(result.resume).toMatchObject({ filename: "Sam Okafor CV.pdf", contentType: "application/pdf" });
  });

  it("requires name, email, LinkedIn, role, résumé, introduction video, and consent", () => {
    const errors = errorsFor({ name: "", email: "", role: "", videoUrl: "", linkedinUrl: "", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "linkedinUrl", "name", "resume", "role", "videoUrl"]);
    expect(errorsFor({ ...validApplication, linkedinUrl: "" }).linkedinUrl).toMatch(/LinkedIn profile link/);
    expect(errorsFor({ ...validApplication, videoUrl: "" }).videoUrl).toMatch(/introduction video/);
    const withoutVideo: Partial<typeof validApplication> = { ...validApplication };
    delete withoutVideo.videoUrl;
    expect(errorsFor(withoutVideo).videoUrl).toMatch(/introduction video/);
  });

  it("no longer has a written introduction field", () => {
    expect(applicationSchema.parse({ ...validApplication, introduction: "ignored" })).not.toHaveProperty("introduction");
  });

  it("accepts PDF and Word résumés, identified by their content", () => {
    const docx = Buffer.from("PK\u0003\u0004word/document.xml").toString("base64");
    const doc = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]).toString("base64");
    expect(applicationSchema.parse({ ...validApplication, resume: { name: "cv.docx", data: docx } }).resume.contentType).toMatch(/wordprocessingml/);
    expect(applicationSchema.parse({ ...validApplication, resume: { name: "cv.DOC", data: doc } }).resume.contentType).toBe("application/msword");
  });

  it("rejects résumés with the wrong type, disguised content, bad encoding, or over 3 MB", () => {
    const html = Buffer.from("<html><script>alert(1)</script>").toString("base64");
    expect(errorsFor({ ...validApplication, resume: { name: "cv.exe", data: samplePdf } }).resume).toMatch(/PDF or Word/);
    expect(errorsFor({ ...validApplication, resume: { name: "cv.pdf", data: html } }).resume).toMatch(/doesn't look like/);
    expect(errorsFor({ ...validApplication, resume: { name: "cv.pdf", data: "not base64!" } }).resume).toMatch(/couldn't read/);
    const big = "JVBERi" + "A".repeat(Math.ceil((APPLICATION_LIMITS.resumeBytes * 4) / 3) + 8);
    expect(errorsFor({ ...validApplication, resume: { name: "cv.pdf", data: big } }).resume).toMatch(/3 MB/);
  });

  it("strips path and header characters from the résumé file name", () => {
    const r = applicationSchema.parse({ ...validApplication, resume: { name: '..\\..\\evil"\r\nBcc: x.pdf', data: samplePdf } });
    expect(r.resume.filename).not.toMatch(/[\\/"\r\n]/);
    expect(r.resume.filename.endsWith(".pdf")).toBe(true);
  });

  it("only accepts the three real roles", () => {
    for (const role of ["senior-software-engineer-ai-ml", "senior-software-engineer-data-engineering", "talent-recruiter"]) {
      expect(applicationSchema.safeParse({ ...validApplication, role }).success).toBe(true);
    }
    expect(errorsFor({ ...validApplication, role: "ceo" }).role).toBeDefined();
  });

  it("rejects unsafe or malformed links", () => {
    expect(errorsFor({ ...validApplication, portfolioUrl: "javascript:alert(1)" }).portfolioUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, portfolioUrl: "http://example.com" }).portfolioUrl).toMatch(/https/);
    expect(errorsFor({ ...validApplication, videoUrl: "http://example.com/intro" }).videoUrl).toMatch(/https/);
    expect(errorsFor({ ...validApplication, videoUrl: "data:text/html,<script>" }).videoUrl).toBeDefined();
    expect(errorsFor({ ...validApplication, videoUrl: "https://user:pass@example.com/intro.mp4" }).videoUrl).toBeDefined();
    expect(applicationSchema.parse({ ...validApplication, videoUrl: "https://www.loom.com/share/abc" }).videoUrl).toBe("https://www.loom.com/share/abc");
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
