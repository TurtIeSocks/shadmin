import type { OpenAPIV2 } from "openapi-types";
import schema from "./example-schema.json";

export const exampleSchema = schema as unknown as OpenAPIV2.Document;
