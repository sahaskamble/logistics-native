import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseEirCopyRequest } from "@/lib/actions/warehouse/eirCopy";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseEirCopyCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="EIR Copy"
      basePath="/(protected)/warehouse/eir-copy"
      createRequest={createWarehouseEirCopyRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
