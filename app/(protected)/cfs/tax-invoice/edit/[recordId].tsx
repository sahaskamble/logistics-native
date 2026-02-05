import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getTaxInvoiceRequestById, updateTaxInvoiceRequest } from "@/lib/actions/cfs/taxInvoice";

export default function TaxInvoiceEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Tax Invoice"
      basePath="/(protected)/cfs/tax-invoice"
      getRequestById={getTaxInvoiceRequestById}
      updateRequest={updateTaxInvoiceRequest}
    />
  );
}
