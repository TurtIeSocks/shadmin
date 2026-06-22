import { redirect } from "react-router";

/**
 * `/demo` has no page of its own — the unified sidebar already navigates to the
 * App / Components / Features zones, so a separate launcher would just duplicate
 * it and add a sidebar-less hop. Land straight in the working admin instead.
 */
export function clientLoader() {
  return redirect("/demo/app");
}

export default function DemoIndex() {
  return null;
}
