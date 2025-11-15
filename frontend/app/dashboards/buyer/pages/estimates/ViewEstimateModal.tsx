"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type EstimateLine = {
  ref_produit: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
};

type EstimateData = {
  ref_devis: string;
  created_at: string;
  categorie?: string;
  total?: number;
  lines?: EstimateLine[]; 
};

type ViewEstimateModalProps = {
  onClose: () => void;
  estimateData: EstimateData | null;
};

export default function ViewEstimateModal({ onClose, estimateData }: ViewEstimateModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePdf = async () => {
    if (!pdfRef.current || !estimateData) return;

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

    pdf.save(`devis_${estimateData.ref_devis}.pdf`);
  };

  if (!estimateData) return null;

  const totalAmount = estimateData.lines?.reduce(
    (acc, item) => acc + Number(item.quantite ?? 0) * Number(item.prix_unitaire ?? 0),
    0
  ) ?? 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Estimate details</h2>
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

        {/* Content */}
        <div ref={pdfRef} className="bg-white p-8">
    
          <div className="flex justify-between items-start mb-6">
            <div className="flex-shrink-0 space-y-2 text-right">
              <h2 className="text-3xl font-bold text-gray-800">ESTIMATE</h2>
              <p className="text-sm text-gray-600">Ref Estimate: {estimateData.ref_devis}</p>
              <p className="text-sm text-gray-600">
                Date: {new Date(estimateData.created_at).toLocaleDateString()}
              </p>
              {estimateData.categorie && (
                <p className="text-sm text-gray-600">Category: {estimateData.categorie}</p>
              )}
            </div>
          </div>

          {/* Table*/}
          <div className="overflow-x-auto border rounded-lg">
            <div className="grid grid-cols-6 text-sm font-bold bg-gray-100 border-b">
              <div className="p-2 border-r">Réf Product</div>
              <div className="p-2 border-r col-span-2">Product Name</div>
              <div className="p-2 border-r">Qty</div>
              <div className="p-2 border-r">Unit Price</div>
              <div className="p-2">Total Line</div>
            </div>

            {estimateData.lines && estimateData.lines.length > 0 ? (
              estimateData.lines.map((line, index) => {
                const qty = Number(line.quantite ?? 0);
                const unitPrice = Number(line.prix_unitaire ?? 0);
                const totalLine = qty * unitPrice;

                return (
                  <div key={index} className="grid grid-cols-6 text-sm border-b">
                    <div className="p-2 border-r">{line.ref_produit}</div>
                    <div className="p-2 border-r col-span-2">{line.nom_produit}</div>
                    <div className="p-2 border-r">{qty}</div>
                    <div className="p-2 border-r">${unitPrice.toFixed(2)}</div>
                    <div className="p-2">${totalLine.toFixed(2)}</div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">No products</div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-6">
            <div className="w-1/2 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-100 font-medium text-lg">Total</div>
                <div className="p-2 text-right text-lg font-bold">${totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
