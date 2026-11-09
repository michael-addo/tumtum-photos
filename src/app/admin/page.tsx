'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenProvided, setTokenProvided] = useState(false);

  // Read token from URL query param on load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setTokenProvided(true);
    }
  }, []);

  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/enquiries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Invalid admin token. Please enter a valid token.');
        } else {
          const err = await res.json();
          setError(err.message || 'Failed to load enquiries');
        }
        setEnquiries([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError('Failed to load enquiries. Please try again.');
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please enter an admin token.');
      return;
    }

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    window.history.pushState(null, '', url.toString());

    loadEnquiries();
    setTokenProvided(true);
  };

  const handleLogout = () => {
    setToken('');
    setTokenProvided(false);
    setEnquiries([]);
    setError(null);
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.pushState(null, '', url.toString());
  };

  if (!tokenProvided) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your admin token to manage bookings
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your admin token"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Load Dashboard
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Keep your admin token secret. Set ADMIN_TOKEN in your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">
                TUMTUM <span className="text-primary-600">PHOTOS</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Admin Dashboard
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 hover:underline transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bookings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage enquiries for graduation photography shoots
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {enquiries.length} enquiry{enquiries.length !== 1 ? 'ies' : ''}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
              Loading enquiries...
            </span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No enquiries found. Bookings will appear here when customers submit the enquiry form.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    ID
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Shoot Type
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Event Date
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                      {enquiry.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                      {enquiry.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                      {enquiry.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {enquiry.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 capitalize">
                      {enquiry.shootType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            &copy; {new Date().getFullYear()} TUMTUM PHOTOS Admin Panel
          </p>
        </div>
      </footer>
    </div>
  );
}