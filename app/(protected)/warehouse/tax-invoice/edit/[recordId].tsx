import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseTaxInvoiceRequestById, updateWarehouseTaxInvoiceRequest } from "@/lib/actions/warehouse/taxInvoice";

export default function WarehouseTaxInvoiceEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Tax Invoice"
      basePath="/(protected)/warehouse/tax-invoice"
      getRequestById={getWarehouseTaxInvoiceRequestById}
      updateRequest={updateWarehouseTaxInvoiceRequest}
    />
  );
}
