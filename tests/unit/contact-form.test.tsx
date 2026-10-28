import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/forms/contact-form";
import { isActivePath } from "@/components/layout/nav-links";

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), "Jordan Rivera");
  await user.type(screen.getByLabelText(/work email/i), "jordan@example.com");
  await user.selectOptions(screen.getByLabelText(/project type/i), "mvp");
  await user.type(screen.getByLabelText(/tell us about your project/i), "A booking tool for independent studios with payments.");
  await user.click(screen.getByRole("checkbox"));
}

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error summary and field errors when submitted empty, without calling the server", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<ContactForm deliveryConfigured contactEmail={null} />);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(/please fix 5 problems/i);
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute("aria-invalid", "true");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("warns up front when delivery is not configured", () => {
    render(<ContactForm deliveryConfigured={false} contactEmail={null} />);
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
  });

  it("never shows a success message when the server reports it is unconfigured", async () => {
    mockFetch(503, { status: "unconfigured" });
    const user = userEvent.setup();
    render(<ContactForm deliveryConfigured={false} contactEmail="hello@example.com" />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(await screen.findByRole("heading", { name: /has not been sent/i })).toBeInTheDocument();
    expect(screen.queryByText(/we received your inquiry/i)).not.toBeInTheDocument();
    expect((screen.getByLabelText(/your project summary/i) as HTMLTextAreaElement).value).toContain("Name: Jordan Rivera");
    expect(screen.getByRole("link", { name: /send by email/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:hello@example\.com/));
  });

  it("keeps what was typed when the visitor goes back to edit", async () => {
    mockFetch(503, { status: "unconfigured" });
    const user = userEvent.setup();
    render(<ContactForm deliveryConfigured={false} contactEmail={null} />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));
    await user.click(await screen.findByRole("button", { name: /edit details/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveValue("Jordan Rivera");
  });

  it("shows confirmation only after the server confirms delivery", async () => {
    const fetchFn = mockFetch(200, { status: "sent" });
    const user = userEvent.setup();
    render(<ContactForm deliveryConfigured contactEmail={null} />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(await screen.findByText(/we received your inquiry/i)).toBeInTheDocument();
    const body = JSON.parse(String((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.inquiry.email).toBe("jordan@example.com");
    expect(body.website).toBe("");
  });

  it("explains server errors and keeps the form", async () => {
    mockFetch(502, { status: "error" });
    const user = userEvent.setup();
    render(<ContactForm deliveryConfigured contactEmail={null} />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    await waitFor(() => expect(screen.getByText(/was not sent/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/work email/i)).toHaveValue("jordan@example.com");
  });
});

describe("isActivePath", () => {
  it("matches sections and nested pages but not the home page prefix", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/services", "/")).toBe(false);
    expect(isActivePath("/services/ai-solutions-automation", "/services")).toBe(true);
    expect(isActivePath("/work", "/services")).toBe(false);
  });
});
