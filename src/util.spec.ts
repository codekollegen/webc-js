import { describe, it, expect } from "vitest";
import { camelize, capitalize, kebabize } from "./util";

describe("util", () => {
  it("should kebabize camelcased word correctly", () => {
    expect(kebabize("helloWorld")).toEqual("hello-world");
  });

  it("should kebabize camelcased word with capital letter correctly", () => {
    expect(kebabize("HelloWorld")).toEqual("hello-world");
  });

  it("should camelize kebabized word correctly", () => {
    expect(camelize("hello-world")).toEqual("helloWorld");
  });

  it("should capitalize word correctly", () => {
    expect(capitalize("hello")).toEqual("Hello");
  });
});
