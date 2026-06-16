import { WebhookIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { WebhookCreate } from "./webhook-create";
import { WebhookEdit } from "./webhook-edit";
import { WebhookList } from "./webhook-list";
import { WebhookShow } from "./webhook-show";

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
