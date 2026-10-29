export const validInquiry = {
  name: "Jordan Rivera",
  email: "jordan@example.com",
  company: "Example Co",
  projectType: "mvp",
  budget: "25k-50k",
  timeline: "1-3-months",
  description: "We want to build a booking tool for independent studios with payments and reminders.",
  consent: true,
};

/** A tiny but real-looking PDF (correct leading bytes), as the form sends it: file name + base64 content. */
export const samplePdf = Buffer.from("%PDF-1.4\n% NextMade test résumé\n%%EOF\n").toString("base64");
export const sampleResume = { name: "Sam Okafor CV.pdf", data: samplePdf };

export const validApplication = {
  name: "Sam Okafor",
  email: "sam@example.com",
  phone: "+234 803 555 0142",
  city: "Lagos",
  country: "NG",
  gender: "man",
  ageRange: "25-34",
  role: "senior-software-engineer-data-engineering",
  resume: sampleResume,
  videoUrl: "https://www.loom.com/share/sam-okafor-intro",
  linkedinUrl: "https://www.linkedin.com/in/example",
  portfolioUrl: "https://github.com/example",
  consent: true,
};

export const sampleUuid = "3f2b6c1e-8d4a-4b7e-9c1a-2e5f6a7b8c9d";
