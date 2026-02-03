import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { initialInvoiceData, type InvoiceData, type InvoiceItem } from "../types/invoice";
import "./Invoice.css";

interface InvoiceProps {
  data: InvoiceData;
  logoUrl?: string;
  onSave: (data: InvoiceData, logo?: string) => void;
  onDelete?: () => void;
}

export default function Invoice({ data, logoUrl = "", onSave, onDelete }: InvoiceProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => ({ ...initialInvoiceData, ...data }));
  const [logo, setLogo] = useState<string>(logoUrl);
  const [isEditing, setIsEditing] = useState(true);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setInvoiceData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { acCode: "", description: "", quantity: "", rate: "", taxableValue: "", vatPercent: "", vat: "", totalAmount: "" }],
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length <= 1) return;
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => setLogo("");

  const handleSave = () => {
    onSave(invoiceData, logo);
    setIsEditing(false);
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsSavingPdf(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const w = ratio > pdfW / pdfH ? pdfW : pdfH * ratio;
      const h = ratio > pdfW / pdfH ? pdfW / ratio : pdfH;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`invoice-${invoiceData.voucherNo || "draft"}.pdf`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  if (isEditing) {
    return (
      <div className="invoice-editor">
        <div className="invoice-editor-header">
          <h2>Edit Invoice</h2>
          <div className="invoice-editor-actions">
            <button type="button" onClick={() => handleSave()} className="btn btn-primary">
              Save & View
            </button>
            {onDelete && (
              <button type="button" onClick={onDelete} className="btn btn-danger">
                Delete Invoice
              </button>
            )}
          </div>
        </div>

        <div className="invoice-editor-logo">
          <label>Company Logo (editable)</label>
          <div className="logo-upload-area">
            {logo ? (
              <>
                <img src={logo} alt="Company logo" className="logo-preview" />
                <div className="logo-actions">
                  <label className="btn btn-secondary btn-sm">
                    Change
                    <input type="file" accept="image/*" onChange={onLogoChange} hidden />
                  </label>
                  <button type="button" onClick={clearLogo} className="btn btn-outline btn-sm">
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="logo-placeholder">
                <span>Click to upload logo</span>
                <input type="file" accept="image/*" onChange={onLogoChange} hidden />
              </label>
            )}
          </div>
        </div>

        <div className="invoice-form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              value={invoiceData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="e.g. GENERAL LAND TRANSPORT L.L.C."
            />
          </div>
          <div className="form-group">
            <label>Company Brand Name (red in header)</label>
            <input
              value={invoiceData.companyBrandName ?? ""}
              onChange={(e) => updateField("companyBrandName", e.target.value)}
              placeholder="e.g. Millennium"
            />
          </div>
          <div className="form-group">
            <label>Company TRN No</label>
            <input
              value={invoiceData.companyTrn}
              onChange={(e) => updateField("companyTrn", e.target.value)}
              placeholder="Company TRN"
            />
          </div>
          <div className="form-group">
            <label>Ref</label>
            <input
              value={invoiceData.ref}
              onChange={(e) => updateField("ref", e.target.value)}
              placeholder="Invoice Ref"
            />
          </div>
          <div className="form-group">
            <label>Voucher No</label>
            <input
              value={invoiceData.voucherNo}
              onChange={(e) => updateField("voucherNo", e.target.value)}
              placeholder="Voucher No"
            />
          </div>
          <div className="form-group">
            <label>Invoice Date</label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => updateField("invoiceDate", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Payment Due</label>
            <input
              value={invoiceData.paymentDue}
              onChange={(e) => updateField("paymentDue", e.target.value)}
              placeholder="Amount or date"
            />
          </div>
        </div>

        <section className="form-section">
          <h3>Bill To / Customer</h3>
          <div className="invoice-form-grid two-cols">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                value={invoiceData.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                placeholder="Customer Name"
              />
            </div>
            <div className="form-group">
              <label>TRN No</label>
              <input
                value={invoiceData.trnNo}
                onChange={(e) => updateField("trnNo", e.target.value)}
                placeholder="TRN No"
              />
            </div>
            <div className="form-group">
              <label>Customer Code</label>
              <input
                value={invoiceData.customerCode}
                onChange={(e) => updateField("customerCode", e.target.value)}
                placeholder="Customer Code"
              />
            </div>
            <div className="form-group">
              <label>Customer Ref</label>
              <input
                value={invoiceData.customerRef}
                onChange={(e) => updateField("customerRef", e.target.value)}
                placeholder="Customer Ref"
              />
            </div>
            <div className="form-group">
              <label>PO Box</label>
              <input
                value={invoiceData.poBox}
                onChange={(e) => updateField("poBox", e.target.value)}
                placeholder="PO Box"
              />
            </div>
            <div className="form-group">
              <label>Client Code</label>
              <input
                value={invoiceData.clientCode}
                onChange={(e) => updateField("clientCode", e.target.value)}
                placeholder="Client Code"
              />
            </div>
            <div className="form-group span-full">
              <label>Customer Ref Name</label>
              <input
                value={invoiceData.customerRefName}
                onChange={(e) => updateField("customerRefName", e.target.value)}
                placeholder="Customer Ref Name"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <h3>Line Items</h3>
            <button type="button" onClick={addItem} className="btn btn-secondary btn-sm">
              + Add Row
            </button>
          </div>
          <div className="items-table-wrap">
            <table className="items-edit-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>A/C Code</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Taxable Value</th>
                  <th>Vat%</th>
                  <th>Vat Amount</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, i) => (
                  <tr key={i}>
                    <td className="sno">{i + 1}</td>
                    <td><input value={item.acCode} onChange={(e) => updateItem(i, "acCode", e.target.value)} /></td>
                    <td><input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} /></td>
                    <td><input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} /></td>
                    <td><input type="number" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} /></td>
                    <td><input type="number" value={item.taxableValue} onChange={(e) => updateItem(i, "taxableValue", e.target.value)} /></td>
                    <td><input value={item.vatPercent} onChange={(e) => updateItem(i, "vatPercent", e.target.value)} /></td>
                    <td><input type="number" value={item.vat} onChange={(e) => updateItem(i, "vat", e.target.value)} /></td>
                    <td><input type="number" value={item.totalAmount} onChange={(e) => updateItem(i, "totalAmount", e.target.value)} /></td>
                    <td>
                      <button type="button" onClick={() => removeItem(i)} className="btn-remove-row" disabled={invoiceData.items.length === 1} title="Remove row">
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="invoice-form-grid three-cols">
          <div className="form-group">
            <label>Sub Total</label>
            <input
              type="number"
              value={invoiceData.subTotal}
              onChange={(e) => updateField("subTotal", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>VAT Total</label>
            <input
              type="number"
              value={invoiceData.vatTotal}
              onChange={(e) => updateField("vatTotal", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Grand Total</label>
            <input
              type="number"
              value={invoiceData.grandTotal}
              onChange={(e) => updateField("grandTotal", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group span-full" style={{ marginTop: "1rem" }}>
          <label>Amount in Words</label>
          <input
            value={invoiceData.amountInWords}
            onChange={(e) => updateField("amountInWords", e.target.value)}
            placeholder="e.g. Six hundred and eighty two AED 50/100 Fils"
          />
        </div>

        <section className="form-section">
          <h3>Footer</h3>
          <div className="form-group">
            <label>Contact (Tel, Fax, P.O. Box, Address)</label>
            <input
              value={invoiceData.footerContact}
              onChange={(e) => updateField("footerContact", e.target.value)}
              placeholder="Tel.: +971 4 2511834, Fax: ..."
            />
          </div>
          <div className="form-group">
            <label>Footer Email</label>
            <input
              type="email"
              value={invoiceData.footerEmail}
              onChange={(e) => updateField("footerEmail", e.target.value)}
              placeholder="E-mail"
            />
          </div>
          <div className="form-group">
            <label>Company Arabic Name (optional)</label>
            <input
              value={invoiceData.companyArabicName ?? ""}
              onChange={(e) => updateField("companyArabicName", e.target.value)}
              placeholder="Arabic company name"
            />
          </div>
        </section>
      </div>
    );
  }

  // View mode: printable invoice
  return (
    <div className="invoice-view-wrap">
      <div className="invoice-view-actions">
        <button type="button" onClick={() => setIsEditing(true)} className="btn btn-secondary">
          Edit
        </button>
        <button type="button" onClick={handleDownloadPdf} className="btn btn-primary" disabled={isSavingPdf}>
          {isSavingPdf ? "Generating…" : "Download PDF"}
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn btn-danger">
            Delete Invoice
          </button>
        )}
      </div>

      <div ref={printRef} className="invoice-paper template">
        {/* Header: left = Arabic above logo; right = brand (red) + company (grey) + TAX INVOICE */}
        <header className="invoice-header template-header">
          <div className="invoice-header-left">
            {logo ? <img src={logo} alt="" className="invoice-logo invoice-logo-circle" /> : <div className="invoice-logo-placeholder">Logo</div>}
            <div className="invoice-brand-black">{invoiceData.companyBrandName || invoiceData.companyName || ""}</div>
          </div>
          <div className="invoice-header-right">
            {invoiceData.companyArabicName && <div className="invoice-arabic" dir="rtl">{invoiceData.companyArabicName}</div>}
            <div className="invoice-brand-red">{invoiceData.companyBrandName || invoiceData.companyName || "Company"}</div>
            <div className="invoice-company-name">{invoiceData.companyName || "Company Name"}</div>
            <h1 className="invoice-title">TAX INVOICE</h1>
          </div>
        </header>

        {/* Below header: Ref | TRN No | Date */}
        <div className="invoice-top-line">
          <span className="invoice-top-ref">Ref. <span className="dotted invoice-dotted-ref">{invoiceData.ref || " "}</span></span>
          <span className="invoice-top-trn">TRN No: {invoiceData.companyTrn || "________________"}</span>
          <span className="invoice-top-date">Date <span className="dotted invoice-dotted-date">{invoiceData.invoiceDate || " "}</span></span>
        </div>

        {/* Two columns: Customer (left) | Voucher/Date/Client Code/Payment Due/Customer Ref (right) */}
        <div className="invoice-two-cols">
          <div className="invoice-col-left">
            <div className="invoice-field-row"><span className="invoice-field-label">CUSTOMER NAME:</span> {invoiceData.customerName || "________________"}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">TRN No:</span> {invoiceData.trnNo || "________________"}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">PO Box:</span> {invoiceData.poBox || "________________"}</div>
          </div>
          <div className="invoice-col-right">
            <div className="invoice-field-row"><span className="invoice-field-label">Voucher No:</span> {invoiceData.voucherNo}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">Date:</span> {invoiceData.invoiceDate}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">Client Code:</span> {invoiceData.clientCode || "________________"}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">Payment Due:</span> {invoiceData.paymentDue || "________________"}</div>
            <div className="invoice-field-row"><span className="invoice-field-label">Customer Ref:</span> {invoiceData.customerRef || "________________"}</div>
          </div>
        </div>

        {/* Items table: S No | A/C Code | Description | Quantity | Rate | Taxable Value | Vat% | Vat Amount | Total */}
        <table className="invoice-items-table template-table">
          <thead>
            <tr>
              <th>S No</th>
              <th>A/C Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Taxable Value</th>
              <th>Vat%</th>
              <th>Vat Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((row, i) => (
              <tr key={i}>
                <td className="num">{i + 1}</td>
                <td>{row.acCode}</td>
                <td>{row.description}</td>
                <td className="num">{row.quantity}</td>
                <td className="num">{row.rate}</td>
                <td className="num">{row.taxableValue}</td>
                <td className="num">{row.vatPercent}</td>
                <td className="num">{row.vat}</td>
                <td className="num">{row.totalAmount}</td>
              </tr>
            ))}
            {/* Empty rows to match reference layout (8 rows) */}
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={`empty-${i}`} className="invoice-empty-row">
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="invoice-subtotal-row">
              <td colSpan={3} className="invoice-subtotal-label">Sub Total</td>
              <td></td>
              <td></td>
              <td className="num">{invoiceData.subTotal}</td>
              <td></td>
              <td className="num">{invoiceData.vatTotal}</td>
              <td className="num">{invoiceData.grandTotal}</td>
            </tr>
            <tr className="invoice-amount-words-row">
              <td colSpan={7} className="invoice-amount-words-cell">{invoiceData.amountInWords || ""}</td>
              <td></td>
              <td></td>
            </tr>
            <tr className="invoice-total-amount-row">
              <td colSpan={3} className="invoice-total-amount-label">Total Amount</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="num invoice-total-amount-value">{invoiceData.grandTotal}</td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div className="invoice-signatures">
          <div className="invoice-sig-left">
            <span className="invoice-sig-label">Prepared By:</span>
            <span className="invoice-sig-line dotted">________________</span>
          </div>
          <div className="invoice-sig-right">
            <span className="invoice-sig-label">Received By:</span>
            <span className="invoice-sig-line dotted">________________</span>
            <span className="invoice-sig-label">Customer Sign:</span>
            <span className="invoice-sig-line dotted">________________</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="invoice-footer">
          {invoiceData.footerContact && <div className="invoice-footer-contact">{invoiceData.footerContact}</div>}
          {invoiceData.footerEmail && (
            <div className="invoice-footer-email">
              {invoiceData.footerEmail.toLowerCase().startsWith("e-mail") ? invoiceData.footerEmail : `E-mail: ${invoiceData.footerEmail}`}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
