import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseSpecialEquipmentRequests } from "@/lib/actions/warehouse/specialEquipment";

export default function WarehouseSpecialEquipmentListPage() {
  return (
    <ServiceRequestListScreen
      title="Special Equipment"
      basePath="/(protected)/warehouse/special-equipment"
      listRequests={listWarehouseSpecialEquipmentRequests}
    />
  );
}
