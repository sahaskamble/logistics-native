import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseReScanningRequestById } from "@/lib/actions/warehouse/reScanning";

export default function WarehouseReScanningViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Re-Scanning"
      basePath="/(protected)/warehouse/re-scanning"
      getRequestById={getWarehouseReScanningRequestById}
    />
  );
}
