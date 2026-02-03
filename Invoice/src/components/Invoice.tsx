import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { InvoiceData, InvoiceItem } from "../types/invoice";
import "./Invoice.css";

interface InvoiceProps {
  data: InvoiceData;
  logoUrl?: string;
  onSave: (data: InvoiceData, logo?: string) => void;
  onDelete?: () => void;
}

export default function Invoice({ data, logoUrl = "", onSave, onDelete }: InvoiceProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(data);
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
              placeholder="Company Name"
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
              type="date"
              value={invoiceData.paymentDue}
              onChange={(e) => updateField("paymentDue", e.target.value)}
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
                  <th>AC Code</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Taxable Value</th>
                  <th>VAT %</th>
                  <th>VAT</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, i) => (
                  <tr key={i}>
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

        <div className="form-group span-full" style={{ marginTop: "0.5rem" }}>
          <label>Amount in Words</label>
          <input
            value={invoiceData.amountInWords ?? ""}
            onChange={(e) => updateField("amountInWords", e.target.value)}
            placeholder="e.g. Six hundred and eighty two AED 50/100 Fils"
          />
        </div>
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

      <div ref={printRef} className="invoice-paper">
        <header className="invoice-header">
          <div className="invoice-header-left">
            {logo ? <img src={logo} alt="" className="invoice-logo" /> : <div className="invoice-logo-placeholder">Logo</div>}
            <div className="invoice-company-name">{invoiceData.companyName || "Company Name"}</div>
          </div>
          <div className="invoice-header-right">
            <h1 className="invoice-title">INVOICE</h1>
            <div className="invoice-meta">
              <div className="invoice-meta-row"><span>Voucher No:</span> {invoiceData.voucherNo}</div>
              <div className="invoice-meta-row"><span>Date:</span> {invoiceData.invoiceDate}</div>
              <div className="invoice-meta-row"><span>Payment Due:</span> {invoiceData.paymentDue}</div>
            </div>
          </div>
        </header>

        <div className="invoice-parties bill-to-section">
          <div className="bill-to-head-row">
            <span className="bill-to-label">BILL TO</span>
            <span className="bill-to-name">{invoiceData.customerName || "—"}</span>
          </div>
          {invoiceData.poBox && <div className="bill-to-line2">{invoiceData.poBox}</div>}
          <div className="bill-to-refs">
            <div className="bill-to-ref-row1">
              <span className="bill-to-ref-item"><strong>TRN:</strong> {invoiceData.trnNo || "—"}</span>
              <span className="bill-to-ref-item"><strong>Customer Code:</strong> {invoiceData.customerCode || "—"}</span>
              <span className="bill-to-ref-item"><strong>Client Code:</strong> {invoiceData.clientCode || "—"}</span>
            </div>
            <div className="bill-to-ref-row2">
              <span className="bill-to-ref-item"><strong>Customer Ref Name:</strong> {invoiceData.customerRefName || "—"}</span>
            </div>
          </div>
        </div>

        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>AC Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Taxable Value</th>
              <th>VAT %</th>
              <th>VAT</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((row, i) => (
              <tr key={i}>
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
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="invoice-totals-row">
            <span>Sub Total</span>
            <span>{invoiceData.subTotal}</span>
          </div>
          <div className="invoice-totals-row">
            <span>VAT Total</span>
            <span>{invoiceData.vatTotal}</span>
          </div>
          <div className="invoice-totals-row grand">
            <span>Grand Total</span>
            <span>{invoiceData.grandTotal}</span>
          </div>
        </div>

        {invoiceData.amountInWords && (
          <div className="invoice-amount-in-words">{invoiceData.amountInWords}</div>
        )}
      </div>
    </div>
  );
}
