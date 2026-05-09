import { useEffect, useState } from 'react';
import { ShoppingCart, IndianRupee } from 'lucide-react';
import { supabase, ShopItem } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null); // To show loading state on the button
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(items.map(i => i.category))];
  const filtered = category === 'All' ? items : items.filter(i => i.category === category);

  // New function to handle adding to cart
  const handleAddToCart = async (item: ShopItem) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    setAddingToCartId(item.id);

    try {
      // 1. Check if it's already in the cart
      const { data: existing } = await supabase
        .from('user_cart')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .single();

      const newQuantity = existing ? existing.quantity + 1 : 1;

      // 2. Upsert (Insert or Update)
      const { error } = await supabase
        .from('user_cart')
        .upsert({ 
          user_id: user.id, 
          item_id: item.id, 
          quantity: newQuantity 
        }, { onConflict: 'user_id,item_id' });

      if (error) throw error;
      
      alert(`Added ${item.name} to cart!`); // You can replace this with a nice toast notification later
    } catch (error: any) {
      console.error("Error adding to cart:", error.message);
      alert("Failed to add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Agri Shop</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Quality seeds, fertilizers, and equipment for your farm.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  category === c 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      Stock: {item.stock_quantity}
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-green-600 font-semibold uppercase">{item.category}</span>
                    <h3 className="font-bold text-gray-900 mt-2 line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-green-700 font-bold">
                        <IndianRupee className="w-4 h-4" /> {item.price.toFixed(0)}
                      </div>
                      
                      {/* Updated Button! */}
                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCartId === item.id || item.stock_quantity === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                        title="Add to Cart"
                      >
                        {addingToCartId === item.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}