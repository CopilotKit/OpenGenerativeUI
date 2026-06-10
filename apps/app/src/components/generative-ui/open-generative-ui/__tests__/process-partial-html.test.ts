import { describe, it, expect } from "vitest";
import {
  extractCompleteStyles,
  processPartialHtml,
} from "../process-partial-html";

describe("processPartialHtml", () => {
  it("strips an incomplete trailing tag", () => {
    expect(processPartialHtml("<div>Hello</div><div cla")).toBe(
      "<div>Hello</div>"
    );
    expect(processPartialHtml("<div>Hello</div><")).toBe("<div>Hello</div>");
  });

  it("strips complete <style> blocks", () => {
    expect(
      processPartialHtml("<style>.a{color:red}</style><div>Hi</div>")
    ).toBe("<div>Hi</div>");
  });

  it("strips unterminated <style> blocks to the end of input", () => {
    expect(processPartialHtml("<div>Hi</div><style>.a{color:")).toBe(
      "<div>Hi</div>"
    );
  });

  it("strips complete <script> blocks", () => {
    expect(
      processPartialHtml('<script>alert("x")</script><div>Hi</div>')
    ).toBe("<div>Hi</div>");
  });

  it("strips unterminated <script> blocks so partial source never leaks", () => {
    expect(processPartialHtml('<div>Hi</div><script>fetch("/secr')).toBe(
      "<div>Hi</div>"
    );
  });

  it("strips complete and unterminated <head> blocks", () => {
    expect(
      processPartialHtml("<head><title>T</title></head><div>Hi</div>")
    ).toBe("<div>Hi</div>");
    expect(processPartialHtml("<head><meta charset=")).toBe("");
  });

  it("strips incomplete trailing HTML entities", () => {
    expect(processPartialHtml("<div>a &amp")).toBe("<div>a ");
    expect(processPartialHtml("<div>a &#1")).toBe("<div>a ");
    // A complete entity is preserved.
    expect(processPartialHtml("<div>a &amp; b</div>")).toBe(
      "<div>a &amp; b</div>"
    );
  });

  it("extracts body content, dropping the wrapper and anything after </body>", () => {
    expect(
      processPartialHtml(
        "<html><body class=\"x\"><div>Hi</div></body></html>"
      )
    ).toBe("<div>Hi</div>");
  });

  it("extracts streaming body content with no closing tag yet", () => {
    expect(processPartialHtml("<body><div>Hi</div><p>More</p>")).toBe(
      "<div>Hi</div><p>More</p>"
    );
  });

  it("passes content through unchanged when there is no <body>", () => {
    expect(processPartialHtml("<div>Hi</div>")).toBe("<div>Hi</div>");
  });
});

describe("extractCompleteStyles", () => {
  it("returns all complete style tags concatenated", () => {
    const html =
      "<style>.a{color:red}</style><div>x</div><style media=\"all\">.b{}</style>";
    expect(extractCompleteStyles(html)).toBe(
      "<style>.a{color:red}</style><style media=\"all\">.b{}</style>"
    );
  });

  it("ignores unterminated style blocks", () => {
    expect(extractCompleteStyles("<style>.a{color:")).toBe("");
  });

  it("returns an empty string when there are no styles", () => {
    expect(extractCompleteStyles("<div>x</div>")).toBe("");
  });
});
