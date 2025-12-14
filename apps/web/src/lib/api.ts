// ============================================================================
// API Client
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed', data);
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: (token: string) =>
    request<any>('/api/auth/me', {
      token,
    }),

  // Capability Documents
  getCapabilityDocuments: (token: string, filters?: { doc_type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.doc_type) params.append('doc_type', filters.doc_type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/capability-documents${query}`, { token });
  },

  createCapabilityDocument: (
    token: string,
    data: { title: string; doc_type: string; tags?: string[] }
  ) =>
    request<any>('/api/capability-documents', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  // Capability Facts
  getCapabilityFacts: (
    token: string,
    filters?: { fact_type?: string; verified?: boolean }
  ) => {
    const params = new URLSearchParams();
    if (filters?.fact_type) params.append('fact_type', filters.fact_type);
    if (filters?.verified !== undefined)
      params.append('verified', String(filters.verified));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/capability-facts${query}`, { token });
  },

  verifyCapabilityFact: (token: string, factId: string) =>
    request<any>(`/api/capability-facts/${factId}/verify`, {
      method: 'PATCH',
      token,
    }),

  // Company Claims
  getCompanyClaims: (token: string) =>
    request<any[]>('/api/company-claims', { token }),

  createCompanyClaim: (
    token: string,
    data: {
      claim_text: string;
      claim_type: string;
      supporting_facts?: string[];
    }
  ) =>
    request<any>('/api/company-claims', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  updateCompanyClaim: (
    token: string,
    claimId: string,
    data: {
      claim_text?: string;
      status?: string;
      supporting_facts?: string[];
    }
  ) =>
    request<any>(`/api/company-claims/${claimId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),
};
