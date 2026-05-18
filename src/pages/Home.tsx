import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, Training } from '../lib/supabase';
import {
  Sprout, FlaskConical, CloudSun, Store, Landmark, Users,
  ArrowRight, CheckCircle, Star, ChevronRight,
} from 'lucide-react';

const heroStats = [
  { value: '5,000+', label: 'Registered Farmers' },
  { value: '8', label: 'North East States' },
  { value: '120+', label: 'Training Sessions' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const services = [
  { icon: Sprout, title: 'Crop Advisory', desc: 'Expert crop selection and pest management guidance.' },
  { icon: FlaskConical, title: 'Soil Testing', desc: 'Accurate nutrient analysis for informed decisions.' },
  { icon: CloudSun, title: 'Weather Updates', desc: 'Localised forecasts for better farm planning.' },
  { icon: Store, title: 'Market Linkage', desc: 'Direct buyer connections for fair pricing.' },
  { icon: Landmark, title: 'Govt. Schemes', desc: 'Latest subsidies and welfare programmes.' },
  { icon: Users, title: 'Community', desc: 'Peer support network of farmers & students.' },
];

const testimonials = [
  {
    name: 'Ranjit Bora',
    role: 'Paddy Farmer, Assam',
    text: 'Krishi Mitra helped me double my yield using organic techniques. The soil testing service is a game changer.',
    rating: 5,
    avatar: 'R',
  },
  {
    name: 'Meena Devi',
    role: 'Vegetable Grower, Manipur',
    text: 'I found buyers for my produce directly through the platform. No more dependence on middlemen!',
    rating: 5,
    avatar: 'M',
  },
  {
    name: 'Bikash Thapa',
    role: 'Agriculture Student, Sikkim',
    text: 'The training programmes are world-class and very practical. I got hands-on experience in agri-entrepreneurship.',
    rating: 5,
    avatar: 'B',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [featuredTrainings, setFeaturedTrainings] = useState<Training[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  
  // NEW: State to hold the live user count
  const [liveUserCount, setLiveUserCount] = useState<number | null>(null);

  // Fetch Live Users
  useEffect(() => {
    async function fetchLiveUsers() {
      const { count, error } = await supabase
        .from('user_details')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setLiveUserCount(count);
      }
    }
    fetchLiveUsers();
  }, []);

  // Fetch Trainings
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const { data } = await supabase
          .from('trainings')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
          .limit(3);
        setFeaturedTrainings(data || []);
      } catch (error) {
        console.error('Error fetching trainings:', error);
      } finally {
        setTrainingLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-green-800/70 to-green-700/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sprout className="w-3.5 h-3.5" /> North East India's Agri Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-6">
              Growing a Better <br />
              <span className="text-green-400">North East</span> Together
            </h1>
            <p className="text-lg text-green-100/90 leading-relaxed mb-8 max-w-xl">
              Krishi Mitra bridges modern agricultural knowledge with traditional farming wisdom — empowering farmers and agri-students across all 8 North East states.
            </p>
            <div className="flex flex-wrap gap-4">
              {!user && (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5"
                >
                  Join Free Today <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">
                  {/* Smart replacement: Shows live count for Farmers, keeps static values for others */}
                  {s.label === 'Registered Farmers' && liveUserCount !== null 
                    ? `${liveUserCount}+` 
                    : s.value}
                </div>
                <div className="text-green-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Our Core Services</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Comprehensive agri-support designed specifically for the diverse climates and crops of North East India.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 group transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <Icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors"
            >
              View All Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg"
              alt="Training"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/60 flex items-center">
              <div className="px-8 sm:px-14 max-w-xl">
                <h2 className="text-3xl font-bold text-white mb-3">Upcoming Training Programs</h2>
                <p className="text-green-100 mb-6 leading-relaxed">
                  Practical, hands-on training in organic farming, irrigation, pest management, and agri-business development.
                </p>
                <Link
                  to="/training"
                  className="inline-flex items-center gap-2 bg-white text-green-800 font-semibold px-5 py-3 rounded-xl hover:bg-green-50 transition-colors shadow"
                >
                  Browse Programs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trainings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Featured Trainings</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Live training courses</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Updates made in the admin training panel are now reflected here instantly on the home page.
            </p>
          </div>

          {trainingLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featuredTrainings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              No active training programs are available right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTrainings.map((training) => (
                <div key={training.id} className="group overflow-hidden rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img src={training.image_url} alt={training.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      <div className="text-xs uppercase tracking-[0.2em] text-green-300">{training.mode}</div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{training.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{training.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{training.duration}</span>
                      <Link to="/training" className="text-green-600 font-semibold hover:text-green-700">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Built for North East India's Unique Farming Landscape
              </h2>
              <div className="space-y-4">
                {[
                  'Region-specific crop and pest advisory',
                  'Multi-lingual support across NE languages',
                  'Direct farm-to-market connections',
                  'Free government scheme assistance',
                  'Expert agronomist consultations',
                  'Active community of 5,000+ farmers',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-8 bg-green-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                Learn About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg"
                alt="Farmer"
                className="rounded-3xl shadow-xl w-full object-cover h-[420px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="text-2xl font-bold text-green-700">12+</div>
                <div className="text-xs text-gray-500">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Voices from the Field</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-green-200 mb-8 max-w-xl mx-auto">
            Join thousands of farmers and agri-students who are already benefiting from Krishi Mitra's network and services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user && (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-green-800 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}