import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseReScanningRequestById, updateWarehouseReScanningRequest } from "@/lib/actions/warehouse/reScanning";

export default function WarehouseReScanningEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Re-Scanning"
      basePath="/(protected)/warehouse/re-scanning"
      getRequestById={getWarehouseReScanningRequestById}
      updateRequest={updateWarehouseReScanningRequest}
    />
  );
}
