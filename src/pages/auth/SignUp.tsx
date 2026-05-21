import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import myLogo from '../../assets/logo.jpg';

export default function Signup() {
  // Form Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('farmer');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP States
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // PHASE 1: Submit Details & Trigger Twilio SMS
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    
    // Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address (e.g., yourname@gmail.com).");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const { error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert("Signup Error: " + error.message);
    } else {
      setShowOtpField(true);
      alert("Registration initialized! An OTP code has been sent to your mobile.");
    }
  }

  // PHASE 2: Verify OTP & Create the User Details profile
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms'
    });

    if (error) {
      alert("Invalid verification code: " + error.message);
      setLoading(false);
      return;
    }

    if (session) {
      // Changed from .insert() to .upsert() to guarantee the data saves
      // even if Supabase accidentally created a shadow row earlier.
      const { error: dbError } = await supabase.from('user_details').upsert([{
        id: session.user.id,
        full_name: fullName,
        mobile_number: formattedPhone,
        email_address: email,
        role: role,
        address: address
      }]);

      setLoading(false);

      if (dbError) {
        console.error("Database error:", dbError.message);
        alert("Account verified, but there was an error saving your profile details.");
      } else {
        alert("Account created successfully!");
        // Forces a hard reload so the Dashboard fetches fresh database rows
        window.location.href = '/dashboard'; 
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 pb-10 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img src={myLogo} alt="Logo" className="w-16 h-16 rounded-xl shadow-sm" />
        </div>
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>

        {!showOtpField ? (
          <form onSubmit={handleSignUp} className="space-y-4 text-left">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-1">Full Name</label>
              <input 
                type="text" 
                id="fullName"
                name="name"
                autoComplete="name"
                required 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none" 
                placeholder="Enter your name" 
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-1">Mobile Number</label>
              <input 
                type="tel" 
                id="phone"
                name="tel"
                autoComplete="tel"
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none" 
                placeholder="10-digit number" 
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1">Email Address</label>
              <input 
                type="email" 
                id="email"
                name="email"
                autoComplete="email"
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none" 
                placeholder="your@email.com" 
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold mb-1">Role</label>
              <select 
                id="role"
                name="role"
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none"
              >
                <option value="farmer">Farmer</option>
                <option value="student">Agri-Student</option>
                <option value="expert">Agricultural Expert</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold mb-1">Address</label>
              <textarea 
                id="address"
                name="street-address"
                autoComplete="street-address"
                required 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                rows={2} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none resize-none" 
                placeholder="Full delivery address..." 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1">Password</label>
              <input 
                type="password" 
                id="password"
                name="new-password"
                autoComplete="new-password"
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none" 
                placeholder="Minimum 6 characters" 
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
              {loading ? 'Sending OTP...' : 'Register & Verify Mobile'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm mb-4">An SMS verification code was sent to <strong>{phone}</strong>.</div>
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold mb-1">Enter OTP</label>
              <input 
                type="text" 
                id="otp"
                name="one-time-code"
                autoComplete="one-time-code"
                required 
                maxLength={6} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                className="w-full border p-3 text-center text-2xl tracking-widest rounded-lg font-mono focus:ring-1 focus:ring-green-600 outline-none" 
                placeholder="000000" 
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
              {loading ? 'Verifying...' : 'Verify & Complete Registration'}
            </button>
          </form>
        )}
        <p className="mt-6 text-sm">Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Log In</Link></p>
      </div>
    </div>
  );
}