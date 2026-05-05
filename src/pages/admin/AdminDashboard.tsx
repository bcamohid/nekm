import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, BookOpen, ShoppingBag, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ profiles: 0, services: 0, trainings: 0, shop: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [profiles, services, trainings, shop] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('trainings').select('id', { count: 'exact', head: true }),
        supabase.from('shop_items').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        profiles: profiles.count || 0,
        services: services.count || 0,
        trainings: trainings.count || 0,
        shop: shop.count || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.profiles, color: 'blue' },
    { icon: BarChart3, label: 'Services', value: stats.services, color: 'green' },
    { icon: BookOpen, label: 'Trainings', value: stats.trainings, color: 'purple' },
    { icon: ShoppingBag, label: 'Products', value: stats.shop, color: 'amber' },
  ];

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
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-500">Manage your platform content and settings</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {cards.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-6`}>
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
          </>
        )}
      </div>
    </div>
  );
}
