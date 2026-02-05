import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listReScanningRequests } from "@/lib/actions/cfs/reScanning";

export default function ReScanningRequestsPage() {
  return (
    <ServiceRequestListScreen
      title="Re-Scanning"
      basePath="/(protected)/cfs/re-scanning"
      listRequests={listReScanningRequests}
    />
  );
}
