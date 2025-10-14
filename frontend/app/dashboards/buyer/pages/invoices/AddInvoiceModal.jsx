"use client";

import { useEffect, useState } from "react";

export default function AddInvoiceModal({ onClose, onSave }) {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    ref_facture: `Inv-${Date.now()}`,
    date: "",
    from: "",
    billed_to: "",
    mode_paiement: "",
  });

  // Récupérer nom utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data?.name) {
          setInvoiceData((prev) => ({ ...prev, from: data.name }));
        }
      } catch (error) {
        console.error("Erreur fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  // Récupérer produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/api/product/all", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Erreur fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Totaux
  const calculateTotals = () => {
    let montant_ht = 0;
    products.forEach((p) => {
      const qty = parseFloat(p.quantite) || 0;
      const price = parseFloat(p.prix_unitaire) || 0;
      montant_ht += qty * price;
    });
    const tva = montant_ht * 0.2;
    const montant_ttc = montant_ht + tva;
    return { montant_ht, tva, montant_ttc };
  };
  const totals = calculateTotals();

  // Changement facture
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  // Changement produit
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...products];
    if (!list[index]) return;

    list[index][name] = value;

    if (name === "nom_produit") {
      const found = allProducts.find((p) => p.nom_produit === value);
      if (found) {
        list[index].ref_produit = found.ref_produit || found.id;
        list[index].prix_unitaire = found.prix;
      }
    }

    setProducts(list);
  };

  const handleAddProduct = () => {
    setProducts((prev) => [
      ...prev,
      { ref_produit: "", nom_produit: "", quantite: 1, prix_unitaire: 0 },
    ]);
  };

  const handleRemoveProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // Sauvegarde backend
  const handleSaveInvoice = async (e) => {
    e.preventDefault();

    if (!products.length) {
      alert("Ajoutez au moins un produit.");
      return;
    }
    if (!invoiceData.billed_to) {
      alert("Le champ 'Billed to' est requis.");
      return;
    }

    const validProducts = products.filter(
      (p) =>
        p.ref_produit &&
        p.nom_produit &&
        Number(p.quantite) > 0 &&
        Number(p.prix_unitaire) > 0
    );

    if (!validProducts.length) {
      alert("Toutes les lignes produits sont incomplètes.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token manquant.");
      return;
    }

    const payload = {
      ...invoiceData,
      lines: validProducts.map((p) => ({
        ref_produit: p.ref_produit,
        nom_produit: p.nom_produit,
        quantite: Number(p.quantite),
        prix_unitaire: Number(p.prix_unitaire),
        total_ligne: Number(p.quantite) * Number(p.prix_unitaire),
      })),
      montant_ht: totals.montant_ht,
      tva: totals.tva,
      montant_ttc: totals.montant_ttc,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/facture/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${data?.message || "Erreur API"}`);
      }

      console.log("Facture créée:", data);
      if (onSave) onSave(data);

      setProducts([]);
      setInvoiceData({
        ref_facture: `Inv-${Date.now()}`,
        date: "",
        from: invoiceData.from,
        billed_to: "",
        mode_paiement: "",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la facture:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold ">Create Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSaveInvoice} className="space-y-4">
          {/* Infos facture */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">From</label>
                  <input
                    type="text"
                    name="from"
                    value={invoiceData.from}
                    onChange={handleInvoiceChange}
                    readOnly
                    className="mt-1 block w-full border text-center border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Billed to</label>
                  <input
                    type="text"
                    name="billed_to"
                    value={invoiceData.billed_to}
                    onChange={handleInvoiceChange}
                    className="mt-1 block text-center w-full border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 space-y-2">
              <div className="text-xl font-bold">Invoice</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 border bg-gray-100">Invoice_ref</div>
                <input
                  type="text"
                  name="ref_facture"
                  value={invoiceData.ref_facture}
                  readOnly
                  className="p-2 border"
                />
                <div className="p-2 border bg-gray-100">Date</div>
                <input
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInvoiceChange}
                  className="p-2 border"
                />
              </div>
            </div>
          </div>

          {/* Produits */}
          <div className="overflow-x-auto border rounded-lg">
            <div className="grid grid-cols-6 text-sm font-bold bg-gray-100 border-b">
              <div className="p-2 border-r">Product_ref</div>
              <div className="p-2 border-r">Product_name</div>
              <div className="p-2 border-r">Qty</div>
              <div className="p-2 border-r">Unit_Price</div>
              <div className="p-2">Total_Price</div>
              <div className="p-2">Actions</div>
            </div>

            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-6 text-sm">
                <input
                  type="text"
                  name="ref_produit"
                  value={product.ref_produit}
                  onChange={(e) => handleProductChange(index, e)}
                  className="p-2 border-r"
                  readOnly
                />
                <input
                  type="text"
                  name="nom_produit"
                  value={product.nom_produit}
                  onChange={(e) => handleProductChange(index, e)}
                  list="products-list"
                  className="p-2 border-r"
                  placeholder="Search product"
                />
                <datalist id="products-list">
                  {allProducts.map((p) => (
                    <option key={p.id || p.ref_produit} value={p.nom_produit} />
                  ))}
                </datalist>
                <input
                  type="number"
                  name="quantite"
                  min="1"
                  value={product.quantite}
                  onChange={(e) => handleProductChange(index, e)}
                  className="p-2 border-r"
                />
                <input
                  type="number"
                  name="prix_unitaire"
                  value={product.prix_unitaire}
                  readOnly
                  className="p-2 border-r"
                />
                <div className="p-2 border-r">
                  {(
                    (parseFloat(product.quantite) || 0) *
                    (parseFloat(product.prix_unitaire) || 0)
                  ).toFixed(2)}
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleAddProduct}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add new line
            </button>
          </div>

          {/* Totaux + Paiement */}
          <div className="flex justify-between items-end mt-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Payment method:</label>
              <select
                name="mode_paiement"
                value={invoiceData.mode_paiement}
                onChange={handleInvoiceChange}
                className="p-2 border rounded-md"
              >
                <option value="">Choose</option>
                <option value="Bank Card">Bank Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="flex-shrink-0 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 border bg-gray-100">Total HT</div>
                <div className="p-2 border">${totals.montant_ht.toFixed(2)}</div>
                <div className="p-2 border bg-gray-100">TVA</div>
                <div className="p-2 border">${totals.tva.toFixed(2)}</div>
                <div className="p-2 border bg-gray-100">Total</div>
                <div className="p-2 border">${totals.montant_ttc.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
