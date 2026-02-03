import { useState } from "react";
import Invoice from "./components/Invoice";
import { getNewInvoiceData, type InvoiceData } from "./types/invoice";
import "./App.css";

export interface SavedInvoice {
  id: string;
  data: InvoiceData;
  logo: string;
}

function App() {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addInvoice = () => {
    const id = crypto.randomUUID();
    setInvoices((prev) => [
      ...prev,
      { id, data: getNewInvoiceData(), logo: "" },
    ]);
    setActiveId(id);
  };

  const saveInvoice = (id: string, data: InvoiceData, logo?: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, data, logo: logo ?? inv.logo } : inv
      )
    );
  };

  const deleteInvoice = (id: string) => {
    const next = invoices.filter((inv) => inv.id !== id);
    setInvoices(next);
    if (activeId === id) {
      setActiveId(next.length ? next[0].id : null);
    }
  };

  const active = invoices.find((inv) => inv.id === activeId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Invoices</h1>
        <button type="button" onClick={addInvoice} className="btn btn-primary">
          + New Invoice
        </button>
      </header>

      {invoices.length === 0 ? (
        <div className="app-empty">
          <p>No invoices yet. Create one to get started.</p>
          <button type="button" onClick={addInvoice} className="btn btn-primary">
            Create Invoice
          </button>
        </div>
      ) : (
        <>
          <div className="app-tabs">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                type="button"
                className={`tab ${activeId === inv.id ? "active" : ""}`}
                onClick={() => setActiveId(inv.id)}
              >
                {inv.data.voucherNo || "Draft"} {inv.data.companyName ? `– ${inv.data.companyName}` : ""}
              </button>
            ))}
          </div>
          {active && (
            <Invoice
              key={active.id}
              data={active.data}
              logoUrl={active.logo}
              onSave={(data, logo) => saveInvoice(active.id, data, logo)}
              onDelete={() => deleteInvoice(active.id)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
