const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/600x400?text=No+Image';

// Resolves uploaded image paths (/uploads/news/file.jpg) to full backend URLs.
// Pass-through for external http/https URLs. Returns a fallback image if the path is missing.
export const getImageUrl = (path) => {
  if (!path) return DEFAULT_IMAGE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');

  // If body is FormData, don't set Content-Type — browser sets it with boundary automatically
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Server error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth
export const adminLogin = (credentials) =>
  apiCall('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

// News CMS
// BUG FIX: params was being passed as an object → appended as [object Object] in the URL.
// Now accepts either a query string '?limit=100' or a params object { limit: 100, status: 'published' }.
export const getNews = async (params = '') => {
  let query = '';
  if (typeof params === 'object' && params !== null) {
    const qs = new URLSearchParams(params).toString();
    query = qs ? `?${qs}` : '';
  } else {
    query = params; // already a string like '?limit=100'
  }
  const response = await apiCall(`/api/news${query}`);
  return response.data || response;
};

export const searchNews = async (query) => {
  if (!query || !query.trim()) return [];
  const response = await apiCall(`/api/news?search=${encodeURIComponent(query.trim())}&limit=10`);
  return response.data || response;
};

// BUG FIX: createNews and updateNews now accept either plain object (JSON) or FormData (file upload).
// When FormData is passed, Content-Type is omitted so browser sets multipart boundary correctly.
export const createNews = (news) => {
  if (news instanceof FormData) {
    return apiCall('/api/news', { method: 'POST', body: news });
  }
  return apiCall('/api/news', { method: 'POST', body: JSON.stringify(news) });
};

export const updateNews = (id, news) => {
  if (news instanceof FormData) {
    return apiCall(`/api/news/${id}`, { method: 'PUT', body: news });
  }
  return apiCall(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(news) });
};

export const deleteNews = (id) => apiCall(`/api/news/${id}`, { method: 'DELETE' });

export const getCategories = async () => {
  const response = await apiCall('/api/categories');
  return Array.isArray(response) ? response : (response?.data || []);
};
export const createCategory = (category) =>
  apiCall('/api/categories', { method: 'POST', body: JSON.stringify(category) });

export const getStats = () => apiCall('/api/admin/stats');

export const getNewsByCategory = (categoryId) => getNews(`?category=${categoryId}`);
export const getCategoriesList = () => apiCall('/api/categories');

export const getRecentNews = async () => {
  const response = await apiCall('/api/news?limit=20');
  return response.data || response;
};



// ─── ADD THESE TO YOUR adminApi.js ───────────────────────────────────────────
// Paste below your existing getRecentNews export

export const getBlogs = async (params = '') => {
  let query = '';
  if (typeof params === 'object' && params !== null) {
    const qs = new URLSearchParams(params).toString();
    query = qs ? `?${qs}` : '';
  } else {
    query = params;
  }
  const response = await apiCall(`/api/blogs${query}`);
  return response.data || response;
};

export const getBlogById = (id) => apiCall(`/api/blogs/${id}`);

export const createBlog = (blog) => {
  if (blog instanceof FormData) return apiCall('/api/blogs', { method: 'POST', body: blog });
  return apiCall('/api/blogs', { method: 'POST', body: JSON.stringify(blog) });
};

export const updateBlog = (id, blog) => {
  if (blog instanceof FormData) return apiCall(`/api/blogs/${id}`, { method: 'PUT', body: blog });
  return apiCall(`/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(blog) });
};

export const deleteBlog = (id) => apiCall(`/api/blogs/${id}`, { method: 'DELETE' });

export const getRecentBlogs = async () => {
  const response = await apiCall('/api/blogs?limit=10&status=published');
  return response.data || response;
};


// ─── ADD THESE TO YOUR adminApi.js ───────────────────────────────────────────

// Public — returns { main: [...], upnext: [...] } grouped by section
export const getVideos = async (params = '') => {
  let query = '';
  if (typeof params === 'object' && params !== null) {
    const qs = new URLSearchParams(params).toString();
    query = qs ? `?${qs}` : '';
  } else {
    query = params;
  }
  return apiCall(`/api/videos${query}`);
};

// Admin — paginated flat list
export const getAllVideos = async (params = '') => {
  let query = '';
  if (typeof params === 'object' && params !== null) {
    const qs = new URLSearchParams(params).toString();
    query = qs ? `?${qs}` : '';
  } else {
    query = params;
  }
  const response = await apiCall(`/api/videos/all${query}`);
  return response.data || response;
};

export const getVideoById = (id) => apiCall(`/api/videos/${id}`);

export const createVideo = (video) => {
  if (video instanceof FormData) return apiCall('/api/videos', { method: 'POST', body: video });
  return apiCall('/api/videos', { method: 'POST', body: JSON.stringify(video) });
};

export const updateVideo = (id, video) => {
  if (video instanceof FormData) return apiCall(`/api/videos/${id}`, { method: 'PUT', body: video });
  return apiCall(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(video) });
};

export const deleteVideo = (id) => apiCall(`/api/videos/${id}`, { method: 'DELETE' });



export const getAdsByPosition = (position) =>
  apiCall(`/api/ads?position=${position}`);

// Track impression — call on component mount
export const trackAdImpression = (id, pageUrl = window.location.href) =>
  apiCall(`/api/ads/${id}/impression`, {
    method: 'POST',
    body: JSON.stringify({ page_url: pageUrl }),
  }).catch(() => {}); // silent fail — never break the page for an ad

// Track click — call before navigating to ad link
export const trackAdClick = (id, pageUrl = window.location.href) =>
  apiCall(`/api/ads/${id}/click`, {
    method: 'POST',
    body: JSON.stringify({ page_url: pageUrl }),
  }).catch(() => {});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllAds = async (params = '') => {
  let query = '';
  if (typeof params === 'object' && params !== null) {
    const qs = new URLSearchParams(params).toString();
    query = qs ? `?${qs}` : '';
  } else {
    query = params;
  }
  const response = await apiCall(`/api/ads/all${query}`);
  return response.data || response;
};

export const getAdById    = (id)      => apiCall(`/api/ads/${id}`);
export const getAdStats   = (id, days = 30) => apiCall(`/api/ads/${id}/stats?days=${days}`);

export const createAd = (ad) => {
  if (ad instanceof FormData) return apiCall('/api/ads', { method: 'POST', body: ad });
  return apiCall('/api/ads', { method: 'POST', body: JSON.stringify(ad) });
};

export const updateAd = (id, ad) => {
  if (ad instanceof FormData) return apiCall(`/api/ads/${id}`, { method: 'PUT', body: ad });
  return apiCall(`/api/ads/${id}`, { method: 'PUT', body: JSON.stringify(ad) });
};

export const deleteAd = (id) => apiCall(`/api/ads/${id}`, { method: 'DELETE' });



// Add this to your adminApi.js file
export const deleteCategory = (id) => apiCall(`/api/categories/${id}`, { method: 'DELETE' });