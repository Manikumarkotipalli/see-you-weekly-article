const BASE_URL = 'http://localhost:8080/api';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function request(path: string, options: RequestInit = {}) {
  const headers = { ...getHeaders(), ...options.headers };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store' // Ensure we get fresh data
  });
  
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

export interface Author {
  id: number;
  name: string;
  bio: string;
  profileImage: string;
  githubLink?: string;
  linkedinLink?: string;
  twitterLink?: string;
  portfolioLink?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  status: string;
  readingTime: number;
  createdDate: string;
  updatedDate: string;
  categoryName: string;
  authorName: string;
  likeCount: number;
  loveCount: number;
  commentCount: number;
}

export interface Comment {
  id: number;
  username: string;
  commentText: string;
  status: string;
  createdDate: string;
}

export interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  featuredImage: string;
  status: string;
  readingTime: number;
  createdDate: string;
  updatedDate: string;
  category: Category;
  author: Author;
  likeCount: number;
  loveCount: number;
  comments: Comment[];
}

export const api = {
  // Get author profile info
  getAuthor: (): Promise<Author> => request('/author'),

  // Get categories list
  getCategories: (): Promise<Category[]> => request('/categories'),

  // List published articles
  getArticles: (category?: string, search?: string): Promise<ArticleSummary[]> => {
    let query = '';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const queryString = params.toString();
    if (queryString) query = `?${queryString}`;
    return request(`/articles${query}`);
  },

  // Get single article by slug
  getArticle: (slug: string): Promise<ArticleDetail> => request(`/articles/${slug}`),

  // Get related articles
  getRelatedArticles: (slug: string): Promise<ArticleSummary[]> => request(`/articles/${slug}/related`),

  // React to article (Like/Love)
  reactToArticle: (id: number, reactionType: 'LIKE' | 'LOVE'): Promise<{ status: 'ADDED' | 'REMOVED' }> => 
    request(`/articles/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    }),

  // Add comment to article
  addComment: (id: number, username: string, commentText: string): Promise<Comment> =>
    request(`/articles/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ username, commentText }),
    }),

  // ==========================================
  // ADMIN API ENDPOINTS
  // ==========================================

  adminLogin: async (username: string, password: string): Promise<{ token: string; username: string }> => {
    const data = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data && data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
    }
    return data;
  },

  adminLogout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
  },

  adminGetOverview: (): Promise<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalComments: number;
    pendingComments: number;
    totalReactions: number;
  }> => request('/admin/overview'),

  adminGetArticles: (): Promise<ArticleSummary[]> => request('/admin/articles'),

  adminCreateArticle: (article: {
    title: string;
    slug?: string;
    content: string;
    summary?: string;
    featuredImage?: string;
    status: string;
    readingTime?: number;
    categoryId: number;
  }): Promise<ArticleSummary> => request('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  }),

  adminUpdateArticle: (id: number, article: {
    title: string;
    slug?: string;
    content: string;
    summary?: string;
    featuredImage?: string;
    status: string;
    readingTime?: number;
    categoryId: number;
  }): Promise<ArticleSummary> => request(`/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  }),

  adminDeleteArticle: (id: number): Promise<{ status: string }> => request(`/admin/articles/${id}`, {
    method: 'DELETE',
  }),

  // Raw comment list containing full details for moderation
  adminGetComments: (): Promise<any[]> => request('/admin/comments'),

  adminUpdateCommentStatus: (id: number, status: 'APPROVED' | 'SPAM' | 'PENDING'): Promise<{ status: string }> => 
    request(`/admin/comments/${id}/status?status=${status}`, {
      method: 'PUT',
    }),

  adminDeleteComment: (id: number): Promise<{ status: string }> => request(`/admin/comments/${id}`, {
    method: 'DELETE',
  }),

  adminCreateCategory: (name: string): Promise<Category> => request('/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),

  adminDeleteCategory: (id: number): Promise<{ status: string }> => request(`/admin/categories/${id}`, {
    method: 'DELETE',
  }),

  adminUpdateAuthor: (author: {
    name: string;
    bio: string;
    profileImage: string;
    githubLink?: string;
    linkedinLink?: string;
    twitterLink?: string;
    portfolioLink?: string;
  }): Promise<Author> => request('/admin/author', {
    method: 'PUT',
    body: JSON.stringify(author),
  }),
};
