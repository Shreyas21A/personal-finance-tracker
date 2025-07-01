import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token },
        });
        setCategories(res.data);
      } catch (error) {
        console.error(error.response.data);
        alert('Failed to fetch categories: ' + error.response.data.message);
      }
    };
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name },
        { headers: { 'x-auth-token': token } }
      );
      setCategories([...categories, res.data]);
      setName('');
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to add category: ' + error.response.data.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      console.error(error.response.data);
      alert('Failed to delete category: ' + error.response.data.message);
    }
  };

  return (
    <div className="container">
      <h3>Manage Categories</h3>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Add Category</button>
      </form>
      <ul>
        {categories.map((category) => (
          <li key={category._id}>
            {category.name}
            <button onClick={() => handleDelete(category._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
