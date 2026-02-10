import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseReScanningRequests } from "@/lib/actions/warehouse/reScanning";

export default function WarehouseReScanningListPage() {
  return (
    <ServiceRequestListScreen
      title="Re-Scanning"
      basePath="/(protected)/warehouse/re-scanning"
      listRequests={listWarehouseReScanningRequests}
    />
  );
}
