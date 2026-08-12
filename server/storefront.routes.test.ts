import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const readProjectFile = (relativePath: string) => readFileSync(`${projectRoot}/${relativePath}`, "utf8");

describe("public storefront routes", () => {
  it("registers the essential customer-information pages as lazy routes", () => {
    const app = readProjectFile("client/src/App.tsx");

    expect(app).toContain('path="/about"');
    expect(app).toContain('path="/contact"');
    expect(app).toContain('path="/delivery&returns"');
    expect(app).toContain('path="/faq"');
    expect(app).toContain('const About = lazy');
    expect(app).toContain('const Contact = lazy');
  });

  it("keeps customer navigation and crawler entry points discoverable", () => {
    const layout = readProjectFile("client/src/components/StoreLayout.tsx");
    const robots = readProjectFile("client/public/robots.txt");
    const llms = readProjectFile("client/public/llms.txt");

    expect(layout).toContain('aria-label="التنقل الرئيسي"');
    expect(layout).toContain('href="/contact"');
    expect(layout).toContain('href="/faq"');
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin");
    expect(llms).toContain("## Public pages");
  });
});
