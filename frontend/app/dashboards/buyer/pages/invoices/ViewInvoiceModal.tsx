"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type LineItem = {
  ref_produit: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
};

type InvoiceData = {
  id: number;
  ref_facture: string;
  name_client: string;
  created_at: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  lines: LineItem[];
};

type ViewInvoiceModalProps = {
  onClose: () => void;
  invoiceData: InvoiceData;
};

export default function ViewInvoiceModal({ onClose, invoiceData }: ViewInvoiceModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePdf = async () => {
    if (!pdfRef.current || !invoiceData) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`facture_${invoiceData.ref_facture}.pdf`);
  };

  if (!invoiceData) return null;
 

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invoice Details</h2>
          <div className="space-x-2">
            <button
              onClick={generatePdf}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        <div ref={pdfRef} className="bg-white p-8">
          {/* Infos client */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-lg">Billed to:</h3>
              <p>{invoiceData.name_client}</p>
            </div>
            <div className="flex-shrink-0 space-y-2 text-right">
              <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm text-gray-600">Ref Invoice: {invoiceData.ref_facture}</p>
              <p className="text-sm text-gray-600">
                Date: {new Date(invoiceData.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Payment method: {invoiceData.mode_paiement}</p>
            </div>
          </div>
            {/* Tableau des produits */}
            <div className="overflow-x-auto border rounded-lg">
              <div className="grid grid-cols-6 text-sm font-bold bg-gray-100 border-b">
                <div className="p-2 border-r">Product Ref</div>
                <div className="p-2 border-r col-span-2">Product Name</div>
                <div className="p-2 border-r">Qty</div>
                <div className="p-2 border-r">Unit Price</div>
                <div className="p-2">Total</div>
              </div>

              {(invoiceData.lines).map((item, index) => (
                <div key={index} className="grid grid-cols-6 text-sm border-b">
                  <div className="p-2 border-r">{item.ref_produit}</div>
                  <div className="p-2 border-r col-span-2">{item.nom_produit}</div>
                  <div className="p-2 border-r text-center">{item.quantite}</div>
                  <div className="p-2 border-r text-right">${Number(item.prix_unitaire).toFixed(2)}</div>
                  <div className="p-2 text-right">${Number(item.total_ligne).toFixed(2)}</div>
                </div>
              ))}
            </div>



          {/* Totaux */}
          <div className="flex justify-end mt-6">
            <div className="w-1/2 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-100 font-medium">Total HT</div>
                <div className="p-2 text-right">${invoiceData.montant_ht.toFixed(2)}</div>

                <div className="p-2 bg-gray-100 font-medium">TVA (20%)</div>
                <div className="p-2 text-right">${invoiceData.tva.toFixed(2)}</div>

                <div className="p-2 bg-gray-100 font-medium text-lg">Total TTC</div>
                <div className="p-2 text-right text-lg font-bold">${invoiceData.montant_ttc.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
