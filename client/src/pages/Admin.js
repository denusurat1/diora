import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from the server
  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(response => setProducts(response.data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  // Handle adding or updating a product
  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:3001/api/products/${editingProduct._id}`, {
          name,
          description,
          price: parseFloat(price),
          image
        });
        alert('Product updated successfully');
      } else {
        await axios.post('http://localhost:3001/api/products', {
          name,
          description,
          price: parseFloat(price),
          image
        });
        alert('Product added successfully');
      }
      const response = await axios.get('http://localhost:3001/api/products');
      setProducts(response.data);
      setName('');
      setDescription('');
      setPrice('');
      setImage('');
      setEditingProduct(null);
    } catch (err) {
      alert('Error saving product');
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/products/${id}`);
      alert('Product deleted successfully');
      setProducts(products.filter(product => product._id !== id));
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Handle editing a product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setImage(product.image);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Panel</h1>
      <div style={{ marginBottom: '2rem' }}>
        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ margin: '0.5rem' }} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ margin: '0.5rem' }} />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={{ margin: '0.5rem' }} />
        <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} style={{ margin: '0.5rem' }} />
        <button onClick={handleSaveProduct} style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '1rem', cursor: 'pointer' }}>
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </div>

      <h3>Existing Products</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td><img src={product.image} alt={product.name} style={{ width: '50px' }} /></td>
              <td>
                <button onClick={() => handleEditProduct(product)} style={{ marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDeleteProduct(product._id)} style={{ backgroundColor: 'red', color: '#fff' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
