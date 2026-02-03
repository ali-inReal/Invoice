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
  customerName: string;
  invoiceDate: string;
  trnNo: string;
  voucherNo: string;
  paymentDue: string;
  customerCode: string;
  customerRef: string;
  poBox: string;
  clientCode: string;
  customerRefName: string;
  items: InvoiceItem[];
  subTotal: string;
  vatTotal: string;
  grandTotal: string;
  amountInWords: string;
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
};

/** Returns a fresh copy for new invoices so items array is not shared. */
export function getNewInvoiceData(): InvoiceData {
  return {
    ...initialInvoiceData,
    items: [{ ...emptyItem }],
  };
}
