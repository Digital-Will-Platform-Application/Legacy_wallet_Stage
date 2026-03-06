const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface RegisterRequest {
  username: string;
  email: string;
  mobile?: string;
  password: string;
  confirm_password: string;
  address1?: string;
  address2?: string;
  age?: number;
  gender?: string;
  state?: string;
  postal_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      username: string;
      email: string;
      mobile?: string;
      address1?: string;
      address2?: string;
      age?: number;
      gender?: string;
      state?: string;
      postal_code?: string;
      created_at: string;
    };
    token: string;
  };
}

export interface SaveWillRequest {
  user_id?: number;
  user_email?: string;
  transcript: string;
  content?: string;
  title?: string;
  type?: string;
}

export interface AddAssetRequest {
  user_id?: number;
  user_email?: string;
  name: string;
  category?: string;
  estimated_value?: string | number;
  description?: string;
  currency?: string;
}

export interface FinalizeWillRequest {
  user_id?: number;
  user_email?: string;
  will_id?: number;
  recipients?: Array<{ email: string; name?: string; full_name?: string }>;
}

export const backendApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    return result;
  },

  async saveWill(data: SaveWillRequest) {
    const response = await fetch(`${API_BASE_URL}/api/wills/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to save will');
    }

    return result;
  },

  async getUserWill(userId: number) {
    const response = await fetch(`${API_BASE_URL}/api/wills/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch will');
    }

    return result;
  },

  async finalizeWill(data: FinalizeWillRequest) {
    try {
      console.log('Finalizing will with data:', { ...data, will_id: data.will_id });
      
      const response = await fetch(`${API_BASE_URL}/api/wills/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorText;
        } catch {
          // If not JSON, use the text as-is
        }
        throw new Error(errorMessage || `HTTP ${response.status}: Failed to finalize will`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error in finalizeWill API call:', error);
      if (error.message?.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to backend server. Please check if the backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }
  },

  async addAsset(data: AddAssetRequest) {
    const response = await fetch(`${API_BASE_URL}/api/assets/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add asset');
    }

    return result;
  },

  async getUserAssets(userId: number) {
    const response = await fetch(`${API_BASE_URL}/api/assets/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch assets');
    }

    return result;
  },

  async sendWillNotifications(data: FinalizeWillRequest) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/send-will-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send notifications');
    }

    return result;
  },

  async uploadAudio(data: { user_email: string; audioFile: File | Blob; staging?: boolean }) {
    const formData = new FormData();
    formData.append('audio', data.audioFile);
    formData.append('user_email', data.user_email);
    if (data.staging) {
      formData.append('staging', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/audio`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload audio');
    }

    return result;
  },

  async uploadVideo(data: { user_email: string; videoFile: File | Blob; staging?: boolean }) {
    const formData = new FormData();
    formData.append('video', data.videoFile);
    formData.append('user_email', data.user_email);
    if (data.staging) {
      formData.append('staging', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/video`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload video');
    }

    return result;
  },

  async checkUploadStatus() {
    const response = await fetch(`${API_BASE_URL}/api/upload/status`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  },

  async sendVerificationEmail(data: { user_email: string; user_id?: number }) {
    try {
      console.log('📧 Frontend: Sending verification email to:', data.user_email);
      console.log('📧 Frontend: API URL:', `${API_BASE_URL}/api/email-verification/send-verification`);
      
      const response = await fetch(`${API_BASE_URL}/api/email-verification/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📧 Frontend: Response status:', response.status);
      
      const result = await response.json();
      console.log('📧 Frontend: Response data:', result);
      
      if (!response.ok) {
        const errorMsg = result.message || result.error || 'Failed to send verification email';
        console.error('❌ Frontend: Error response:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!result.success) {
        const errorMsg = result.message || result.error || 'Failed to send verification email';
        console.error('❌ Frontend: Success is false:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Frontend: Verification email sent successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Frontend: Exception in sendVerificationEmail:', error);
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Failed to send verification email. Please check your connection and try again.');
    }
  },

  async verifyEmail(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/email-verification/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Email verification failed');
    }

    return result;
  },

  async checkVerificationStatus(userId: number) {
    const response = await fetch(`${API_BASE_URL}/api/email-verification/status/${userId}`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  },
};
