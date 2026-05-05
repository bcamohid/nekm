import { useEffect, useState } from 'react';
import { Leaf, Calendar, Users, BookOpen } from 'lucide-react';
import { supabase, Training } from '../lib/supabase';

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('trainings')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setTrainings(data || []);
        setLoading(false);
      });
  }, []);

  const modeColor = (mode: string) => {
    switch (mode) {
      case 'online': return 'bg-blue-100 text-blue-700';
      case 'offline': return 'bg-green-100 text-green-700';
      case 'hybrid': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" /> Upskill Yourself
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Training Programs</h1>
          <p className="text-green-200 max-w-xl mx-auto text-lg">Hands-on training from expert agronomists to boost your farming success.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {trainings.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    <img src={t.image_url} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className={`absolute top-3 right-3 ${modeColor(t.mode)} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>
                      {t.mode}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{t.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar className="w-4 h-4 text-green-600" /> {t.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Users className="w-4 h-4 text-green-600" /> Group Session
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <BookOpen className="w-4 h-4" /> Enroll Now
                    </button>
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
