import { useState, useEffect, useCallback } from 'react';
import { User, Edit2, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, UserRole, Notification, TrainingEnrollment } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    mobile_number: profile?.mobile_number || '',
    address: profile?.address || '',
    role: profile?.role || ('farmer' as UserRole),
  });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    setNotifications(data || []);
  }, [user]);

  const fetchEnrollments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('training_enrollments')
      .select('*, trainings(*)')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching enrollments:', error);
      return;
    }
    setEnrollments(data || []);
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    await fetchNotifications();
  }, [fetchNotifications]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update(formData).eq('id', user.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchEnrollments();
    }
  }, [user, fetchNotifications, fetchEnrollments]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-8 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
                <p className="text-green-200">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {!editing ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                    <p className="text-gray-900 font-medium mt-1">{profile?.full_name || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Mobile</label>
                    <p className="text-gray-900 font-medium mt-1">{profile?.mobile_number || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                    <p className="text-gray-900 font-medium mt-1 capitalize">{profile?.role?.replace('_', ' ') || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                    <p className="text-gray-900 font-medium mt-1">{profile?.address || '—'}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Courses and Notifications */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
            {enrollments.length === 0 ? (
              <p className="text-gray-500 text-sm">No course enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">{enrollment.trainings?.title}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enrollment.status === 'accepted' ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 text-sm">{notification.message}</p>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark as Read
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
