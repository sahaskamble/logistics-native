import { Redirect } from "expo-router";

export default function CfsNewOrderRedirect() {
  return (
    <Redirect
      href={{
        pathname: "/(protected)/orders/cfs/[action]",
        params: { action: "new" },
      } as any}
    />
  );
}
