import { describe, expect, it } from "vitest";
import { en } from "./en";
import { ptBR } from "./pt-BR";
import { flattenKeys, inferLanguage, translate } from "./index";

describe("inferLanguage", () => {
  it("honours a valid stored language", () => {
    expect(inferLanguage("en", "pt-BR")).toBe("en");
    expect(inferLanguage("pt-BR", "en-US")).toBe("pt-BR");
  });

  it("ignores an invalid stored language and falls back to the navigator", () => {
    expect(inferLanguage("fr", "pt-BR")).toBe("pt-BR");
    expect(inferLanguage("xx", "en-US")).toBe("en");
  });

  it("detects portuguese navigator languages case-insensitively", () => {
    expect(inferLanguage(null, "PT-br")).toBe("pt-BR");
    expect(inferLanguage(null, "pt")).toBe("pt-BR");
  });

  it("defaults to english when nothing matches", () => {
    expect(inferLanguage(null, null)).toBe("en");
    expect(inferLanguage(null, "de-DE")).toBe("en");
  });
});

describe("translate", () => {
  it("resolves dot-path keys for the requested language", () => {
    expect(translate("en", "nav.radar")).toBe("Radar");
    expect(translate("pt-BR", "nav.radar")).toBe(ptBR.nav.radar);
  });

  it("interpolates values into templates", () => {
    expect(translate("en", "common.filtersActive", { count: 3 })).toBe("active filters");
  });

  it("falls back to english when the key is missing in the target language", () => {
    expect(translate("pt-BR", "app.name")).toBe("FeedForge");
  });

  it("returns the path itself for unknown keys", () => {
    expect(translate("en", "does.not.exist")).toBe("does.not.exist");
  });
});

describe("dictionary parity", () => {
  it("pt-BR exposes exactly the same key set as en", () => {
    expect(flattenKeys(ptBR)).toEqual(flattenKeys(en));
  });

  it("has no empty translation values in either dictionary", () => {
    for (const dictionary of [en, ptBR]) {
      const stack: unknown[] = [dictionary];
      while (stack.length > 0) {
        const node = stack.pop();
        if (node && typeof node === "object") {
          stack.push(...Object.values(node as Record<string, unknown>));
        } else {
          expect(typeof node).toBe("string");
          expect((node as string).length).toBeGreaterThan(0);
        }
      }
    }
  });
});
