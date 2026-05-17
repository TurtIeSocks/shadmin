/**
 * Custom ESLint rule: flags vitest `expect(<literal>).toBe(<same literal>)`
 * patterns that assert nothing about the code under test.
 *
 * Catches the placeholder pattern left behind by `expect(true).toBe(true)`
 * stub specs so the pattern cannot regress after Phase 4 of the repo cleanup.
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow tautological expect calls like expect(true).toBe(true)",
    },
    messages: {
      tautological:
        "Tautological expect: assertion compares a value with itself.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Pattern: expect(X).<matcher>(Y) where X and Y are the same literal
        if (
          node.callee.type !== "MemberExpression" ||
          node.callee.property.type !== "Identifier" ||
          !/^(toBe|toEqual|toStrictEqual)$/.test(node.callee.property.name) ||
          node.callee.object.type !== "CallExpression" ||
          node.callee.object.callee.type !== "Identifier" ||
          node.callee.object.callee.name !== "expect"
        ) {
          return;
        }
        const expectArg = node.callee.object.arguments[0];
        const matcherArg = node.arguments[0];
        if (!expectArg || !matcherArg) return;
        if (
          expectArg.type === "Literal" &&
          matcherArg.type === "Literal" &&
          expectArg.value === matcherArg.value
        ) {
          context.report({ node, messageId: "tautological" });
        }
      },
    };
  },
};
