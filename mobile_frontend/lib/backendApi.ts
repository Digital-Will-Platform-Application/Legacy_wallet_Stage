// Backend API client for mobile app
// Normalize base URL to remove trailing slashes
const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};
const API_BASE_URL = getBaseUrl();

export interface AddRecipientRequest {
  user_email: string;
  full_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  address?: string;
}

export interface AddAssetRequest {
  user_email: string;
  name: string;
  category?: string;
  estimated_value?: number;
  description?: string;
  currency?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class BackendApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Normalize URL to prevent double slashes
      const url = `${API_BASE_URL}${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
          error: data.error || data.message,
        };
      }

      return {
        success: true,
        ...data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error',
        error: error.message,
      };
    }
  }

  // Recipients
  async addRecipient(data: AddRecipientRequest): Promise<ApiResponse> {
    return this.request('/api/recipients/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRecipients(userEmail: string): Promise<ApiResponse> {
    return this.request(`/api/recipients/user-email/${encodeURIComponent(userEmail)}`);
  }

  // Assets
  async addAsset(data: AddAssetRequest): Promise<ApiResponse> {
    return this.request('/api/assets/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssets(userEmail: string): Promise<ApiResponse> {
    // First get user ID by email, then get assets
    // For now, we'll need to add a user-email endpoint or use user_id
    return this.request(`/api/assets/user-email/${encodeURIComponent(userEmail)}`);
  }

  // Wills
  async saveWill(data: {
    user_email: string;
    transcript: string;
    content: string;
    title: string;
    type: string;
  }): Promise<ApiResponse> {
    return this.request('/api/wills/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserWill(userEmail: string): Promise<ApiResponse> {
    return this.request(`/api/wills/user-email/${encodeURIComponent(userEmail)}`);
  }

  async finalizeWill(data: {
    user_email: string;
    will_id?: number;
    recipients?: Array<{ email: string; name?: string; full_name?: string }>;
  }): Promise<ApiResponse> {
    return this.request('/api/wills/finalize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload audio to R2
  async uploadAudio(data: {
    user_email: string;
    audioFile: Blob | ArrayBuffer | Uint8Array;
    staging?: boolean;
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      // Convert ArrayBuffer/Uint8Array to Blob if needed
      let blob: Blob;
      if (data.audioFile instanceof Blob) {
        blob = data.audioFile;
      } else if (data.audioFile instanceof ArrayBuffer) {
        blob = new Blob([data.audioFile], { type: 'audio/webm' });
      } else {
        blob = new Blob([data.audioFile], { type: 'audio/webm' });
      }
      
      formData.append('audio', blob as any, 'audio-will.webm');
      formData.append('user_email', data.user_email);
      if (data.staging) {
        formData.append('staging', 'true');
      }

      const url = `${API_BASE_URL}/api/upload/audio`.replace(/([^:]\/)\/+/g, '$1'); // Remove double slashes
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to upload audio',
          error: result.error || result.message,
        };
      }

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error',
        error: error.message,
      };
    }
  }

  // Upload video to R2
  async uploadVideo(data: {
    user_email: string;
    videoFile: Blob | ArrayBuffer | Uint8Array;
    staging?: boolean;
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      // Convert ArrayBuffer/Uint8Array to Blob if needed
      let blob: Blob;
      if (data.videoFile instanceof Blob) {
        blob = data.videoFile;
      } else if (data.videoFile instanceof ArrayBuffer) {
        blob = new Blob([data.videoFile], { type: 'video/webm' });
      } else {
        blob = new Blob([data.videoFile], { type: 'video/webm' });
      }
      
      formData.append('video', blob as any, 'video-will.webm');
      formData.append('user_email', data.user_email);
      if (data.staging) {
        formData.append('staging', 'true');
      }

      const url = `${API_BASE_URL}/api/upload/video`.replace(/([^:]\/)\/+/g, '$1'); // Remove double slashes
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to upload video',
          error: result.error || result.message,
        };
      }

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error',
        error: error.message,
      };
    }
  }

  // Check upload status
  async checkUploadStatus(): Promise<ApiResponse> {
    return this.request('/api/upload/status', {
      method: 'GET',
    });
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    mobile?: string;
    address1?: string;
    address2?: string;
    age?: number;
    gender?: string;
    state?: string;
    postal_code?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Recipients - update and delete
  async updateRecipient(recipientId: number, data: {
    user_email: string;
    full_name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
    address?: string;
  }): Promise<ApiResponse> {
    return this.request(`/api/recipients/${recipientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecipient(recipientId: number, data: { user_email: string }): Promise<ApiResponse> {
    return this.request(`/api/recipients/${recipientId}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Email verification
  async sendVerificationEmail(data: { user_email: string; user_id?: number }): Promise<ApiResponse> {
    return this.request('/api/email-verification/send-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/api/email-verification/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  }

  async checkVerificationStatus(userId: number): Promise<ApiResponse> {
    return this.request(`/api/email-verification/status/${userId}`, {
      method: 'GET',
    });
  }

  // Chat endpoints
  async saveChatMessage(data: {
    user_email?: string;
    user_id?: number;
    role: 'user' | 'assistant';
    content: string;
    will_id?: number;
    audio_url?: string;
    video_url?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async saveChatMessages(data: {
    user_email?: string;
    user_id?: number;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      audio_url?: string;
      video_url?: string;
    }>;
    will_id?: number;
  }): Promise<ApiResponse> {
    return this.request('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatMessages(data: {
    user_email?: string;
    user_id?: number;
    will_id?: number;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (data.user_email) params.append('user_email', data.user_email);
    if (data.user_id) params.append('user_id', data.user_id.toString());
    if (data.will_id) params.append('will_id', data.will_id.toString());

    return this.request(`/api/chat/messages?${params.toString()}`, {
      method: 'GET',
    });
  }

  async uploadChatAudio(data: {
    user_email: string;
    audioFile: Blob | ArrayBuffer | Uint8Array;
    will_id?: number;
    staging?: boolean;
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      let blob: Blob;
      if (data.audioFile instanceof Blob) {
        blob = data.audioFile;
      } else if (data.audioFile instanceof ArrayBuffer) {
        blob = new Blob([data.audioFile], { type: 'audio/webm' });
      } else {
        blob = new Blob([data.audioFile], { type: 'audio/webm' });
      }
      
      formData.append('audio', blob as any, 'audio-will.webm');
      formData.append('user_email', data.user_email);
      if (data.will_id) {
        formData.append('will_id', data.will_id.toString());
      }
      if (data.staging) {
        formData.append('staging', 'true');
      }

      const url = `${API_BASE_URL}/api/chat/upload-audio`.replace(/([^:]\/)\/+/g, '$1');
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to upload audio',
          error: result.error || result.message,
        };
      }

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error',
        error: error.message,
      };
    }
  }

  async uploadChatVideo(data: {
    user_email: string;
    videoFile: Blob | ArrayBuffer | Uint8Array;
    will_id?: number;
    staging?: boolean;
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      let blob: Blob;
      if (data.videoFile instanceof Blob) {
        blob = data.videoFile;
      } else if (data.videoFile instanceof ArrayBuffer) {
        blob = new Blob([data.videoFile], { type: 'video/webm' });
      } else {
        blob = new Blob([data.videoFile], { type: 'video/webm' });
      }
      
      formData.append('video', blob as any, 'video-will.webm');
      formData.append('user_email', data.user_email);
      if (data.will_id) {
        formData.append('will_id', data.will_id.toString());
      }
      if (data.staging) {
        formData.append('staging', 'true');
      }

      const url = `${API_BASE_URL}/api/chat/upload-video`.replace(/([^:]\/)\/+/g, '$1');
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to upload video',
          error: result.error || result.message,
        };
      }

      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Network error',
        error: error.message,
      };
    }
  }
}

export const backendApi = new BackendApi();
