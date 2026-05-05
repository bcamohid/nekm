import { useEffect, useState } from 'react';
import {
  Sprout, FlaskConical, CloudSun, Store, Landmark, Users,
  Leaf, Phone, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Service } from '../lib/supabase';

const iconMap: Record<string, React.ElementType> = {
  sprout: Sprout,
  'flask-conical': FlaskConical,
  'cloud-sun': CloudSun,
  store: Store,
  landmark: Landmark,
  users: Users,
  leaf: Leaf,
};

const howItWorks = [
  { step: '01', title: 'Register', desc: 'Create your free account as a Farmer or Agriculture Student.' },
  { step: '02', title: 'Request a Service', desc: 'Choose from our range of advisory and support services.' },
  { step: '03', title: 'Connect with Experts', desc: 'Get matched with agronomists suited to your crop and region.' },
  { step: '04', title: 'Grow & Prosper', desc: 'Apply insights, access markets, and track your progress.' },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setServices(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" /> What We Provide
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-green-200 max-w-xl mx-auto text-lg">
            Comprehensive agricultural support tailored for the diverse farming conditions of North East India.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s) => {
                const Icon = iconMap[s.icon_name] || Leaf;
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group"
                  >
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-600 transition-colors">
                      <Icon className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl mb-3">{s.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{s.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((h, i) => (
              <div key={h.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-0.5 bg-green-100" />
                )}
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-white font-bold text-lg">{h.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Phone className="w-10 h-10 text-green-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Need Personalised Advice?</h2>
          <p className="text-green-200 mb-8">
            Speak directly with one of our agronomists for crop-specific and region-specific guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-green-800 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow"
            >
              Contact an Expert <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
