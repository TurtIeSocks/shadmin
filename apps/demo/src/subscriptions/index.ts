import { CreditCardIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { SubscriptionEdit } from "./subscription-edit";
import { SubscriptionList } from "./subscription-list";
import { SubscriptionShow } from "./subscription-show";

export const subscriptions: ResourceProps = {
  name: "subscriptions",
  list: SubscriptionList,
  edit: SubscriptionEdit,
  show: SubscriptionShow,
  icon: CreditCardIcon,
};

export { subscriptionsSeed } from "./seed";
export { SubscriptionEdit, SubscriptionList, SubscriptionShow };
