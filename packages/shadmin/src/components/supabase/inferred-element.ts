import {
  InferredElement as CoreInferredElement,
  type InferredType,
} from "shadmin-core";

/**
 * Extends ra-core's `InferredElement` with an optional `warning`
 * string that the guessers surface to the developer console.
 *
 * `inferElementFromType()` attaches warnings when it can guess a
 * shape but cannot fully configure a child component (e.g. an
 * `<AutocompleteInput>` referencing a resource whose record
 * representation cannot be inferred).
 */
export class InferredElement extends CoreInferredElement {
  private warning?: string;

  constructor(
    type?: InferredType,
    props?: unknown,
    children?: unknown,
    warning?: string,
  ) {
    super(type, props, children);
    this.warning = warning;
  }

  getWarning(): string | undefined {
    return this.warning;
  }
}
