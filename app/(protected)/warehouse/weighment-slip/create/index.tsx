import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseWeighmentSlipRequest } from "@/lib/actions/warehouse/weighmentSlip";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseWeighmentSlipCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Weighment Slip"
      basePath="/(protected)/warehouse/weighment-slip"
      createRequest={createWarehouseWeighmentSlipRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
