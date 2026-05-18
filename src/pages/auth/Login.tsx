import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import myLogo from '../../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    // 1. Authenticate User
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password: password,
    });

    if (authError) {
      alert("Login Failed: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Fetch their specific role from user_details
      const { data: profile } = await supabase
        .from('user_details')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      setLoading(false);

      // 3. Smart Redirect based on is_admin flag
      if (profile?.is_admin === true) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        
        <div className="flex justify-center mb-4">
          <img src={myLogo} alt="Logo" className="w-16 h-16 rounded-xl shadow-sm" />
        </div>
        
        <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
        <p className="text-gray-500 text-sm mb-6">Log in to access your account</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none"
              placeholder="10-digit number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-1 focus:ring-green-600 outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-6 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}