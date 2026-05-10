import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, CartItem } from '../lib/supabase';
import { Trash2, Plus, Minus, MapPin, IndianRupee, Edit2, Save, ShoppingBag, QrCode, Banknote, CheckCircle, X, User as UserIcon, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyCart() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile Address State (Left column)
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Multi-Step Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [checkoutForm, setCheckoutForm] = useState({
    full_name: '',
    mobile_number: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR_CODE'>('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (profile) setNewAddress(profile.address || '');
  }, [profile]);

  async function fetchCart() {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_cart')
      .select('*, shop_items(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setCartItems(data);
    setLoading(false);
  }

  async function updateQuantity(cartId: string, newQuantity: number, stockAvailable: number) {
    if (newQuantity < 1 || newQuantity > stockAvailable) return;
    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));
    await supabase.from('user_cart').update({ quantity: newQuantity }).eq('id', cartId);
  }

  async function removeItem(cartId: string) {
    setCartItems(prev => prev.filter(item => item.id !== cartId));
    await supabase.from('user_cart').delete().eq('id', cartId);
  }

  async function handleSaveProfileAddress() {
    if (!user) return;
    setSavingAddress(true);
    const { error } = await supabase.from('profiles').update({ address: newAddress }).eq('id', user.id);
    if (!error) {
      await refreshProfile();
      setEditingAddress(false);
    } else {
      alert("Failed to update address.");
    }
    setSavingAddress(false);
  }

  function startCheckout() {
    // Pre-fill the checkout form with the user's profile data
    setCheckoutForm({
      full_name: profile?.full_name || '',
      mobile_number: profile?.mobile_number || '',
      address: profile?.address || ''
    });
    setCheckoutStep(1);
    setShowCheckout(true);
  }

  // Calculations
  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.shop_items?.price || 0) * item.quantity), 0);
  const deliveryFee = totalAmount > 0 && totalAmount < 500 ? 50 : 0;
  const finalTotal = totalAmount + deliveryFee;

  async function handlePlaceOrder() {
    if (!user) return;
    setPlacingOrder(true);

    const orderItems = cartItems.map(item => ({
      product_id: item.item_id,
      name: item.shop_items?.name,
      price: item.shop_items?.price,
      quantity: item.quantity,
      image: item.shop_items?.image_url
    }));

    const { error: orderError } = await supabase.from('orders').insert([{
      user_id: user.id,
      full_name: checkoutForm.full_name,
      mobile_number: checkoutForm.mobile_number,
      address: checkoutForm.address,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      items: orderItems,
      status: 'pending'
    }]);

    if (orderError) {
      alert("Error placing order: " + orderError.message);
      setPlacingOrder(false);
      return;
    }

    await supabase.from('user_cart').delete().eq('user_id', user.id);
    
    setPlacingOrder(false);
    setOrderSuccess(true);
    setCartItems([]);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-gray-50 px-4">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
        <Link to="/shop" className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors mt-4">Explore Agri Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Address Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" /> Default Delivery Address</h2>
                {!editingAddress && (
                  <button onClick={() => setEditingAddress(true)} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"><Edit2 className="w-4 h-4" /> Edit</button>
                )}
              </div>
              {editingAddress ? (
                <div className="space-y-3">
                  <textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none" placeholder="Enter full address..." />
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfileAddress} disabled={savingAddress || !newAddress.trim()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save className="w-4 h-4" /> Save Default</button>
                    <button onClick={() => { setEditingAddress(false); setNewAddress(profile?.address || ''); }} className="border border-gray-300 px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">{profile?.address ? profile.address : <span className="text-red-500 italic">No default address provided.</span>}</p>
              )}
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cart Items ({cartItems.length})</h2>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                    <img src={item.shop_items?.image_url} alt={item.shop_items?.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100 border border-gray-200" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.shop_items?.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{item.shop_items?.category}</p>
                      <div className="flex items-center gap-1 font-bold text-gray-900"><IndianRupee className="w-4 h-4" /> {item.shop_items?.price.toFixed(0)}</div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.shop_items!.stock_quantity)} className="p-2 hover:bg-gray-50 text-gray-600"><Minus className="w-4 h-4" /></button>
                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.shop_items!.stock_quantity)} disabled={item.quantity >= item.shop_items!.stock_quantity} className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Price Details</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600"><span>Price ({cartItems.length} items)</span><span className="flex items-center"><IndianRupee className="w-4 h-4" /> {totalAmount}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery Charges</span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">Free Delivery</span> : <span className="flex items-center"><IndianRupee className="w-4 h-4" /> {deliveryFee}</span>}</div>
              </div>
              <hr className="border-gray-100 mb-6" />
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-8"><span>Total Amount</span><span className="flex items-center"><IndianRupee className="w-5 h-5" /> {finalTotal}</span></div>
              
              <button onClick={startCheckout} disabled={cartItems.length === 0} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors text-lg">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-STEP CHECKOUT MODAL */}
      {showCheckout && !orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            
            {checkoutStep === 1 ? (
              // --- STEP 1: DELIVERY DETAILS ---
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Details</h2>
                <p className="text-gray-500 text-sm mb-6">Confirm where you want this order delivered.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><UserIcon className="w-4 h-4" /> Full Name</label>
                    <input type="text" required value={checkoutForm.full_name} onChange={e => setCheckoutForm({...checkoutForm, full_name: e.target.value})} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4" /> Mobile Number</label>
                    <input type="text" required value={checkoutForm.mobile_number} onChange={e => setCheckoutForm({...checkoutForm, mobile_number: e.target.value})} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4" /> Full Address</label>
                    <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none" />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(!checkoutForm.full_name || !checkoutForm.mobile_number || !checkoutForm.address) alert("Please fill all details!");
                    else setCheckoutStep(2);
                  }} 
                  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // --- STEP 2: PAYMENT METHOD ---
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <button onClick={() => setCheckoutStep(1)} className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to details</button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>
                
                <div className="space-y-4 mb-8">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-green-600 focus:ring-green-600" />
                    <div className="flex items-center gap-3"><Banknote className={`w-6 h-6 ${paymentMethod === 'COD' ? 'text-green-600' : 'text-gray-400'}`} /><div><p className="font-bold text-gray-900">Cash on Delivery</p><p className="text-xs text-gray-500">Pay when your order arrives</p></div></div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'QR_CODE' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'QR_CODE'} onChange={() => setPaymentMethod('QR_CODE')} className="w-5 h-5 text-green-600 focus:ring-green-600" />
                    <div className="flex items-center gap-3"><QrCode className={`w-6 h-6 ${paymentMethod === 'QR_CODE' ? 'text-green-600' : 'text-gray-400'}`} /><div><p className="font-bold text-gray-900">Scan QR Code</p><p className="text-xs text-gray-500">Pay via UPI / Wallet</p></div></div>
                  </label>
                </div>

                {paymentMethod === 'QR_CODE' && (
                  <div className="mb-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Scan this code to pay ₹{finalTotal}</p>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=northeastkrishimitra@upi&pn=NorthEastKrishimitra&am=${finalTotal}`} alt="Payment QR" className="mx-auto w-32 h-32 rounded-lg" />
                  </div>
                )}

                <button onClick={handlePlaceOrder} disabled={placingOrder} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  {placingOrder ? 'Processing...' : `Confirm Order • ₹${finalTotal}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-8">Your order has been successfully placed. We will notify you once it's accepted.</p>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Go to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}