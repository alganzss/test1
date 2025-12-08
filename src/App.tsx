import { useState } from 'react';
import { UserParking } from './components/UserParking';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleViewChange = (newView: 'user' | 'admin') => {
    if (newView === 'user') {
      setView('user');
    } else if (newView === 'admin') {
      setView('admin');
      // Reset authentication when switching to admin view
      if (view !== 'admin') {
        setIsAdminAuthenticated(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-indigo-600">Sistem Parkir</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewChange('user')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pengguna
              </button>
              <button
                onClick={() => handleViewChange('admin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'admin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'user' ? (
          <UserParking />
        ) : (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        )}
      </main>
    </div>
  );
}