import { useEffect, useState } from 'react';
import { ShoppingCart, IndianRupee } from 'lucide-react';
import { supabase, ShopItem } from '../lib/supabase';

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

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

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <ShoppingCart className="w-3.5 h-3.5" /> Quality Agri-Inputs
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Agri Shop</h1>
          <p className="text-green-200 max-w-xl mx-auto text-lg">Quality seeds, fertilisers, pesticides & equipment for sustainable farming.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  category === c
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
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
                      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
                        <ShoppingCart className="w-4 h-4" />
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
