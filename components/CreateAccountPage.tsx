import React, { useState } from 'react';

interface CreateAccountPageProps {
  onCreateAccount: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  onNavigateToLogin: () => void;
}

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onCreateAccount, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    setIsLoading(true);
    const result = await onCreateAccount(username, password, email);
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2">Start your journey with the cosmos.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-400 bg-red-900/50 border border-red-700 rounded-lg p-3 text-center">{error}</p>}
          <div>
            <label htmlFor="username-create" className="block text-sm font-medium text-gray-400">Username</label>
            <input
              id="username-create"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="email-create" className="block text-sm font-medium text-gray-400">Email</label>
            <input
              id="email-create"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="password-create" className="block text-sm font-medium text-gray-400">Password</label>
            <input
              id="password-create"
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
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="font-medium text-purple-400 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};