import { ServiceRequestEditScreen } from "@/components/cfs/ServiceRequestScreens";
import { getProformaInvoiceRequestById, updateProformaInvoiceRequest } from "@/lib/actions/cfs/proformaInvoice";

export default function ProformaInvoiceEditPage() {
  return (
    <ServiceRequestEditScreen
      title="Proforma Invoice"
      basePath="/(protected)/cfs/proforma-invoice"
      getRequestById={getProformaInvoiceRequestById}
      updateRequest={updateProformaInvoiceRequest}
    />
  );
}
