import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getWarehouseTaxInvoiceRequestById } from "@/lib/actions/warehouse/taxInvoice";

export default function WarehouseTaxInvoiceViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Tax Invoice"
      basePath="/(protected)/warehouse/tax-invoice"
      getRequestById={getWarehouseTaxInvoiceRequestById}
    />
  );
}
