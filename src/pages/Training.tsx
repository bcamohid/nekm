import { useEffect, useState } from 'react';
import { Leaf, Calendar, Users, BookOpen, X, CheckCircle } from 'lucide-react';
import { supabase, Training } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TrainingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Training | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', email_address: '', address: ''
  });

  useEffect(() => {
    supabase.from('trainings').select('*').eq('is_active', true).order('display_order')
      .then(({ data }) => { setTrainings(data || []); setLoading(false); });
  }, []);

  // Pre-fill form when a user clicks Enroll
  const openEnrollModal = (course: Training) => {
    if (!user) {
      alert("Please log in to enroll in a course.");
      navigate('/login');
      return;
    }
    setSelectedCourse(course);
    setEnrollSuccess(false);
    setFormData({
      full_name: profile?.full_name || '',
      mobile_number: profile?.mobile_number || '',
      email_address: profile?.email_address || '',
      address: profile?.address || '',
    });
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCourse) return;
    setEnrolling(true);

    const { error } = await supabase.from('training_enrollments').insert([{
      user_id: user.id,
      training_id: selectedCourse.id,
      ...formData
    }]);

    if (error) {
      if (error.code === '23505') alert("You have already enrolled in this course!");
      else alert(error.message);
    } else {
      setEnrollSuccess(true);
    }
    setEnrolling(false);
  };

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
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/2589400/pexels-photo-2589400.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Training Programmes</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">Expert-led courses designed for North East India.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainings.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={t.image_url} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className={`absolute top-3 right-3 ${modeColor(t.mode)} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>{t.mode}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{t.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600"><Calendar className="w-4 h-4 text-green-600" /> {t.duration}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600"><Users className="w-4 h-4 text-green-600" /> Group Session</div>
                    </div>
                    <button onClick={() => openEnrollModal(t)} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <BookOpen className="w-4 h-4" /> Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ENROLLMENT MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Course Enrollment</h3>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6">
              {enrollSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-6">Your enrollment is pending admin approval. You will receive a notification in your dashboard soon.</p>
                  <button onClick={() => setSelectedCourse(null)} className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg">Close</button>
                </div>
              ) : (
                <form onSubmit={handleEnrollSubmit} className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
                    <p className="text-sm font-semibold text-green-800">{selectedCourse.title}</p>
                    <p className="text-xs text-green-600 flex gap-3 mt-1"><span>{selectedCourse.duration}</span> <span>•</span> <span className="uppercase">{selectedCourse.mode}</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mobile</label>
                      <input required type="text" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input required type="email" value={formData.email_address} onChange={e => setFormData({...formData, email_address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600 resize-none" rows={2} />
                  </div>

                  <button type="submit" disabled={enrolling} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    {enrolling ? 'Submitting...' : 'Confirm Enrollment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}