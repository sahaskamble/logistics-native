import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseWeighmentSlipRequests } from "@/lib/actions/warehouse/weighmentSlip";

export default function WarehouseWeighmentSlipListPage() {
  return (
    <ServiceRequestListScreen
      title="Weighment Slip"
      basePath="/(protected)/warehouse/weighment-slip"
      listRequests={listWarehouseWeighmentSlipRequests}
    />
  );
}
