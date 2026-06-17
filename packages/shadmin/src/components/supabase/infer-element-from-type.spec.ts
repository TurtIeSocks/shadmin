import { describe, expect, it } from "vitest";
import type { InferredTypeMap } from "shadmin-core";
import { exampleSchema } from "./__fixtures__";
import { inferElementFromType } from "./infer-element-from-type";

const fakeTypes: InferredTypeMap = {
  id: { component: () => null, representation: () => "<Id/>" },
  string: {
    component: () => null,
    representation: (p) =>
      `<String source="${(p as { source: string }).source}"/>`,
  },
  number: {
    component: () => null,
    representation: (p) =>
      `<Number source="${(p as { source: string }).source}"/>`,
  },
  date: {
    component: () => null,
    representation: (p) =>
      `<Date source="${(p as { source: string }).source}"/>`,
  },
  email: {
    component: () => null,
    representation: (p) =>
      `<Email source="${(p as { source: string }).source}"/>`,
  },
  url: {
    component: () => null,
    representation: (p) =>
      `<Url source="${(p as { source: string }).source}"/>`,
  },
  reference: {
    component: () => null,
    representation: (p, children) =>
      children && Array.isArray(children) && children.length > 0
        ? `<Ref source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}">${children.map((c) => c.getRepresentation()).join("")}</Ref>`
        : `<Ref source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}"/>`,
  },
  autocompleteInput: {
    component: () => null,
    representation: (p) =>
      `<Auto optionText="${(p as { optionText: string }).optionText}"/>`,
  },
  referenceArray: {
    component: () => null,
    representation: (p, children) =>
      children && Array.isArray(children) && children.length > 0
        ? `<RefArray source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}">${children.map((c) => c.getRepresentation()).join("")}</RefArray>`
        : `<RefArray source="${(p as { source: string; reference: string }).source}" reference="${(p as { source: string; reference: string }).reference}"/>`,
  },
  autocompleteArrayInput: {
    component: () => null,
    representation: (p) =>
      `<AutoArray optionText="${(p as { optionText: string }).optionText}"/>`,
  },
};

describe("inferElementFromType", () => {
  it("returns an id element for source=id when types has 'id'", () => {
    const el = inferElementFromType({
      name: "id",
      types: fakeTypes,
      type: "integer",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain("<Id");
  });

  it("returns an email element for source=email", () => {
    const el = inferElementFromType({
      name: "email",
      types: fakeTypes,
      type: "string",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Email source="email"');
  });

  it("returns a url element for source=website", () => {
    const el = inferElementFromType({
      name: "website",
      types: fakeTypes,
      type: "string",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Url source="website"');
  });

  it("returns a date element for timestamp formats", () => {
    const el = inferElementFromType({
      name: "created_at",
      types: fakeTypes,
      type: "string",
      format: "timestamp with time zone",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Date source="created_at"');
  });

  it("returns a number element for type=integer", () => {
    const el = inferElementFromType({
      name: "age",
      types: fakeTypes,
      type: "integer",
      schema: exampleSchema,
    });
    expect(el.getRepresentation()).toContain('<Number source="age"');
  });

  it("detects a foreign key from the description and infers a reference", () => {
    const el = inferElementFromType({
      name: "company_id",
      types: fakeTypes,
      type: "integer",
      description:
        "Note:\nThis is a Foreign Key to `companies.id`.<fk table='companies' column='id'/>",
      schema: exampleSchema,
    });
    const rep = el.getRepresentation();
    expect(rep).toContain('source="company_id"');
    expect(rep).toContain('reference="companies"');
    // 'name' field exists on companies → optionText should be 'name'
    expect(rep).toContain('optionText="name"');
  });

  it("infers a reference array from an _ids suffix", () => {
    const schemaWithTags = {
      ...exampleSchema,
      definitions: {
        ...exampleSchema.definitions,
        tags: {
          type: "object",
          properties: {
            id: { format: "bigint", type: "integer" },
            name: { format: "text", type: "string" },
          },
        },
      },
    };
    const el = inferElementFromType({
      name: "tag_ids",
      types: fakeTypes,
      type: "array",
      schema: schemaWithTags as typeof exampleSchema,
    });
    const rep = el.getRepresentation();
    expect(rep).toContain('source="tag_ids"');
    expect(rep).toContain('reference="tags"');
  });
});
