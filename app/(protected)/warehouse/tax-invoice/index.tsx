import { ServiceRequestListScreen } from "@/components/cfs/ServiceRequestScreens";
import { listWarehouseTaxInvoiceRequests } from "@/lib/actions/warehouse/taxInvoice";

export default function WarehouseTaxInvoiceListPage() {
  return (
    <ServiceRequestListScreen
      title="Tax Invoice"
      basePath="/(protected)/warehouse/tax-invoice"
      listRequests={listWarehouseTaxInvoiceRequests}
    />
  );
}
