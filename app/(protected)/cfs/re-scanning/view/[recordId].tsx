import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getReScanningRequestById } from "@/lib/actions/cfs/reScanning";

export default function ReScanningViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Re-Scanning"
      basePath="/(protected)/cfs/re-scanning"
      getRequestById={getReScanningRequestById}
    />
  );
}
