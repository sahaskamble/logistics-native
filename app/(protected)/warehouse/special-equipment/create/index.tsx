import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseSpecialEquipmentRequest } from "@/lib/actions/warehouse/specialEquipment";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseSpecialEquipmentCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Special Equipment"
      basePath="/(protected)/warehouse/special-equipment"
      createRequest={createWarehouseSpecialEquipmentRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
