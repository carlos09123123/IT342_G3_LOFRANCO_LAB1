import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
const API_BASE_URL_ADMIN = import.meta.env.VITE_API_BASE_URL_ADMIN;

const AdminUsers = () => {
  const [username, setUsername] = useState('Admin');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL_ADMIN}/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.userId);
    setEditForm({
      username: user.username,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role || ''
    });
  };

  const handleUpdate = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password;
      }
  
      const response = await axios.put(
        `${API_BASE_URL_ADMIN}/update/${userId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 204) {
        fetchUsers();
        setEditingId(null);
      } else {
        throw new Error("Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data || err.message || "Failed to update user");
    }
  };
  
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the user "${users.find(u => u.userId === userId)?.username}"?`
    );
    
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      const response = await axios.delete(
        `${API_BASE_URL_ADMIN}/delete/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 204) {
        fetchUsers();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data || err.message || "Failed to delete user");
    }
  };

  const handleLogout = () => {
    console.log('Admin logged out');
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-6xl animate-pulse mb-4">👥</div>
        <h2 className="text-2xl font-bold text-red-700">Loading Zootopia Users...</h2>
        <p className="text-gray-500 mt-2">Gathering all users for you!</p>
      </div>
    </div>
  );

  if (error) return <div>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-800">User Management</h2>
          <button 
            onClick={() => navigate('/adminDashboard')}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-red-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="border border-red-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="border border-red-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="border border-red-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      user.firstName || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="border border-red-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      user.lastName || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="border border-red-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(user.userId)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.userId)}
                          className="px-3 py-1 bg-red-800 text-white rounded hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-1"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;