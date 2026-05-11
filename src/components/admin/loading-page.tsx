import { Loading, type LoadingProps } from "./loading";

export type LoadingPageProps = LoadingProps;

/**
 * Full-page loading indicator. Alias for `<Loading>`. Used by ra-core
 * as the `loadingPage` slot.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loadingpage/ LoadingPage documentation}
 *
 * @example
 * import { LoadingPage } from "@/components/admin/loading-page";
 *
 * const App = () => <LoadingPage />;
 */
export const LoadingPage = (props: LoadingPageProps) => <Loading {...props} />;
