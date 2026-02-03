export interface InvoiceItem {
  acCode: string;
  description: string;
  quantity: string;
  rate: string;
  taxableValue: string;
  vatPercent: string;
  vat: string;
  totalAmount: string;
}

export interface InvoiceData {
  companyName: string;
  companyTrn: string;       // Company's TRN (header)
  ref: string;              // Invoice Ref (top left)
  customerName: string;
  invoiceDate: string;
  trnNo: string;            // Customer TRN
  voucherNo: string;
  paymentDue: string;      // Amount or date
  customerCode: string;
  customerRef: string;
  poBox: string;
  clientCode: string;
  customerRefName: string;
  items: InvoiceItem[];
  subTotal: string;
  vatTotal: string;
  grandTotal: string;
  amountInWords: string;   // e.g. "Six hundred and eighty two AED 50/100 Fils"
  footerContact: string;   // Tel, Fax, P.O. Box, address
  footerEmail: string;
  companyArabicName?: string; // Optional Arabic company name
  companyBrandName?: string;  // Red brand name in header (e.g. "Millennium")
}

export const emptyItem: InvoiceItem = {
  acCode: "",
  description: "",
  quantity: "",
  rate: "",
  taxableValue: "",
  vatPercent: "",
  vat: "",
  totalAmount: "",
};

export const initialInvoiceData: InvoiceData = {
  companyName: "",
  companyTrn: "",
  ref: "",
  customerName: "",
  invoiceDate: "",
  trnNo: "",
  voucherNo: "",
  paymentDue: "",
  customerCode: "",
  customerRef: "",
  poBox: "",
  clientCode: "",
  customerRefName: "",
  items: [{ ...emptyItem }],
  subTotal: "",
  vatTotal: "",
  grandTotal: "",
  amountInWords: "",
  footerContact: "",
  footerEmail: "",
};

/** Returns a fresh copy for new invoices so items array is not shared. */
export function getNewInvoiceData(): InvoiceData {
  return {
    ...initialInvoiceData,
    items: [{ ...emptyItem }],
  };
}
