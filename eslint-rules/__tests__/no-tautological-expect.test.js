import { RuleTester } from "eslint";
import rule from "../no-tautological-expect.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

ruleTester.run("no-tautological-expect", rule, {
  valid: [
    { code: "expect(actual).toBe(expected)" },
    { code: "expect(true).toBe(false)" },
    { code: "expect(getByText('Hello')).toBeInTheDocument()" },
    { code: "expect(result).toEqual({ a: 1 })" },
  ],
  invalid: [
    {
      code: "expect(true).toBe(true)",
      errors: [{ messageId: "tautological" }],
    },
    {
      code: "expect(1).toBe(1)",
      errors: [{ messageId: "tautological" }],
    },
    {
      code: 'expect("x").toBe("x")',
      errors: [{ messageId: "tautological" }],
    },
    {
      code: "expect(false).toEqual(false)",
      errors: [{ messageId: "tautological" }],
    },
  ],
});

console.log("All rule tests passed.");
