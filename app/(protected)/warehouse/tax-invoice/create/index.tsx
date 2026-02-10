import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createWarehouseTaxInvoiceRequest } from "@/lib/actions/warehouse/taxInvoice";
import { listWarehouseOrdersForCurrentUser } from "@/lib/actions/warehouse/fetch";

export default function WarehouseTaxInvoiceCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Tax Invoice"
      basePath="/(protected)/warehouse/tax-invoice"
      createRequest={createWarehouseTaxInvoiceRequest}
      listOrders={() => listWarehouseOrdersForCurrentUser({ sort: "-created" })}
    />
  );
}
