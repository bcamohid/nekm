import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  
  // --- ADD YOUR SOCIAL MEDIA LINKS HERE ---
  const socialLinks = [
    { Icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61589915551482' },
    { Icon: Twitter, url: '' },
    { Icon: Youtube, url: '' },
    { Icon: Instagram, url: 'https://www.instagram.com/_northeastkrishimitra_?igsh=MTJhbzhqaXQxYml6' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-base block leading-tight">NorthEastKrishimitra</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering farmers and agriculture students across North East India with knowledge, tools, and community support.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Our Services', to: '/services' },
                { label: 'Training Programs', to: '/training' },
                { label: 'Agri Shop', to: '/shop' },
                { label: 'Contact', to: '/contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-green-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Sign Up', to: '/signup' },
                { label: 'Log In', to: '/login' },
                { label: 'My Dashboard', to: '/dashboard' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-green-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                <span>northeastkrishimitra@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                <span>+91 91811 13901</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                <span>North Lakhimpur Laluk 784160</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} NorthEastKrishimitra. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Serving farmers across North East India
          </p>
        </div>
      </div>
    </footer>
  );
}