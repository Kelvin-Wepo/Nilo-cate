import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'citizen',
    phone_number: '',
    location: '',
    // Ranger-specific fields
    certification_number: '',
    years_of_experience: '',
    assigned_forest: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Clean up the data before sending
      const cleanData = { ...formData };
      
      // Remove empty strings and convert to null for optional fields
      if (cleanData.certification_number === '') delete cleanData.certification_number;
      if (cleanData.years_of_experience === '') delete cleanData.years_of_experience;
      if (cleanData.assigned_forest === '') delete cleanData.assigned_forest;
      if (cleanData.specialization === '') delete cleanData.specialization;
      if (cleanData.phone_number === '') delete cleanData.phone_number;
      if (cleanData.location === '') delete cleanData.location;
      
      await authService.register(cleanData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.years_of_experience?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Registration Successful!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-forest-green text-center mb-8">
          Join Nilocate
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-center">I am registering as: *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, user_type: 'citizen' })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.user_type === 'citizen'
                    ? 'border-leaf-green bg-green-50 text-forest-green'
                    : 'border-gray-300 hover:border-leaf-green'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-bold">Citizen</div>
                <div className="text-sm text-gray-600">Community member</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, user_type: 'ranger' })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.user_type === 'ranger'
                    ? 'border-leaf-green bg-green-50 text-forest-green'
                    : 'border-gray-300 hover:border-leaf-green'
                }`}
              >
                <div className="text-3xl mb-2">🛡️</div>
                <div className="font-bold">Ranger</div>
                <div className="text-sm text-gray-600">Forest guardian</div>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                required
                minLength="8"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Confirm Password *</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Phone Number {formData.user_type === 'ranger' && '*'}
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+254712345678"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                required={formData.user_type === 'ranger'}
              />
              {formData.user_type === 'ranger' && (
                <p className="text-xs text-gray-500 mt-1">Required for SMS alerts</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Nairobi"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
              />
            </div>
          </div>

          {/* Ranger-specific fields */}
          {formData.user_type === 'ranger' && (
            <div className="border-t-2 border-green-200 pt-4 mb-6">
              <h3 className="text-lg font-bold text-forest-green mb-4">🛡️ Ranger Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Certification Number</label>
                  <input
                    type="text"
                    name="certification_number"
                    value={formData.certification_number || ''}
                    onChange={handleChange}
                    placeholder="e.g., RGR-2024-001"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience || ''}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Assigned Forest Area</label>
                  <input
                    type="text"
                    name="assigned_forest"
                    value={formData.assigned_forest || ''}
                    onChange={handleChange}
                    placeholder="e.g., Karura Forest"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-leaf-green"
                  >
                    <option value="">Select specialization</option>
                    <option value="Wildlife Protection">Wildlife Protection</option>
                    <option value="Fire Management">Fire Management</option>
                    <option value="Tree Health Monitoring">Tree Health Monitoring</option>
                    <option value="Community Engagement">Community Engagement</option>
                    <option value="Incident Response">Incident Response</option>
                    <option value="Conservation Education">Conservation Education</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-leaf-green text-white py-3 rounded-lg hover:bg-forest-green transition disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-leaf-green hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
