import { useState, useEffect } from 'react';
import { Search, Download, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { parkingAPI } from '../utils/api';

interface ParkingData {
  id: string;
  platNomor: string;
  waktuMasuk: string;
  status: 'pending' | 'paid';
}

export function AdminDashboard() {
  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await parkingAPI.getAll();
      setParkingData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading parking data:', err);
      setError('Gagal memuat data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    setLoading(true);
    try {
      await parkingAPI.delete(id);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Error deleting parking entry:', err);
      alert('Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Plat Nomor', 'Waktu Masuk', 'Status'];
    const csvContent = [
      headers.join(','),
      ...parkingData.map(item => 
        `${item.platNomor},${new Date(item.waktuMasuk).toLocaleString('id-ID')},${item.status === 'paid' ? 'Lunas' : 'Pending'}`
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-parkir-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua data?')) return;
    
    setLoading(true);
    try {
      await parkingAPI.deleteAll();
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Error deleting all parking entries:', err);
      alert('Gagal menghapus semua data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredData = parkingData.filter(item => {
    const matchesSearch = item.platNomor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalTransactions = parkingData.length;
  const paidTransactions = parkingData.filter(item => item.status === 'paid').length;
  const pendingTransactions = parkingData.filter(item => item.status === 'pending').length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-800 mb-2">Dashboard Admin</h2>
            <p className="text-gray-600">Kelola data pembayaran parkir</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses...</span>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Transaksi</p>
              <p className="text-gray-900">{totalTransactions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Sudah Bayar</p>
              <p className="text-gray-900">{paidTransactions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Pending</p>
              <p className="text-gray-900">{pendingTransactions}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari plat nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'paid')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Lunas</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={parkingData.length === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={parkingData.length === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Plat Nomor</th>
                <th className="px-6 py-4 text-left text-gray-700">Waktu Masuk</th>
                <th className="px-6 py-4 text-left text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Tidak ada data yang sesuai dengan filter' 
                      : 'Belum ada data parkir'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{item.platNomor}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.waktuMasuk).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          item.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
