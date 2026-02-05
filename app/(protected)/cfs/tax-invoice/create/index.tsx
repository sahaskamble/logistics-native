import { ServiceRequestCreateScreen } from "@/components/cfs/ServiceRequestScreens";
import { createTaxInvoiceRequest } from "@/lib/actions/cfs/taxInvoice";

export default function TaxInvoiceCreatePage() {
  return (
    <ServiceRequestCreateScreen
      title="Tax Invoice"
      basePath="/(protected)/cfs/tax-invoice"
      createRequest={createTaxInvoiceRequest}
    />
  );
}
