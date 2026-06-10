import { KeyIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ApiKeyCreate } from "./ApiKeyCreate";
import { ApiKeyList } from "./ApiKeyList";
import { ApiKeyShow } from "./ApiKeyShow";

export const apiKeys: ResourceProps = {
  name: "api_keys",
  list: ApiKeyList,
  create: ApiKeyCreate,
  show: ApiKeyShow,
  icon: KeyIcon,
};

export { apiKeysSeed } from "./seed";
export { ApiKeyCreate, ApiKeyList, ApiKeyShow };
