'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogOut, Mail, ChevronDown, ChevronUp, Trash2, Edit2, X, Check, ShieldPlus, ShieldCheck, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/lib/database.types';

type Enquiry = Database['public']['Tables']['enquiries']['Row'];
type UserRole = Database['public']['Tables']['user_profiles']['Row']['role'];

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addAdminResult, setAddAdminResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setAuthenticated(!!session);
      if (session) {
        await loadCurrentUserRole(session.user.id);
        loadEnquiries();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setAuthenticated(!!session);
      if (session) {
        loadCurrentUserRole(session.user.id);
        loadEnquiries();
      } else {
        setCurrentUserRole(null);
        setEnquiries([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCurrentUserRole = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setCurrentUserRole(data.role as UserRole);
    }
  };

  const loadEnquiries = async () => {
    if (!session || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      setEnquiries(data || []);
    } catch (err) {
      setError('Failed to load enquiries. Please try again.');
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setIsSendingLink(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      setError('Check your email for the magic link!');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setAuthenticated(false);
    setCurrentUserRole(null);
    setEnquiries([]);
    setError(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const startEdit = (enquiry: Enquiry) => {
    setEditingId(enquiry.id);
    setEditData({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone || '',
      shoot_type: enquiry.shoot_type,
      event_date: enquiry.event_date ? new Date(enquiry.event_date).toISOString().split('T')[0] : '',
      budget: enquiry.budget || '',
      message: enquiry.message,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    if (!supabase || !session) return;
    try {
      const { error } = await supabase.from('enquiries')
        .update({
          name: editData.name,
          email: editData.email,
          phone: editData.phone || null,
          shoot_type: editData.shoot_type,
          event_date: editData.event_date || null,
          budget: editData.budget || null,
          message: editData.message,
        })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      setEditData({});
      await loadEnquiries();
    } catch (err) {
      setError('Failed to update enquiry.');
    }
  };

  const confirmDelete = async (id: string) => {
    if (!supabase || !session) return;
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirm(null);
      await loadEnquiries();
    } catch (err) {
      setError('Failed to delete enquiry.');
      setDeleteConfirm(null);
    }
  };

  const openAddAdminModal = () => {
    setAdminEmail('');
    setAddAdminResult(null);
    setShowAddAdminModal(true);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !session || !adminEmail.trim()) return;
    setAddingAdmin(true);
    setAddAdminResult(null);
    try {
      // Find user by email in auth.users
      const { data: authUsers, error: authErr } = await supabase.rpc('get_user_by_email', { email_input: adminEmail }) as any;
      // If RPC doesn't exist, we'll just call promote_to_admin directly — but it needs a UUID
      // Alternative: query the email column from user_profiles
      const { data: profiles, error: profileErr } = await supabase
        .from('user_profiles')
        .select('id, email')
        .ilike('email', adminEmail)
        .limit(5);

      if (profileErr) throw profileErr;

      if (!profiles || profiles.length === 0) {
        setAddAdminResult({ ok: false, msg: `No user found with email "${adminEmail}". The user must have an account first.` });
        setAddingAdmin(false);
        return;
      }

      // Check if user has a corresponding auth.users record
      let targetUserId: string | null = null;
      for (const p of profiles) {
        const { data: authData } = await supabase.auth.admin.getUserById(p.id);
        // Just use the profile id directly
        targetUserId = p.id;
        break;
      }

      if (!targetUserId) {
        setAddAdminResult({ ok: false, msg: 'Could not find a matching user.' });
        setAddingAdmin(false);
        return;
      }

      // Use security-definer function to promote
      const { error: promErr } = await supabase.rpc('promote_to_admin', { user_uuid: targetUserId });
      if (promErr) throw promErr;

      setAddAdminResult({ ok: true, msg: `Successfully promoted ${adminEmail} to admin!` });
      setAdminEmail('');
      setTimeout(() => setShowAddAdminModal(false), 2000);
    } catch (err) {
      setAddAdminResult({ ok: false, msg: err instanceof Error ? err.message : 'Failed to add admin.' });
    } finally {
      setAddingAdmin(false);
    }
  };

  const isSuperAdmin = currentUserRole === 'super_admin';
  const isAdminOrAbove = currentUserRole === 'admin' || currentUserRole === 'super_admin';

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter your email to receive a sign-in link
            </p>
            <form onSubmit={handleSignIn}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingLink}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isSendingLink ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Mail size={18} /> Send Sign-In Link</>
                )}
              </button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              An authenticated administrator account is required. Contact the site owner to get access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminOrAbove) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
            <ShieldCheck className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your account does not have admin privileges.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Contact the site administrator to request access.
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-primary-600 hover:text-primary-700 underline"
            >
              Sign out
            </button>
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
              <img
                src="/logo.png"
                alt="TUMTUM PHOTOS logo"
                className="h-8 w-8 rounded-full object-contain"
              />
              <span className="font-serif font-bold text-xl tracking-tight">
                TUMTUM <span className="text-primary-600">PHOTOS</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Admin Dashboard</span>
                {isSuperAdmin && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Super Admin
                  </span>
                )}
                {!isSuperAdmin && currentUserRole === 'admin' && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Admin
                  </span>
                )}
              </div>
              <button onClick={handleSignOut} className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 hover:underline transition-colors flex items-center gap-1">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bookings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage enquiries for graduation photography shoots</p>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                onClick={openAddAdminModal}
                className="text-sm bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md transition-colors flex items-center gap-1"
              >
                <ShieldPlus size={14} /> Add Admin
              </button>
            )}
            <button onClick={loadEnquiries} disabled={loading} className="text-sm bg-primary-600 hover:bg-primary-700 text-white py-1.5 px-4 rounded-md transition-colors disabled:opacity-50">
              Refresh
            </button>
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
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Loading enquiries...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No enquiries found. Bookings will appear here when customers submit the enquiry form.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-10"></th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Shoot Type</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Event Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Received</th>
                    <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {enquiries.map((enquiry) => (
                    <>
                      <tr key={enquiry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <button onClick={() => toggleExpand(enquiry.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            {expandedId === enquiry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                          {editingId === enquiry.id ? (
                            <input type="text" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                          ) : enquiry.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                          {editingId === enquiry.id ? (
                            <input type="email" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
                          ) : enquiry.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 capitalize">
                          {editingId === enquiry.id ? (
                            <select value={editData.shoot_type || ''} onChange={(e) => setEditData({ ...editData, shoot_type: e.target.value })} className="border rounded px-2 py-1 text-sm">
                              <option value="solo">Solo</option>
                              <option value="duo">Duo</option>
                              <option value="group">Group</option>
                              <option value="after-party">After Party</option>
                              <option value="dinner">Dinner</option>
                              <option value="location">Location</option>
                              <option value="other">Other</option>
                            </select>
                          ) : enquiry.shoot_type.replace('-', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                          {editingId === enquiry.id ? (
                            <input type="date" value={editData.event_date || ''} onChange={(e) => setEditData({ ...editData, event_date: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                          ) : enquiry.event_date ? new Date(enquiry.event_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                          {new Date(enquiry.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-600">
                          <div className="flex gap-2">
                            {editingId === enquiry.id ? (
                              <>
                                <button onClick={() => saveEdit(enquiry.id)} className="text-green-600 hover:text-green-700" title="Save"><Check size={16} /></button>
                                <button onClick={cancelEdit} className="text-red-600 hover:text-red-700" title="Cancel"><X size={16} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(enquiry)} className="text-blue-600 hover:text-blue-700" title="Edit"><Edit2 size={16} /></button>
                                {deleteConfirm === enquiry.id ? (
                                  <>
                                    <button onClick={() => confirmDelete(enquiry.id)} className="text-red-600 hover:text-red-700" title="Confirm Delete"><Check size={16} /></button>
                                    <button onClick={() => setDeleteConfirm(null)} className="text-gray-600 hover:text-gray-700" title="Cancel"><X size={16} /></button>
                                  </>
                                ) : (
                                  <button onClick={() => setDeleteConfirm(enquiry.id)} className="text-red-600 hover:text-red-700" title="Delete"><Trash2 size={16} /></button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedId === enquiry.id && (
                        <tr key={`${enquiry.id}-detail`}>
                          <td colSpan={7} className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong className="text-sm text-gray-700 dark:text-gray-300">Phone:</strong>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{enquiry.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <strong className="text-sm text-gray-700 dark:text-gray-300">Budget:</strong>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{enquiry.budget ? enquiry.budget.replace('-', ' GHC ') : 'Not specified'}</p>
                              </div>
                              <div className="col-span-2">
                                <strong className="text-sm text-gray-700 dark:text-gray-300">Message:</strong>
                                <p className="text-sm text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{enquiry.message}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldPlus className="text-purple-600" size={20} />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Admin</h2>
              </div>
              <button onClick={() => setShowAddAdminModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Enter the email of the user you want to promote to admin. They must already have an account.
            </p>
            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 rounded-md py-2 px-3 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              {addAdminResult && (
                <p className={`text-sm mb-3 ${addAdminResult.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {addAdminResult.msg}
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAdmin || !adminEmail.trim()}
                  className="text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-1.5 px-4 rounded-md transition-colors flex items-center gap-1"
                >
                  {addingAdmin ? <><Loader2 className="h-3 w-3 animate-spin" /> Promoting...</> : 'Promote to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
