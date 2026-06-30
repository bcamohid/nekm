import { useEffect, useState } from 'react';
import { Leaf, Calendar, Users, BookOpen, X, CheckCircle, Info, QrCode, Smartphone, Send } from 'lucide-react';
import { supabase, Training } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import myQrCode from '../assets/QR.png'; 

// Smart Fallback Image in case the database URL is broken
const DEFAULT_COURSE_IMG = "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg";

export default function TrainingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Modal State
  const [selectedCourse, setSelectedCourse] = useState<Training | null>(null);
  const [modalStep, setModalStep] = useState<'none' | 'details' | 'form' | 'payment' | 'success'>('none');
  const [enrolling, setEnrolling] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '', mobile_number: '', email_address: '', address: ''
  });

  useEffect(() => {
    supabase.from('trainings').select('*').eq('is_active', true).order('display_order')
      .then(({ data }) => { setTrainings(data || []); setLoading(false); });
  }, []);

  // 1. Open Details Modal
  const openDetailsModal = (course: Training) => {
    setSelectedCourse(course);
    setModalStep('details');
  };

  // 2. Proceed to Enrollment Form
  const proceedToForm = () => {
    if (!user) {
      alert("Please log in to enroll in a course.");
      navigate('/login');
      return;
    }
    setFormData({
      full_name: profile?.full_name || '',
      mobile_number: profile?.mobile_number || '',
      email_address: profile?.email_address || '',
      address: profile?.address || '',
    });
    setModalStep('form');
  };

  // 3. Proceed to Payment Screen
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setModalStep('payment');
  };

  // 4. Final Submit After Payment
  const handleFinalSubmit = async () => {
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
      setModalStep('success');
    }
    setEnrolling(false);
  };

  // Helper function to close modal entirely
  const closeModal = () => {
    setModalStep('none');
    setTimeout(() => setSelectedCourse(null), 200); // Slight delay for smooth UI closing
  };

  const modeColor = (mode: string) => {
    switch (mode) {
      case 'online': return 'bg-blue-100 text-blue-700';
      case 'offline': return 'bg-green-100 text-green-700';
      case 'hybrid': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Generate a dynamic transaction ID for the UPI link
  const upiTransactionId = `TXN${Date.now()}`;
  const gpayLink = `upi://pay?pa=9435198855@ybl&pn=KrishiMitra&am=2999&tr=${upiTransactionId}&tn=Course_Enrollment_KrishiMitra`;

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
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {/* ADDED: Fallback Image Logic */}
                    <img 
                      src={t.image_url || DEFAULT_COURSE_IMG} 
                      onError={(e) => { e.currentTarget.src = DEFAULT_COURSE_IMG; }}
                      alt={t.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className={`absolute top-3 right-3 ${modeColor(t.mode)} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>{t.mode}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{t.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{t.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600"><Calendar className="w-4 h-4 text-green-600" /> {t.duration}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600"><Users className="w-4 h-4 text-green-600" /> Group Session</div>
                    </div>
                    <button onClick={() => openDetailsModal(t)} className="w-full mt-4 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 border border-green-200 transition-colors">
                      <Info className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MULTI-STEP MODAL */}
      {modalStep !== 'none' && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">
                {modalStep === 'details' && 'Course Details'}
                {modalStep === 'form' && 'Course Enrollment'}
                {modalStep === 'payment' && 'Secure Payment'}
                {modalStep === 'success' && 'Enrollment Status'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              
              {/* STEP 1: COURSE DETAILS */}
              {modalStep === 'details' && (
                <div className="space-y-4">
                  {/* ADDED: Fallback Image Logic */}
                  <img 
                    src={selectedCourse.image_url || DEFAULT_COURSE_IMG} 
                    onError={(e) => { e.currentTarget.src = DEFAULT_COURSE_IMG; }}
                    alt={selectedCourse.title} 
                    className="w-full h-40 object-cover rounded-xl mb-4 bg-gray-100" 
                  />
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedCourse.title}</h2>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${modeColor(selectedCourse.mode)}`}>{selectedCourse.mode}</span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{selectedCourse.duration}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedCourse.description}</p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <button onClick={proceedToForm} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-green-500/20">
                      <BookOpen className="w-4 h-4" /> Enroll Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ENROLLMENT FORM */}
              {modalStep === 'form' && (
                <form onSubmit={handleProceedToPayment} className="space-y-4">
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

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalStep('details')} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors">
                      Back
                    </button>
                    <button type="submit" className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PAYMENT SCREEN */}
              {modalStep === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900">₹2999</h2>
                    <p className="text-sm text-gray-500 font-medium">Registration Fee</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                    <QrCode className="w-6 h-6 text-gray-400 mb-2" />
                    <img 
                      src={myQrCode} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 rounded-lg shadow-sm border border-gray-200 object-contain bg-white"
                    />
                  </div>

                  {/* Dynamic GPay Link */}
                  <a 
                    href={gpayLink}
                    className="w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Smartphone className="w-5 h-5" /> Pay with Google Pay
                  </a>

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Instructions
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-2 list-disc pl-4 marker:text-amber-400">
                      <li><strong className="font-semibold">Mobile Users:</strong> Tap the "Pay with Google Pay" button above.</li>
                      <li><strong className="font-semibold">PC Users:</strong> Scan the QR code using any UPI app on your phone.</li>
                      <li>After paying, please take a screenshot of your successful transaction.</li>
                      <li>Send your payment screenshot via WhatsApp to <strong className="font-semibold">+91 94351 98855</strong>.</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button 
                      onClick={handleFinalSubmit} 
                      disabled={enrolling}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {enrolling ? 'Processing...' : (
                        <>
                          <Send className="w-4 h-4" /> I have completed the payment
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">
                      Only click after sending proof on WhatsApp
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS CONFIRMATION */}
              {modalStep === 'success' && (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Your enrollment is pending admin approval. Ensure you have sent your payment screenshot on WhatsApp. You will receive a notification in your dashboard soon.
                  </p>
                  <button onClick={closeModal} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-colors">
                    Back to Trainings
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}