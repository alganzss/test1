import { useState } from 'react';
import { Car, CheckCircle, Loader2 } from 'lucide-react';
import qrisImage from 'figma:asset/606633db1d22e3ebaf7d357c16b73c84569fff9b.png';
import { parkingAPI } from '../utils/api';

interface ParkingData {
  id: string;
  platNomor: string;
  waktuMasuk: string;
  status: 'pending' | 'paid';
}

export function UserParking() {
  const [platNomor, setPlatNomor] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platNomor.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Save to database
      const booking = await parkingAPI.create(platNomor);
      setCurrentBooking(booking);
      setShowPayment(true);
    } catch (err) {
      console.error('Error creating parking entry:', err);
      setError('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!currentBooking) return;

    setLoading(true);
    setError(null);

    try {
      // Update status to paid
      await parkingAPI.updateStatus(currentBooking.id, 'paid');
      
      // Reset form
      setPlatNomor('');
      setShowPayment(false);
      setCurrentBooking(null);
      
      // Show success message
      alert('Pembayaran berhasil dikonfirmasi! Terima kasih.');
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Gagal mengkonfirmasi pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlatNomor('');
    setShowPayment(false);
    setCurrentBooking(null);
  };

  if (showPayment && currentBooking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-green-600 mb-2">Data Berhasil Disimpan!</h2>
            <p className="text-gray-600">Plat Nomor: <span className="font-semibold">{currentBooking.platNomor}</span></p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-center mb-4 text-gray-700">Silakan Scan QRIS untuk Pembayaran</h3>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img 
                  src={qrisImage} 
                  alt="QRIS Pembayaran" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-center text-blue-800">
                Scan QRIS di atas menggunakan aplikasi pembayaran Anda
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePaymentConfirm}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Konfirmasi Pembayaran
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-gray-800 mb-2">Pembayaran Parkir</h2>
          <p className="text-gray-600">Masukkan plat nomor kendaraan Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="platNomor" className="block text-gray-700 mb-2">
              Plat Nomor Kendaraan
            </label>
            <input
              type="text"
              id="platNomor"
              value={platNomor}
              onChange={(e) => setPlatNomor(e.target.value)}
              placeholder="Contoh: B 1234 XYZ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none uppercase"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Lanjutkan
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Data akan tersimpan secara otomatis ke database
          </p>
        </div>
      </div>
    </div>
  );
}