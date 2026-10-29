import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectInquiryForm } from "@/components/forms/project-inquiry-form";
import { CandidateApplicationForm } from "@/components/forms/candidate-application-form";
import { countries } from "@/lib/countries";
import { isActivePath } from "@/components/layout/nav-links";

const EMAIL = "hello@nextmadelabs.com";
const CAREERS_EMAIL = "careers@nextmadelabs.com";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fn);
  return fn;
}
const sentBody = (fn: ReturnType<typeof mockFetch>, i = 0) =>
  JSON.parse(String((fn.mock.calls[i] as unknown as [string, RequestInit])[1].body));

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => window.history.replaceState({}, "", "/"));

describe("ProjectInquiryForm", () => {
  async function fill(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^name/i), "Jordan Rivera");
    await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
    await user.selectOptions(screen.getByLabelText(/project type/i), "mvp");
    await user.type(screen.getByLabelText(/tell us about your project/i), "A booking tool for independent studios with payments.");
    await user.click(screen.getByRole("checkbox"));
  }

  it("shows an error summary when submitted empty, without calling the server", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<ProjectInquiryForm contactEmail={EMAIL} />);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/please fix 5 problems/i);
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute("aria-invalid", "true");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("shows no delivery banner and never prints the email address", () => {
    const { container } = render(<ProjectInquiryForm contactEmail={EMAIL} />);
    expect(screen.queryByText(/switched on/i)).not.toBeInTheDocument();
    expect(container.textContent).not.toContain(EMAIL);
  });

  it("never shows success when the server is unconfigured, and offers a prefilled email", async () => {
    mockFetch(503, { status: "unconfigured" });
    const user = userEvent.setup();
    render(<ProjectInquiryForm contactEmail={EMAIL} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    expect(await screen.findByRole("heading", { name: /couldn.t send your inquiry/i })).toBeInTheDocument();
    expect(screen.queryByText(/we received your inquiry/i)).not.toBeInTheDocument();
    expect((screen.getByLabelText(/your project summary/i) as HTMLTextAreaElement).value).toContain("Name: Jordan Rivera");
    const mail = screen.getByRole("link", { name: /send by email/i }).getAttribute("href")!;
    expect(mail).toMatch(/^mailto:hello@nextmadelabs\.com\?/);
    expect(decodeURIComponent(mail)).toContain("Jordan Rivera");
  });

  it("keeps what was typed when going back to edit", async () => {
    mockFetch(503, { status: "unconfigured" });
    const user = userEvent.setup();
    render(<ProjectInquiryForm contactEmail={EMAIL} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    await user.click(await screen.findByRole("button", { name: /edit details/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveValue("Jordan Rivera");
  });

  it("confirms only after the server confirms delivery, and posts to the inquiry endpoint", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<ProjectInquiryForm contactEmail={EMAIL} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    expect(await screen.findByText(/we received your inquiry/i)).toBeInTheDocument();
    expect((fetchFn.mock.calls[0] as unknown as [string])[0]).toBe("/api/inquiry");
    const body = sentBody(fetchFn);
    expect(body.payload.email).toBe("jordan@example.com");
    expect(body.website).toBe("");
    expect(body.submissionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("explains failures, keeps the form, and reuses the submission ID on retry", async () => {
    const fetchFn = mockFetch(502, { status: "error" });
    const user = userEvent.setup();
    render(<ProjectInquiryForm contactEmail={EMAIL} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    await waitFor(() => expect(screen.getByText(/was not sent/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/work email/i)).toHaveValue("jordan@example.com");
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
    expect(sentBody(fetchFn, 1).submissionId).toBe(sentBody(fetchFn, 0).submissionId);
  });
});

describe("CandidateApplicationForm", () => {
  async function fill(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^name/i), "Sam Okafor");
    await user.type(screen.getByLabelText(/^email/i), "sam@example.com");
    await user.type(screen.getByLabelText(/^phone/i), "+234 803 555 0142");
    await user.type(screen.getByLabelText(/^city/i), "Lagos");
    await user.selectOptions(screen.getByLabelText(/^country/i), "NG");
    await user.type(screen.getByLabelText(/linkedin profile/i), "https://www.linkedin.com/in/sam-okafor");
    await user.type(screen.getByLabelText(/video link/i), "https://www.loom.com/share/sam-okafor-intro");
    await user.upload(
      screen.getByLabelText(/upload your résumé/i),
      new File(["%PDF-1.4\n% test résumé\n%%EOF\n"], "Sam Okafor CV.pdf", { type: "application/pdf" }),
    );
    await user.click(screen.getByRole("checkbox"));
  }

  it("preselects the role from ?role= in the URL", () => {
    window.history.replaceState({}, "", "/careers/apply?role=talent-recruiter");
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    expect(screen.getByLabelText(/^role/i)).toHaveValue("talent-recruiter");
  });

  it("ignores unknown roles in the URL", () => {
    window.history.replaceState({}, "", "/careers/apply?role=chief-wizard");
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    expect(screen.getByLabelText(/^role/i)).toHaveValue("");
  });

  it("validates required fields and link safety before sending", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    await user.type(screen.getByLabelText(/portfolio or github/i), "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: /submit application/i }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(/role/i);
    expect(summary).toHaveTextContent(/portfolio or github/i);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("posts to the separate application endpoint and confirms only on success", async () => {
    window.history.replaceState({}, "", "/careers/apply?role=senior-software-engineer-ai-ml");
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /submit application/i }));
    expect(await screen.findByText(/we received your application/i)).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer — AI/ML")).toBeInTheDocument();
    expect((fetchFn.mock.calls[0] as unknown as [string])[0]).toBe("/api/apply");
    expect(sentBody(fetchFn).payload.role).toBe("senior-software-engineer-ai-ml");
    // The résumé file travels with the application as base64, starting with the PDF signature.
    expect(sentBody(fetchFn).payload).toMatchObject({ phone: "+234 803 555 0142", city: "Lagos", country: "NG", gender: "", ageRange: "" });
    expect(sentBody(fetchFn).payload.resume).toMatchObject({ name: "Sam Okafor CV.pdf", data: expect.stringMatching(/^JVBERi/) });
  });

  it("asks for a résumé and a video link, with the recording guidance, and no written introduction", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    expect(screen.getByText(/please record a 1–2 minute video introducing yourself/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/introduce yourself/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/video link/i)).toBeRequired();
    expect(screen.getByLabelText(/linkedin profile/i)).toBeRequired();
    for (const label of [/^phone/i, /^city/i, /^country/i]) expect(screen.getByLabelText(label)).toBeRequired();
    for (const label of [/^gender/i, /^age range/i]) {
      expect(screen.getByLabelText(label)).not.toBeRequired();
      expect(screen.getByLabelText(label)).toHaveDisplayValue("Decline to self-identify");
    }
    await user.click(screen.getByRole("button", { name: /submit application/i }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(/résumé/i);
    expect(summary).toHaveTextContent(/candidate introduction video/i);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("falls back to a role-specific prefilled email when unconfigured — no false success", async () => {
    window.history.replaceState({}, "", "/careers/apply?role=talent-recruiter");
    mockFetch(503, { status: "unconfigured" });
    const user = userEvent.setup();
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /submit application/i }));
    expect(await screen.findByRole("heading", { name: /couldn.t send your application/i })).toBeInTheDocument();
    expect(screen.queryByText(/we received your application/i)).not.toBeInTheDocument();
    const href = decodeURIComponent(screen.getByRole("link", { name: /send by email/i }).getAttribute("href")!);
    expect(href).toContain("mailto:careers@nextmadelabs.com?subject=[NextMade Careers] Talent Recruiter — Application");
  });

  it("shows a provider failure as not sent", async () => {
    mockFetch(502, { status: "error" });
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/careers/apply?role=talent-recruiter");
    render(<CandidateApplicationForm hiringEmail={CAREERS_EMAIL} countries={countries} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /submit application/i }));
    expect(await screen.findByText(/your application was not sent/i)).toBeInTheDocument();
  });
});

describe("isActivePath", () => {
  it("matches sections and nested pages but not the home page prefix", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/services", "/")).toBe(false);
    expect(isActivePath("/careers/talent-recruiter", "/careers")).toBe(true);
    expect(isActivePath("/work", "/services")).toBe(false);
  });
});
