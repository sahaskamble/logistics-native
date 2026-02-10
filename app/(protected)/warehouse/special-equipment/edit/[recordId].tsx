import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseSpecialEquipmentRequestById, updateWarehouseSpecialEquipmentRequest } from "@/lib/actions/warehouse/specialEquipment";

export default function WarehouseSpecialEquipmentEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Special Equipment"
      basePath="/(protected)/warehouse/special-equipment"
      getRequestById={getWarehouseSpecialEquipmentRequestById}
      updateRequest={updateWarehouseSpecialEquipmentRequest}
    />
  );
}
