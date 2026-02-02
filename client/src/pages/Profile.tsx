import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Shield, Target } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleUpdate = async () => {
    setIsSaving(true);
    // Placeholder for actual API call to PUT /api/user/profile
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-white mb-6">Your Profile</h2>

      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-4xl text-gray-400 font-bold border-4 border-primary-500 shadow-lg">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 space-y-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="text" 
              disabled
              value={user.email}
              className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-500 cursor-not-allowed" 
            />
          </div>
          <button 
            onClick={handleUpdate}
            disabled={isSaving || username === user.username}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-primary-500/10 text-primary-500 rounded-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Account Status</p>
            <p className="text-white font-bold">Verified Member</p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center space-x-4">
          <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Current Rating</p>
            <p className="text-white font-bold text-2xl">{user.rating || 1200}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
