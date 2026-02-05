import { ServiceRequestViewScreen } from "@/components/cfs/ServiceRequestScreens";
import { getProformaInvoiceRequestById } from "@/lib/actions/cfs/proformaInvoice";

export default function ProformaInvoiceViewPage() {
  return (
    <ServiceRequestViewScreen
      title="Proforma Invoice"
      basePath="/(protected)/cfs/proforma-invoice"
      getRequestById={getProformaInvoiceRequestById}
    />
  );
}
