import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createReScanningRequest } from "@/lib/actions/cfs/reScanning";

export default function ReScanningCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Re-Scanning"
      basePath="/(protected)/cfs/re-scanning"
      createRequest={createReScanningRequest}
    />
  );
}
