import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onNavigateToCreateAccount: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
            AstroJournal
          </h1>
          <p className="text-gray-400 mt-2">Login to continue your cosmic journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-400 bg-red-900/50 border border-red-700 rounded-lg p-3 text-center">{error}</p>}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-400">Password</label>
            <input
              id="password-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <button onClick={onNavigateToCreateAccount} className="font-medium text-purple-400 hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};
