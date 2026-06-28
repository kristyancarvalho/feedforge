import { describe, expect, it } from "vitest";
import { loadSourcesConfig } from "./source-loader";

describe("default sources.json configuration", () => {
  it("loads and validates without errors", async () => {
    const config = await loadSourcesConfig("./sources.json");
    expect(config.sources.length).toBeGreaterThan(0);
  });

  it("only enables pt-BR or en sources", async () => {
    const config = await loadSourcesConfig("./sources.json");
    const enabled = config.sources.filter((source) => source.enabled);
    for (const source of enabled) {
      expect(["pt-BR", "en"]).toContain(source.language);
    }
  });

  it("disables 9to5Linux because of its anti-bot challenge", async () => {
    const config = await loadSourcesConfig("./sources.json");
    const source = config.sources.find((entry) => entry.id === "9to5linux");
    expect(source).toBeDefined();
    expect(source?.enabled).toBe(false);
  });

  it("points Viva o Linux at its working rdf feed", async () => {
    const config = await loadSourcesConfig("./sources.json");
    const source = config.sources.find((entry) => entry.id === "vivaolinux");
    expect(source).toBeDefined();
    expect(source?.enabled).toBe(true);
    expect(source?.url).toBe("https://www.vivaolinux.com.br/index.rdf");
  });
});
