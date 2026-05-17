import { WebhookIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { WebhookCreate } from "./WebhookCreate";
import { WebhookEdit } from "./WebhookEdit";
import { WebhookList } from "./WebhookList";
import { WebhookShow } from "./WebhookShow";

export const webhooks: ResourceProps = {
  name: "webhooks",
  list: WebhookList,
  create: WebhookCreate,
  edit: WebhookEdit,
  show: WebhookShow,
  icon: WebhookIcon,
};

export { webhooksSeed } from "./seed";
export { WebhookCreate, WebhookEdit, WebhookList, WebhookShow };
