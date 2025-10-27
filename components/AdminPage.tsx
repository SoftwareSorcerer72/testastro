import React, { useState } from 'react';
import { UserData } from '../types';

interface AdminPageProps {
  users: Record<string, UserData>;
  onDeleteUser: (username: string) => void;
  onUpdateUser: (username: string, newEmail: string) => void;
  onResetPassword: (username: string, newPassword: string) => void;
}

const EditUserModal: React.FC<{ user: { username: string; email: string }; onSave: (newEmail: string) => void; onClose: () => void }> = ({ user, onSave, onClose }) => {
    const [email, setEmail] = useState(user.email);

    const handleSave = () => {
        if (email.trim()) {
            onSave(email.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
                <h2 className="text-xl font-bold mb-4 text-white">Edit User: {user.username}</h2>
                <div>
                    <label htmlFor="email-edit" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                        id="email-edit"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 font-semibold bg-gray-600 hover:bg-gray-500 text-white rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

export const AdminPage: React.FC<AdminPageProps> = ({ users, onDeleteUser, onUpdateUser, onResetPassword }) => {
  const [userToEdit, setUserToEdit] = useState<{ username: string; email: string } | null>(null);
  const userList = Object.entries(users).filter(([username]) => username !== 'admin');

  const handleDelete = (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}" and all their data? This cannot be undone.`)) {
      onDeleteUser(username);
    }
  };

  const handleResetPassword = (username: string) => {
    const newPassword = window.prompt(`Enter a new password for user "${username}":`);
    if (newPassword && newPassword.length >= 4) {
      onResetPassword(username, newPassword);
      alert(`Password for ${username} has been reset.`);
    } else if (newPassword) {
      alert('Password must be at least 4 characters long.');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">User Management</h2>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">Username</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX: Explicitly type the destructured `userData` to ensure TypeScript correctly infers it as UserData and not unknown. */}
              {userList.map(([username, userData]: [string, UserData]) => (
                <tr key={username} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-medium text-white">{username}</td>
                  <td className="p-4 text-gray-300">{userData.email}</td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-2 flex-wrap">
                        <a href={`mailto:${userData.email}`} className="text-gray-400 hover:text-purple-400 p-1" title="Email User">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        </a>
                         <button onClick={() => setUserToEdit({ username, email: userData.email })} className="text-gray-400 hover:text-purple-400 p-1" title="Edit User">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => handleResetPassword(username)} className="text-gray-400 hover:text-yellow-400 p-1" title="Reset Password">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l1-1 1-1 1.257-1.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => handleDelete(username)} className="text-gray-400 hover:text-red-500 p-1" title="Delete User">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {userList.length === 0 && (
                <div className="text-center py-8 px-4">
                    <p className="text-gray-400">No other users have registered yet.</p>
                </div>
            )}
        </div>
      </div>
      {userToEdit && (
        <EditUserModal 
            user={userToEdit} 
            onClose={() => setUserToEdit(null)} 
            onSave={(newEmail) => {
                onUpdateUser(userToEdit.username, newEmail);
                setUserToEdit(null);
            }}
        />
      )}
    </div>
  );
};
