import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-50b341de`;

interface ParkingData {
  id: string;
  platNomor: string;
  waktuMasuk: string;
  status: 'pending' | 'paid';
}

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const parkingAPI = {
  // Get all parking data
  getAll: async (): Promise<ParkingData[]> => {
    const result = await request('/parking');
    return result.data;
  },

  // Create new parking entry
  create: async (platNomor: string): Promise<ParkingData> => {
    const result = await request('/parking', {
      method: 'POST',
      body: JSON.stringify({ platNomor }),
    });
    return result.data;
  },

  // Update parking status
  updateStatus: async (id: string, status: 'pending' | 'paid'): Promise<ParkingData> => {
    const result = await request(`/parking/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result.data;
  },

  // Delete parking entry
  delete: async (id: string): Promise<void> => {
    await request(`/parking/${id}`, {
      method: 'DELETE',
    });
  },

  // Delete all parking entries
  deleteAll: async (): Promise<number> => {
    const result = await request('/parking', {
      method: 'DELETE',
    });
    return result.deleted;
  },
};
