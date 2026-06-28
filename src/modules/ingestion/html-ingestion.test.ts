import { describe, expect, it } from "vitest";
import { parseHtmlItems } from "./html-ingestion.service";
import type { HtmlSource } from "../sources/source.schema";

const source: HtmlSource = {
  id: "html",
  name: "HTML Source",
  type: "html",
  url: "https://example.com/news",
  language: "pt-BR",
  tags: ["open source"],
  weight: 1,
  enabled: true,
  selectors: {
    item: "article",
    title: "h2",
    link: "a",
    summary: "p",
    date: "time",
    author: ".author"
  }
};

const html = `
<html><body>
  <article>
    <h2>Primeira noticia</h2>
    <a href="/posts/1">read</a>
    <p>Resumo da primeira noticia.</p>
    <time datetime="2024-05-06T10:00:00Z">ontem</time>
    <span class="author">Autor Um</span>
  </article>
  <article>
    <h2>Sem link</h2>
    <p>Resumo sem link.</p>
  </article>
</body></html>`;

describe("html ingestion", () => {
  it("extracts items via configured selectors and resolves relative links", () => {
    const items = parseHtmlItems(html, source);
    expect(items).toHaveLength(1);
    const [first] = items;
    expect(first?.title).toBe("Primeira noticia");
    expect(first?.url).toBe("https://example.com/posts/1");
    expect(first?.summary).toBe("Resumo da primeira noticia.");
    expect(first?.publishedAt).toBe("2024-05-06T10:00:00Z");
    expect(first?.author).toBe("Autor Um");
  });

  it("returns an empty array when nothing matches the item selector", () => {
    const items = parseHtmlItems("<html><body><div>no articles</div></body></html>", source);
    expect(items).toEqual([]);
  });
});
