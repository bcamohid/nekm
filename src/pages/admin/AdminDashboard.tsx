import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, BookOpen, ShoppingBag, BarChart3, Package, IndianRupee, MapPin, Phone, User as UserIcon, X, MessageSquare, CheckCircle, Mail } from 'lucide-react';
import { supabase, Training, ShopItem, TrainingEnrollment, Order, HelpMessage } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { session } = useAuth();
  
  // --- STATE DECLARATIONS ---
  const [stats, setStats] = useState({ profiles: 0, services: 0, trainings: 0, shop: 0, orders: 0, help: 0 });
  const [profiles, setProfiles] = useState<Array<{
    id: string;
    full_name: string;
    email_address: string;
    role: string;
    created_at: string;
  }>>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Panels
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);
  const [showShopPanel, setShowShopPanel] = useState(false);
  const [showEnrollmentPanel, setShowEnrollmentPanel] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Forms & Editing
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [trainingError, setTrainingError] = useState('');
  const [trainingSuccess, setTrainingSuccess] = useState('');
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState({
    title: '', description: '', duration: '', mode: 'offline', image_url: '', display_order: 0, is_active: true,
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopError, setShopError] = useState('');
  const [shopSuccess, setShopSuccess] = useState('');
  const [shopForm, setShopForm] = useState({
    name: '', description: '', price: 0, image_url: '', category: '', stock_quantity: 0, display_order: 0, is_active: true,
  });

  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    async function initData() {
      setLoading(true);
      await Promise.all([
        fetchStats(), 
        fetchTrainings(), 
        fetchProfiles(), 
        fetchShopItems(), 
        fetchEnrollments(), 
        fetchOrders(),
        fetchHelpMessages()
      ]);
      setLoading(false);
    }
    initData();
  }, []);

  // --- FETCH FUNCTIONS ---
  async function fetchStats() {
    const [profilesData, servicesData, trainingsCount, shopData, ordersData, helpData] = await Promise.all([
      supabase.from('user_details').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('trainings').select('id', { count: 'exact', head: true }),
      supabase.from('shop_items').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('help').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      profiles: profilesData.count || 0,
      services: servicesData.count || 0,
      trainings: trainingsCount.count || 0,
      shop: shopData.count || 0,
      orders: ordersData.count || 0,
      help: helpData.count || 0,
    });
  }

  async function fetchTrainings() {
    const { data, error } = await supabase.from('trainings').select('*').order('display_order', { ascending: true });
    if (error) { setTrainingError(error.message); return; }
    setTrainings(data || []);
  }

  async function fetchProfiles() {
    const { data, error } = await supabase.from('user_details').select('id, full_name, email_address, role, created_at').order('created_at', { ascending: false });
    if (error) return;
    setProfiles(data || []);
  }

  async function fetchShopItems() {
    const { data, error } = await supabase.from('shop_items').select('*').order('display_order', { ascending: true });
    if (error) { setShopError(error.message); return; }
    setShopItems(data || []);
  }

  async function fetchEnrollments() {
    const { data, error } = await supabase.from('training_enrollments').select('*, trainings(*)');
    if (error) { console.error('Error fetching enrollments:', error); return; }
    setEnrollments(data || []);
  }

  async function fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching orders:', error); return; }
    setOrders(data || []);
  }

  async function fetchHelpMessages() {
    const { data, error } = await supabase.from('help').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching help messages:', error); return; }
    setHelpMessages(data || []);
  }

  // --- HELP MESSAGE HANDLERS ---
  async function handleResolveHelp(msg: HelpMessage) {
    const { error } = await supabase.from('help').update({ status: 'resolved' }).eq('id', msg.id);
    if (!error) {
      if (msg.user_id) {
        await supabase.from('notifications').insert([{
          user_id: msg.user_id,
          message: `Support Update: Your message regarding "${msg.subject}" has been answered and resolved by our team!`,
          is_read: false
        }]);
      }
      fetchHelpMessages();
    }
  }

  // --- TRAINING HANDLERS ---
  function resetTrainingForm() {
    setTrainingForm({ title: '', description: '', duration: '', mode: 'offline', image_url: '', display_order: 0, is_active: true });
    setEditingTrainingId(null);
    setTrainingError('');
    setTrainingSuccess('');
  }

  async function handleTrainingSubmit() {
    setTrainingError('');
    setTrainingSuccess('');

    if (!trainingForm.title || !trainingForm.description || !trainingForm.duration) {
      setTrainingError('Please fill title, description, and duration.');
      return;
    }

    const payload = {
      title: trainingForm.title,
      description: trainingForm.description,
      duration: trainingForm.duration,
      mode: trainingForm.mode,
      image_url: trainingForm.image_url,
      display_order: Number(trainingForm.display_order) || 0,
      is_active: trainingForm.is_active,
    };

    if (editingTrainingId) {
      const { error } = await supabase.from('trainings').update(payload).eq('id', editingTrainingId);
      if (error) { setTrainingError(error.message); return; }
      setTrainingSuccess('Training course updated successfully.');
    } else {
      const { error } = await supabase.from('trainings').insert([payload]);
      if (error) { setTrainingError(error.message); return; }
      setTrainingSuccess('New training course added successfully.');
    }

    await Promise.all([fetchTrainings(), fetchStats()]);
    resetTrainingForm();
  }

  async function handleTrainingDelete(id: string) {
    setTrainingError('');
    setTrainingSuccess('');
    const { error } = await supabase.from('trainings').delete().eq('id', id);
    if (error) { setTrainingError(error.message); return; }
    setTrainingSuccess('Training course deleted successfully.');
    await Promise.all([fetchTrainings(), fetchStats(), fetchProfiles()]);
  }

  function handleTrainingEdit(training: Training) {
    setEditingTrainingId(training.id);
    setTrainingForm({
      title: training.title, description: training.description, duration: training.duration,
      mode: training.mode, image_url: training.image_url, display_order: training.display_order, is_active: training.is_active,
    });
    setTrainingError('');
    setTrainingSuccess('');
  }

  // --- SHOP HANDLERS ---
  function resetShopForm() {
    setShopForm({ name: '', description: '', price: 0, image_url: '', category: '', stock_quantity: 0, display_order: 0, is_active: true });
    setEditingShopId(null);
    setShopError('');
    setShopSuccess('');
  }

  async function handleShopSubmit() {
    setShopError('');
    setShopSuccess('');

    if (!shopForm.name || !shopForm.description || !shopForm.category) {
      setShopError('Please fill name, description, and category.');
      return;
    }

    const payload = {
      name: shopForm.name,
      description: shopForm.description,
      price: Number(shopForm.price) || 0,
      image_url: shopForm.image_url,
      category: shopForm.category,
      stock_quantity: Number(shopForm.stock_quantity) || 0,
      display_order: Number(shopForm.display_order) || 0,
      is_active: shopForm.is_active,
    };

    if (editingShopId) {
      const { error } = await supabase.from('shop_items').update(payload).eq('id', editingShopId);
      if (error) { console.error('Error updating shop item:', error); setShopError(error.message); return; }
      setShopSuccess('Shop item updated successfully.');
    } else {
      const { error } = await supabase.from('shop_items').insert([payload]);
      if (error) { console.error('Error inserting shop item:', error); setShopError(error.message); return; }
      setShopSuccess('New shop item added successfully.');
    }

    await Promise.all([fetchShopItems(), fetchStats()]);
    resetShopForm();
  }

  async function handleShopDelete(id: string) {
    setShopError('');
    setShopSuccess('');
    const { error } = await supabase.from('shop_items').delete().eq('id', id);
    if (error) { console.error('Error deleting shop item:', error); setShopError(error.message); return; }
    setShopSuccess('Shop item deleted successfully.');
    await Promise.all([fetchShopItems(), fetchStats()]);
  }

  function handleShopEdit(item: ShopItem) {
    setEditingShopId(item.id);
    setShopForm({
      name: item.name, description: item.description, price: item.price, image_url: item.image_url,
      category: item.category, stock_quantity: item.stock_quantity, display_order: item.display_order, is_active: item.is_active,
    });
    setShopError('');
    setShopSuccess('');
    setShowShopPanel(true);
    setShowTrainingPanel(false);
  }

  // --- ENROLLMENT HANDLERS ---
  async function acceptEnrollment(enrollment: TrainingEnrollment) {
    const { error: updateError } = await supabase.from('training_enrollments').update({ status: 'accepted' }).eq('id', enrollment.id);
    if (updateError) { console.error('Error updating enrollment:', updateError); return; }

    const { error: notificationError } = await supabase.from('notifications').insert([{
      user_id: enrollment.user_id,
      message: `Your enrollment for ${enrollment.trainings?.title} has been ACCEPTED!`,
      is_read: false,
    }]);
    if (notificationError) { console.error('Error creating notification:', notificationError); return; }

    await fetchEnrollments();
  }

  async function handleDeleteEnrollment(enrollment: TrainingEnrollment) {
    const isConfirmed = window.confirm(`Are you sure you want to remove the enrollment for ${enrollment.full_name}?`);
    if (!isConfirmed) return;

    try {
      const { error: deleteError } = await supabase.from('training_enrollments').delete().eq('id', enrollment.id);
      if (deleteError) { console.error("Supabase Delete Error:", deleteError); alert("Database Error: " + deleteError.message); return; }

      const { error: notifyError } = await supabase.from('notifications').insert([{
        user_id: enrollment.user_id,
        message: `Your enrollment for the course "${enrollment.trainings?.title}" has been rejected/removed by the admin.`,
        is_read: false
      }]);
      if (notifyError) console.error("Failed to send notification:", notifyError.message);

      await fetchEnrollments();
      alert("Enrollment deleted successfully!");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    }
  }

  // --- ORDER HANDLERS ---
  async function handleAcceptOrder(order: Order) {
    const { error: acceptError } = await supabase.from('orders').update({ status: 'accepted' }).eq('id', order.id);
    if (acceptError) { console.error('Error accepting order:', acceptError); return; }

    const { error: notifyError } = await supabase.from('notifications').insert([{
      user_id: order.user_id,
      message: 'Your order has been accepted and is being processed!',
      is_read: false,
    }]);
    if (notifyError) console.error('Error creating notification:', notifyError.message);

    await fetchOrders();
  }

  async function handleDeleteOrder(order: Order) {
    const isConfirmed = window.confirm(`Are you sure you want to delete the order for ${order.full_name}?`);
    if (!isConfirmed) return;

    const { error: deleteError } = await supabase.from('orders').delete().eq('id', order.id);
    if (deleteError) { console.error('Error deleting order:', deleteError); alert('Error deleting order: ' + deleteError.message); return; }

    const { error: notifyError } = await supabase.from('notifications').insert([{
      user_id: order.user_id,
      message: 'Your order has been cancelled.',
      is_read: false,
    }]);
    if (notifyError) console.error('Error creating notification:', notifyError.message);

    await fetchOrders();
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTrainingPanel(!showTrainingPanel);
                  setTrainingError(''); setTrainingSuccess('');
                  setShowShopPanel(false); setShowOrdersPanel(false); setShowEnrollmentPanel(false); setShowHelpPanel(false);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
              >
                {showTrainingPanel ? 'Hide Training Panel' : 'Training Courses'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowShopPanel(!showShopPanel);
                  setShopError(''); setShopSuccess('');
                  setShowTrainingPanel(false); setShowOrdersPanel(false); setShowEnrollmentPanel(false); setShowHelpPanel(false);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-amber-600 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                {showShopPanel ? 'Hide Shop Panel' : 'Shop Items'}
              </button>
              
              {/* UPDATED: Manage Enrollments button with Badge Notification */}
              <button
                type="button"
                onClick={() => {
                  setShowEnrollmentPanel(!showEnrollmentPanel);
                  setShowTrainingPanel(false); setShowShopPanel(false); setShowOrdersPanel(false); setShowHelpPanel(false);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {showEnrollmentPanel ? 'Hide Enrollments' : 'Manage Enrollments'}
                {enrollments.filter(e => e.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {enrollments.filter(e => e.status === 'pending').length}
                  </span>
                )}
              </button>

              {/* UPDATED: Manage Orders button with Badge Notification */}
              <button
                type="button"
                onClick={() => {
                  setShowOrdersPanel(!showOrdersPanel);
                  setShowTrainingPanel(false); setShowShopPanel(false); setShowEnrollmentPanel(false); setShowHelpPanel(false);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                {showOrdersPanel ? 'Hide Orders' : 'Manage Orders'}
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </button>
              
              {/* HELP BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setShowHelpPanel(!showHelpPanel);
                  setShowTrainingPanel(false); setShowShopPanel(false); setShowOrdersPanel(false); setShowEnrollmentPanel(false);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-purple-600 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
              >
                {showHelpPanel ? 'Hide Help' : 'Help Messages'}
                {helpMessages.filter(m => m.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {helpMessages.filter(m => m.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasswordError(''); setPasswordSuccess('');
                  setChangingPassword(!changingPassword);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {changingPassword ? 'Cancel Password Change' : 'Change Password'}
              </button>
            </div>
          </div>
          <p className="text-gray-500">Manage your platform content and settings</p>
        </div>

        {/* PASSWORD CHANGE PANEL */}
        {changingPassword && (
          <div className="mb-8 rounded-xl border border-green-100 bg-green-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Update password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter a new password to update it in Supabase. This works only for authenticated Supabase users.
            </p>
            {passwordSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-800">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-800">
                {passwordError}
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setPasswordError('');
                setPasswordSuccess('');
                if (!session) { setPasswordError('Password updates require a valid Supabase session.'); return; }
                if (!newPassword || !confirmPassword) { setPasswordError('Please enter and confirm the new password.'); return; }
                if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) { setPasswordError(error.message); } else {
                  setPasswordSuccess('Password updated successfully in Supabase.');
                  setNewPassword(''); setConfirmPassword('');
                }
              }}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Save new password
            </button>
          </div>
        )}

        {/* --- HELP MESSAGES PANEL --- */}
        {showHelpPanel && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Customer Support Messages</h2>
            </div>

            {helpMessages.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-200">No support messages found.</p>
            ) : (
              <div className="grid gap-4">
                {helpMessages.map((msg) => (
                  <div key={msg.id} className={`p-6 rounded-xl border transition-all ${msg.status === 'resolved' ? 'bg-gray-50 border-gray-200' : 'bg-white border-purple-200 shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{msg.subject}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${msg.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{msg.status}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">{msg.message}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><UserIcon className="w-4 h-4"/> {msg.name}</span>
                          <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {msg.email}</span>
                          <span>Received: {new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {msg.status === 'pending' && (
                        <button 
                          onClick={() => handleResolveHelp(msg)}
                          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TRAINING PANEL --- */}
        {showTrainingPanel && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Training Courses</h2>
                <p className="text-gray-500 text-sm">Add, edit, and remove training courses stored in Supabase.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetTrainingForm();
                  setTrainingError('');
                  setTrainingSuccess('');
                }}
                className="inline-flex items-center justify-center rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
              >
                New Training Course
              </button>
            </div>

            {trainingSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {trainingSuccess}
              </div>
            )}
            {trainingError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {trainingError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Form</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={trainingForm.title}
                      onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      placeholder="Training title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={trainingForm.description}
                      onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      rows={4}
                      placeholder="Training description"
                    />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                      <input
                        type="text"
                        value={trainingForm.duration}
                        onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                        placeholder="e.g. 4 weeks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode</label>
                      <select
                        value={trainingForm.mode}
                        onChange={(e) => setTrainingForm({ ...trainingForm, mode: e.target.value as Training['mode'] })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                      <input
                        type="text"
                        value={trainingForm.image_url}
                        onChange={(e) => setTrainingForm({ ...trainingForm, image_url: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Display order</label>
                      <input
                        type="number"
                        value={trainingForm.display_order}
                        onChange={(e) => setTrainingForm({ ...trainingForm, display_order: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="training-active"
                      type="checkbox"
                      checked={trainingForm.is_active}
                      onChange={(e) => setTrainingForm({ ...trainingForm, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="training-active" className="text-sm text-gray-700">
                      Active training course
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleTrainingSubmit}
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      {editingTrainingId ? 'Update Training' : 'Add Training'}
                    </button>
                    {editingTrainingId && (
                      <button
                        type="button"
                        onClick={resetTrainingForm}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Trainings</h3>
                {trainings.length === 0 ? (
                  <p className="text-sm text-gray-500">No training courses found yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {trainings.map((training) => (
                      <div key={training.id} className="rounded-2xl border border-gray-200 p-4 hover:border-green-300">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-semibold text-gray-900">{training.title}</p>
                            <p className="text-sm text-gray-600">{training.duration} · {training.mode}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleTrainingEdit(training)}
                              className="inline-flex items-center justify-center rounded-lg border border-green-600 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTrainingDelete(training.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-red-600 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{training.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">Order: {training.display_order}</span>
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                            {training.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- SHOP PANEL --- */}
        {showShopPanel && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Shop Items</h2>
                <p className="text-gray-500 text-sm">Add, edit, and remove shop items stored in Supabase.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetShopForm();
                  setShopError('');
                  setShopSuccess('');
                }}
                className="inline-flex items-center justify-center rounded-lg border border-amber-600 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                New Product
              </button>
            </div>

            {shopSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {shopSuccess}
              </div>
            )}
            {shopError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {shopError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Form</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={shopForm.name}
                      onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                      rows={4}
                      placeholder="Product description"
                    />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                      <input
                        type="number"
                        value={shopForm.price}
                        onChange={(e) => setShopForm({ ...shopForm, price: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        value={shopForm.stock_quantity}
                        onChange={(e) => setShopForm({ ...shopForm, stock_quantity: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <input
                        type="text"
                        value={shopForm.category}
                        onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                        placeholder="e.g. Fertilizers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                      <input
                        type="number"
                        value={shopForm.display_order}
                        onChange={(e) => setShopForm({ ...shopForm, display_order: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                    <input
                      type="text"
                      value={shopForm.image_url}
                      onChange={(e) => setShopForm({ ...shopForm, image_url: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="shop-active"
                      type="checkbox"
                      checked={shopForm.is_active}
                      onChange={(e) => setShopForm({ ...shopForm, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="shop-active" className="text-sm text-gray-700">
                      Active product
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleShopSubmit}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                    >
                      {editingShopId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingShopId && (
                      <button
                        type="button"
                        onClick={resetShopForm}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Products</h3>
                {shopItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No shop items found yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {shopItems.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-gray-200 p-4 hover:border-amber-300">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Stock: {item.stock_quantity}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleShopEdit(item)}
                              className="inline-flex items-center justify-center rounded-lg border border-amber-600 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShopDelete(item.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-red-600 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">{item.category}</span>
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">Order: {item.display_order}</span>
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- ENROLLMENTS PANEL --- */}
        {showEnrollmentPanel && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Training Enrollments</h2>
                <p className="text-gray-500 text-sm">Review and manage training course enrollments.</p>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-500">No enrollments found yet.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="rounded-2xl border border-gray-200 p-4 hover:border-blue-300">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{enrollment.full_name}</p>
                        <p className="text-sm text-gray-600">{enrollment.email_address}</p>
                        <p className="text-sm text-gray-600">{enrollment.mobile_number}</p>
                        <p className="text-sm text-gray-600">{enrollment.address}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Course:</span> {enrollment.trainings?.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(enrollment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          enrollment.status === 'accepted' ? 'bg-green-50 text-green-700' :
                          enrollment.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                        {enrollment.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => acceptEnrollment(enrollment)}
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteEnrollment(enrollment)}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- ORDERS PANEL WITH DETAILED VIEW --- */}
        {showOrdersPanel && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No customer orders found yet.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-emerald-300 transition-all">
                    <div className="p-6">
                      <div className="grid md:grid-cols-4 gap-6">
                        {/* Order Identity */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                          <p className="text-sm font-mono font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                            {order.id}
                          </p>
                          <div className="pt-2">
                             <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                               order.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                               order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                             }`}>
                               {order.status}
                             </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                              <UserIcon className="w-4 h-4 text-emerald-600" /> {order.full_name}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                              <Phone className="w-3.5 h-3.5" /> {order.mobile_number}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                            <div className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed">
                              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> 
                              {order.address}
                            </div>
                          </div>
                        </div>

                        {/* Order Summary & Actions */}
                        <div className="flex flex-col justify-between items-end">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                            <p className="text-xl font-black text-emerald-700 flex items-center justify-end">
                              <IndianRupee className="w-5 h-5" /> {order.total_amount}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{order.payment_method}</p>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors"
                            >
                              View Items
                            </button>
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => handleAcceptOrder(order)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteOrder(order)}
                              className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STATS SUMMARY (When no panel is active) --- */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {!showOrdersPanel && !showTrainingPanel && !showShopPanel && !showEnrollmentPanel && !showHelpPanel && !changingPassword && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { icon: Users, label: 'Total Users', value: stats.profiles, color: 'blue' },
                    { icon: Package, label: 'Orders', value: stats.orders, color: 'emerald' },
                    { icon: BookOpen, label: 'Trainings', value: stats.trainings, color: 'purple' },
                    { icon: ShoppingBag, label: 'Products', value: stats.shop, color: 'amber' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className={`bg-white border rounded-xl p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-75">{label}</p>
                          <p className="text-3xl font-bold mt-2">{value}</p>
                        </div>
                        <Icon className="w-10 h-10 opacity-20" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      {[
                        { label: 'Manage Services', href: '#' },
                        { label: 'Manage Trainings', href: '#' },
                        { label: 'Manage Shop Items', href: '#' },
                        { label: 'View User Profiles', href: '#' },
                        { label: 'Update Contact Info', href: '#' },
                        { label: 'Edit About Page', href: '#' },
                      ].map((a) => (
                        <a
                          key={a.label}
                          href={a.href}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors"
                        >
                          {a.label}
                          <span className="text-xs">→</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Platform Info</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users:</span>
                        <span className="font-semibold text-gray-900">{stats.profiles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published Content:</span>
                        <span className="font-semibold text-gray-900">{stats.services + stats.trainings + stats.shop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-semibold text-green-600">Operational</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
                  {profiles.length === 0 ? (
                    <p className="text-sm text-gray-500">No users found yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="rounded-2xl border border-gray-200 p-4 hover:border-green-300">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-gray-900">{profile.full_name || 'Unknown user'}</p>
                              <p className="text-sm text-gray-600">{profile.email_address}</p>
                            </div>
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              {profile.role}
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-gray-500">ID: {profile.id}</p>
                          <p className="text-xs text-gray-500">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* --- SELECTED ORDER MODAL (POPUP) --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Order Details</h2>
                <p className="text-emerald-100 text-sm mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-emerald-100 hover:text-white bg-emerald-700 p-2 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Customer Details</h3>
                  <div className="space-y-3">
                    <p className="font-medium text-gray-900">{selectedOrder.full_name}</p>
                    <p className="text-gray-600 text-sm">{selectedOrder.mobile_number}</p>
                    <p className="text-gray-600 text-sm">{selectedOrder.address}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Payment Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500 text-sm">Method:</span> <span className="font-bold text-xs bg-gray-100 px-2 py-1 rounded">{selectedOrder.payment_method}</span></div>
                    <div className="flex justify-between pt-2 border-t mt-2"><span className="text-gray-500 text-sm">Total:</span> <span className="font-black text-emerald-600 text-lg flex items-center"><IndianRupee className="w-4 h-4"/> {selectedOrder.total_amount}</span></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Ordered Items</h3>
              <div className="bg-white border rounded-xl overflow-hidden">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-4 border-b last:border-0 items-center">
                    <div className="flex items-center gap-3">
                      {item.image ? <img src={item.image} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-gray-100 rounded" />}
                      <div><p className="font-bold">{item.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                    </div>
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}