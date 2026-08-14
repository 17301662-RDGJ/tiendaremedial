import { useState } from "react";

const emptyForm = { name: "", description: "", category: "", imagesFiles: "", price: "" };

export function ProductForm({ initialProduct, onSubmit, onCancel }) {
  const isEditing = Boolean(initialProduct);
  const [form, setForm] = useState(() =>
    initialProduct
      ? {
          name: initialProduct.name ?? "",
          description: initialProduct.descripcion ?? "",
          category: (initialProduct.category ?? []).join(", "),
          imagesFiles: initialProduct.imagesFiles ?? "",
          price: String(initialProduct.price ?? ""),
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const price = Number(form.price);
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError("El precio debe ser un número mayor o igual a 0.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        id: initialProduct?.id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        imagesFiles: form.imagesFiles.trim(),
        price,
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Editar producto" : "Nuevo producto"}</h3>

      <label>
        Nombre
        <input value={form.name} onChange={handleChange("name")} required />
      </label>

      <label>
        Descripción
        <textarea value={form.description} onChange={handleChange("description")} rows={2} />
      </label>

      <div className="form-row">
        <label>
          Precio
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange("price")}
            required
          />
        </label>
        <label>
          Categorías (separadas por coma)
          <input value={form.category} onChange={handleChange("category")} placeholder="ropa, ofertas" />
        </label>
      </div>

      <label>
        URL de imagen (opcional)
        <input value={form.imagesFiles} onChange={handleChange("imagesFiles")} placeholder="https://..." />
      </label>

      {error && <p role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
