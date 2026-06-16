import { KeyIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ApiKeyCreate } from "./api-key-create";
import { ApiKeyList } from "./api-key-list";
import { ApiKeyShow } from "./api-key-show";

export const apiKeys: ResourceProps = {
  name: "api_keys",
  list: ApiKeyList,
  create: ApiKeyCreate,
  show: ApiKeyShow,
  icon: KeyIcon,
};

export { apiKeysSeed } from "./seed";
export { ApiKeyCreate, ApiKeyList, ApiKeyShow };
