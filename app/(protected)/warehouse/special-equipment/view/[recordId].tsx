import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseSpecialEquipmentRequestById } from "@/lib/actions/warehouse/specialEquipment";

export default function WarehouseSpecialEquipmentViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Special Equipment"
      basePath="/(protected)/warehouse/special-equipment"
      getRequestById={getWarehouseSpecialEquipmentRequestById}
    />
  );
}
