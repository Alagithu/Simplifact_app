"use client";

import { useEffect, useState } from "react";

export default function AddEstimateModal({ onClose, onSave }) {
  const [estimateData, setEstimateData] = useState({
    ref_devis: `E-${Date.now()}`,
    categorie: "",
  });

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data && data.category) {
          setEstimateData((prev) => ({ ...prev, categorie: data.category }));
        }
      } catch (error) {
        console.error("Erreur fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/product/all", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Erreur fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const calculateTotals = () =>
    products.reduce((acc, p) => acc + (Number(p.quantite) || 0) * (Number(p.prix_unitaire) || 0), 0);

  const total = calculateTotals();

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...products];

    if (name === "quantite" || name === "prix_unitaire") {
      list[index][name] = Math.max(Number(value), 0);
    } else {
      list[index][name] = value;

      if (name === "nom_produit") {
        const found = allProducts.find(
          (p) => p.nom_produit.toLowerCase() === value.toLowerCase()
        );
        if (found) {
          list[index].ref_produit = found.ref_produit;
          list[index].prix_unitaire = Number(found.prix);
        }
      }
    }

    setProducts(list);
  };

  const handleAddProduct = () =>
    setProducts([
      ...products,
      { ref_produit: "", nom_produit: "", quantite: 0, prix_unitaire: 0 },
    ]);

  const handleRemoveProduct = (index) => {
    const list = [...products];
    list.splice(index, 1);
    setProducts(list);
  };

  const handleSaveEstimate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      ...estimateData,
      lines: products.map((p) => ({
        ...p,
        total_ligne: Number(p.quantite) * Number(p.prix_unitaire),
      })),
      total,
    };

    try {
      const res = await fetch("/api/devis/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur API");

      if (onSave) onSave(data);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'ajout du devis :", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Estimate</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSaveEstimate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Estimate Ref</label>
              <input
                type="text"
                name="ref_devis"
                value={estimateData.ref_devis}
                readOnly
                className="mt-1 block w-full border p-2 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input
                type="text"
                name="categorie"
                value={estimateData.categorie}
                readOnly
                className="mt-1 block w-full border p-2 rounded-md bg-gray-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <div className="grid grid-cols-6 text-sm font-bold bg-gray-100 border-b">
              <div className="p-2 border-r">Product_ref</div>
              <div className="p-2 border-r">Product_name</div>
              <div className="p-2 border-r">Qty</div>
              <div className="p-2 border-r">Unit_Price</div>
              <div className="p-2 border-r">Total_Price</div>
              <div className="p-2">Actions</div>
            </div>

            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-6 text-sm border-b">
                <input
                  type="text"
                  name="ref_produit"
                  value={product.ref_produit}
                  onChange={(e) => handleProductChange(index, e)}
                  className="p-2 border-r"
                  placeholder="Ref auto"
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
                    <option key={p.ref_produit} value={p.nom_produit} />
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
                  min="0"
                  value={product.prix_unitaire}
                  onChange={(e) => handleProductChange(index, e)}
                  className="p-2 border-r"
                  readOnly
                />
                <div className="p-2 border-r flex items-center justify-start">
                  ${(product.quantite * product.prix_unitaire).toFixed(2)}
                </div>
                <div className="p-2 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700"
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
              className="text-blue-600 hover:text-blue-800"
            >
              + Add new line
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm w-1/2">
              <div className="p-2 border bg-gray-100 font-medium">Total</div>
              <div className="p-2 border text-right font-bold">${total.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
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
