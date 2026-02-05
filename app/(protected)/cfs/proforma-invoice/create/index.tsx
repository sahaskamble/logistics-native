import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createProformaInvoiceRequest } from "@/lib/actions/cfs/proformaInvoice";

export default function ProformaInvoiceCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Proforma Invoice"
      basePath="/(protected)/cfs/proforma-invoice"
      createRequest={createProformaInvoiceRequest}
    />
  );
}
