import { useEffect, useState } from "react";
import axios from "axios";

// Backend API URL
const API_URL = "http://127.0.0.1:8000/products/";

// Empty form
const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
};

function App() {
  // All products
  const [products, setProducts] = useState([]);

  // Form data
  const [form, setForm] = useState(initialForm);

  // Which product is being edited?
  const [editingId, setEditingId] = useState(null);

  // Loading status
  const [loading, setLoading] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Success message
  const [message, setMessage] = useState("");

  // ==================================
  // 1. READ - GET ALL PRODUCTS
  // ==================================

  async function getProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        params: {
          skip: 0,
          limit: 100,
        },
      });

      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load products when component starts
  useEffect(() => {
    getProducts();
  }, []);

  // ==================================
  // 2. HANDLE INPUT CHANGE
  // ==================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  // ==================================
  // RESET FORM
  // ==================================

  function resetForm() {
    setForm(initialForm);

    setEditingId(null);

    setError("");

    setMessage("");
  }

  // ==================================
  // 3. CREATE AND UPDATE
  // ==================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    // Prepare data
    const productData = {
      name: form.name.trim(),

      description: form.description.trim() || null,

      price: Number(form.price),

      stock: Number(form.stock),
    };

    try {
      if (editingId === null) {
        // CREATE - POST

        await axios.post(API_URL, productData);

        setMessage("Product created successfully!");
      } else {
        // UPDATE - PUT

        await axios.put(`${API_URL}${editingId}`, productData);

        setMessage("Product updated successfully!");
      }

      // Reset form
      resetForm();

      // Refresh product list
      await getProducts();
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else {
        setError(detail || err.message);
      }
    }
  }

  // ==================================
  // 4. EDIT PRODUCT
  // ==================================

  function handleEdit(product) {
    // Set existing product ID
    setEditingId(product.id);

    // Fill form with existing data
    setForm({
      name: product.name,

      description: product.description || "",

      price: String(product.price),

      stock: String(product.stock),
    });

    setError("");
    setMessage("");
  }

  // ==================================
  // 5. DELETE PRODUCT
  // ==================================

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      // DELETE request
      await axios.delete(`${API_URL}${id}`);

      setMessage("Product deleted successfully!");

      // If deleting currently edited product
      if (editingId === id) {
        resetForm();
      }

      // Refresh list
      await getProducts();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // ==================================
  // FRONTEND UI
  // ==================================

  return (
    <div>
      <h1>Product Management System</h1>

      <hr />

      {/* SUCCESS MESSAGE */}

      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* ERROR MESSAGE */}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* PRODUCT FORM */}

      <h2>{editingId === null ? "Add New Product" : "Edit Product"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name: </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            minLength="2"
            maxLength="100"
            placeholder="Enter product name"
            required
          />
        </div>
        <br />
        <div>
          <label>Description: </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description"
          />
        </div>
        <br />
        <div>
          <label>Price: </label>

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            placeholder="Enter price"
            required
          />
        </div>
        <br />
        <div>
          <label>Stock: </label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            step="1"
            required
          />
        </div>
        <br />
        <button type="submit">
          {editingId === null ? "Add Product" : "Update Product"}
        </button>{" "}
        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <hr />

      {/* PRODUCT TABLE */}

      <h2>All Products</h2>

      <button type="button" onClick={getProducts}>
        Refresh Products
      </button>

      <br />
      <br />

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>

              <th>Name</th>

              <th>Description</th>

              <th>Price</th>

              <th>Stock</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6">No Products Found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>

                  <td>{product.name}</td>

                  <td>{product.description || "-"}</td>

                  <td>{product.price}</td>

                  <td>{product.stock}</td>

                  <td>
                    <button type="button" onClick={() => handleEdit(product)}>
                      Edit
                    </button>{" "}
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
