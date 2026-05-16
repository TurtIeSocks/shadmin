import { SimpleListLoading } from "@/components/admin";

export default {
  title: "Data Display/SimpleListLoading",
};

export const Basic = () => (
  <div className="w-96">
    <SimpleListLoading />
  </div>
);

export const WithAvatar = () => (
  <div className="w-96">
    <SimpleListLoading hasLeftAvatarOrIcon hasSecondaryText />
  </div>
);

export const FullLayout = () => (
  <div className="w-96">
    <SimpleListLoading
      hasLeftAvatarOrIcon
      hasRightAvatarOrIcon
      hasSecondaryText
      hasTertiaryText
      nbFakeLines={6}
    />
  </div>
);

export const FewLines = () => (
  <div className="w-96">
    <SimpleListLoading hasSecondaryText nbFakeLines={2} />
  </div>
);
