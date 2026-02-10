import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseReScanningRequest } from "@/lib/actions/warehouse/reScanning";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseReScanningCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Re-Scanning"
      basePath="/(protected)/warehouse/re-scanning"
      createRequest={createWarehouseReScanningRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
