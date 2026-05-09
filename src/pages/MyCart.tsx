import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, CartItem } from '../lib/supabase';
import { Trash2, Plus, Minus, MapPin, IndianRupee, Edit2, Save, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCart() {
  const { user, profile, refreshProfile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Address State
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Keep local address state in sync with the profile
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

    if (!error && data) {
      setCartItems(data);
    }
    setLoading(false);
  }

  async function updateQuantity(cartId: string, newQuantity: number, stockAvailable: number) {
    if (newQuantity < 1 || newQuantity > stockAvailable) return;
    
    // Optimistically update the UI so it feels instant
    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));

    const { error } = await supabase
      .from('user_cart')
      .update({ quantity: newQuantity })
      .eq('id', cartId);
      
    if (error) {
      console.error('Error updating quantity:', error.message);
      fetchCart(); // Revert to database state if it fails
    }
  }

  async function removeItem(cartId: string) {
    // Optimistic UI removal
    setCartItems(prev => prev.filter(item => item.id !== cartId));
    await supabase.from('user_cart').delete().eq('id', cartId);
  }

  async function handleSaveAddress() {
    if (!user) return;
    setSavingAddress(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ address: newAddress })
      .eq('id', user.id);
      
    if (!error) {
      await refreshProfile(); // Update global auth context
      setEditingAddress(false);
    } else {
      alert("Failed to update address. Please try again.");
    }
    setSavingAddress(false);
  }

  // Calculations
  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.shop_items?.price || 0) * item.quantity), 0);
  const deliveryFee = totalAmount > 0 && totalAmount < 500 ? 50 : 0; // ₹50 delivery if under ₹500
  const finalTotal = totalAmount + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-gray-50 px-4">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
        <p className="text-gray-500 mb-8 text-center">Looks like you haven't added any products to your cart yet.</p>
        <Link to="/shop" className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Explore Agri Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Address & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Delivery Address
                </h2>
                {!editingAddress && (
                  <button onClick={() => setEditingAddress(true)} className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
              </div>

              {editingAddress ? (
                <div className="space-y-3">
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors resize-none"
                    placeholder="Enter your full delivery address..."
                  />
                  <div className="flex gap-3">
                    <button onClick={handleSaveAddress} disabled={savingAddress || !newAddress.trim()} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Save className="w-4 h-4" /> {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                    <button onClick={() => { setEditingAddress(false); setNewAddress(profile?.address || ''); }} className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {profile?.address ? profile.address : <span className="text-red-500 italic">No address provided. Please add an address to place an order.</span>}
                </p>
              )}
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cart Items ({cartItems.length})</h2>
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const product = item.shop_items;
                  if (!product) return null;

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0">
                      {/* Product Image */}
                      <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100 border border-gray-200" />
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <IndianRupee className="w-4 h-4" /> {product.price.toFixed(0)}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, product.stock_quantity)}
                            className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, product.stock_quantity)}
                            disabled={item.quantity >= product.stock_quantity}
                            className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Price Details</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({cartItems.length} items)</span>
                  <span className="flex items-center"><IndianRupee className="w-4 h-4" /> {totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Free Delivery</span>
                  ) : (
                    <span className="flex items-center"><IndianRupee className="w-4 h-4" /> {deliveryFee}</span>
                  )}
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-8">
                <span>Total Amount</span>
                <span className="flex items-center"><IndianRupee className="w-5 h-5" /> {finalTotal}</span>
              </div>

              {/* Static Place Order Button */}
              <button 
                onClick={() => alert("Checkout and Payment Integration coming soon!")}
                disabled={!profile?.address}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors text-lg"
              >
                Place Order
              </button>
              {!profile?.address && (
                <p className="text-xs text-red-500 mt-3 text-center">Please add a delivery address to proceed.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}