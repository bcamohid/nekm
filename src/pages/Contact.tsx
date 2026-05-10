import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Leaf, CheckCircle } from 'lucide-react';
import { supabase, ContactInfo } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth(); // Get logged-in user to link the message to their profile
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from('contact_info')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setContacts(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Insert the message into the new Help table
    const { error } = await supabase.from('help').insert([{
      user_id: user?.id || null, // Link it to the user if they are logged in
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      status: 'pending'
    }]);

    setSending(false);

    if (error) {
      alert("Error sending message: " + error.message);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitted(false);
      }, 4000);
    }
  };

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">We're here to support your farming journey. Reach out to our agricultural experts.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">Whether you have a question about our services, need technical support, or want to partner with us, our team is ready to answer all your questions.</p>
              
              <div className="space-y-8">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0 text-green-600">
                      {contact.type === 'email' && <Mail className="w-6 h-6" />}
                      {contact.type === 'phone' && <Phone className="w-6 h-6" />}
                      {contact.type === 'address' && <MapPin className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{contact.label}</h3>
                      <p className="text-gray-600">{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. Our support team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <input type="text" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors" required />
                    <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors" required />
                  </div>
                  <input type="text" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors" required />
                  <textarea placeholder="Your Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors resize-none" required />
                  <button type="submit" disabled={sending} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}