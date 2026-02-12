import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Head } from '../components/Head';
import { useLogin, useGoogleSignIn, useLinkedInSignIn } from '../agents/FrontendAgent';
import { Loader2, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.status === 'success') {
      console.log('Logged in:', result.user);
      navigate('/');
    }
  };

  const { signIn: signInWithGoogle, loading: googleLoading } = useGoogleSignIn();
  const { signIn: signInWithLinkedIn, loading: linkedInLoading } = useLinkedInSignIn();

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.status === 'success') navigate('/');
  };

  const handleLinkedInLogin = async () => {
    const result = await signInWithLinkedIn();
    if (result.status === 'success') navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head title="Log In" description="Log in to your localchambers.ai account." />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <div className="w-8 h-8 bg-chamber-navy rounded-sm flex items-center justify-center">
            <span className="text-chamber-gold font-serif font-bold text-lg">L</span>
          </div>
          <span className="font-serif font-bold text-xl text-chamber-navy tracking-tight">
            localchambers<span className="text-chamber-gold">.ai</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-chamber-gold hover:text-chamber-navy">
            start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <button
              onClick={handleLinkedInLogin}
              disabled={linkedInLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#0077b5] text-sm font-medium text-white hover:bg-[#006399] focus:outline-none transition-colors"
            >
              {linkedInLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  Sign in with LinkedIn
                </>
              )}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium uppercase tracking-wider">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-chamber-navy hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center"><Lock className="w-4 h-4 mr-2" /> Sign in</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
