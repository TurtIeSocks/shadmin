import { CreditCardIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { SubscriptionEdit } from "./SubscriptionEdit";
import { SubscriptionList } from "./SubscriptionList";
import { SubscriptionShow } from "./SubscriptionShow";

export const subscriptions: ResourceProps = {
  name: "subscriptions",
  list: SubscriptionList,
  edit: SubscriptionEdit,
  show: SubscriptionShow,
  icon: CreditCardIcon,
};

export { subscriptionsSeed } from "./seed";
export { SubscriptionEdit, SubscriptionList, SubscriptionShow };
