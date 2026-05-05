import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Leaf } from 'lucide-react';
import { supabase, ContactInfo } from '../lib/supabase';

export default function Contact() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg')" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" /> Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-green-200 max-w-xl mx-auto text-lg">We're here to help. Reach out with any questions about our services.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {contacts.length > 0 ? (
              contacts.map((c) => {
                const Icon = c.type === 'email' ? Mail : c.type === 'phone' ? Phone : MapPin;
                return (
                  <div key={c.id} className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <Icon className="w-6 h-6 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{c.label}</h3>
                    <p className="text-gray-600">{c.value}</p>
                  </div>
                );
              })
            ) : (
              <>
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <Mail className="w-6 h-6 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">northeast20227@gmail.com</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <Phone className="w-6 h-6 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">6002636404</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <MapPin className="w-6 h-6 text-green-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">NorthLakhimpur, Assam 787001</p>
                </div>
              </>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-800">
                  ✓ Thank you! We'll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors"
                    required
                  />
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-600 transition-colors resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send Message
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
