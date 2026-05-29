'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ArticleSummary, Category, Author } from '@/services/api';
import { 
  Shield, LayoutDashboard, FileText, MessageSquare, Tags, User, Plus, Edit, Trash2, 
  Check, AlertTriangle, Eye, ArrowLeft, Send, Sparkles, LogOut, Loader2 
} from 'lucide-react';

type Tab = 'overview' | 'articles' | 'comments' | 'categories' | 'profile';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Dashboard & Auth states
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalComments: 0,
    pendingComments: 0,
    totalReactions: 0
  });

  // Data lists
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);

  // Form Editor state
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  
  // Article form inputs
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleFeaturedImage, setArticleFeaturedImage] = useState('');
  const [articleStatus, setArticleStatus] = useState('DRAFT');
  const [articleReadingTime, setArticleReadingTime] = useState<number | ''>('');
  const [articleCategoryId, setArticleCategoryId] = useState<number | ''>('');

  // Category form inputs
  const [newCategoryName, setNewCategoryName] = useState('');

  // Author form inputs
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  const [authorGithub, setAuthorGithub] = useState('');
  const [authorLinkedin, setAuthorLinkedin] = useState('');
  const [authorTwitter, setAuthorTwitter] = useState('');
  const [authorPortfolio, setAuthorPortfolio] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Auth route guard
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      loadDashboardData();
    }
  }, [router]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, articlesData, categoriesData, commentsData, authorData] = await Promise.all([
        api.adminGetOverview(),
        api.adminGetArticles(),
        api.getCategories(),
        api.adminGetComments(),
        api.getAuthor().catch(() => null) // Allow to fail if empty
      ]);

      setStats(statsData);
      setArticles(articlesData);
      setCategories(categoriesData);
      setComments(commentsData || []);
      
      if (authorData) {
        setAuthor(authorData);
        // Prefill profile form
        setAuthorName(authorData.name);
        setAuthorBio(authorData.bio);
        setAuthorImage(authorData.profileImage);
        setAuthorGithub(authorData.githubLink || '');
        setAuthorLinkedin(authorData.linkedinLink || '');
        setAuthorTwitter(authorData.twitterLink || '');
        setAuthorPortfolio(authorData.portfolioLink || '');
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (err.message && err.message.includes('Unauthorized')) {
        api.adminLogout();
        router.push('/admin/login');
      }
      showMessage('Failed to load data. Make sure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    router.push('/');
  };

  // ==========================================
  // ARTICLE CRUD HANDLERS
  // ==========================================

  const startNewArticle = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleSlug('');
    setArticleContent('');
    setArticleSummary('');
    setArticleFeaturedImage('');
    setArticleStatus('DRAFT');
    setArticleReadingTime('');
    setArticleCategoryId(categories.length > 0 ? categories[0].id : '');
    setIsEditingArticle(true);
  };

  const startEditArticle = async (id: number) => {
    setActionLoading(true);
    try {
      // Find summary data and fetch full article slug to prefill content
      const summary = articles.find(a => a.id === id);
      if (!summary) return;

      const fullArticle = await api.getArticle(summary.slug);
      
      setEditingArticleId(id);
      setArticleTitle(fullArticle.title);
      setArticleSlug(fullArticle.slug);
      setArticleContent(fullArticle.content);
      setArticleSummary(fullArticle.summary || '');
      setArticleFeaturedImage(fullArticle.featuredImage || '');
      setArticleStatus(fullArticle.status);
      setArticleReadingTime(fullArticle.readingTime);
      setArticleCategoryId(fullArticle.category ? fullArticle.category.id : '');
      setIsEditingArticle(true);
    } catch (err) {
      showMessage('Failed to fetch article details', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle || !articleContent || !articleCategoryId) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    setActionLoading(true);
    const payload = {
      title: articleTitle,
      slug: articleSlug || undefined,
      content: articleContent,
      summary: articleSummary || undefined,
      featuredImage: articleFeaturedImage || undefined,
      status: articleStatus,
      readingTime: articleReadingTime === '' ? undefined : Number(articleReadingTime),
      categoryId: Number(articleCategoryId)
    };

    try {
      if (editingArticleId) {
        await api.adminUpdateArticle(editingArticleId, payload);
        showMessage('Article updated successfully!');
      } else {
        await api.adminCreateArticle(payload);
        showMessage('Article created successfully!');
      }
      setIsEditingArticle(false);
      loadDashboardData();
    } catch (err: any) {
      showMessage(err.message || 'Failed to save article.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article? This will remove reactions and comments.')) return;
    setActionLoading(true);
    try {
      await api.adminDeleteArticle(id);
      showMessage('Article deleted.');
      loadDashboardData();
    } catch (err) {
      showMessage('Failed to delete article.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // COMMENT MODERATION HANDLERS
  // ==========================================

  const updateCommentStatus = async (id: number, status: 'APPROVED' | 'SPAM') => {
    try {
      await api.adminUpdateCommentStatus(id, status);
      showMessage(`Comment status updated to ${status}.`);
      loadDashboardData();
    } catch (err) {
      showMessage('Failed to update comment status', 'error');
    }
  };

  const deleteComment = async (id: number) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await api.adminDeleteComment(id);
      showMessage('Comment deleted.');
      loadDashboardData();
    } catch (err) {
      showMessage('Failed to delete comment', 'error');
    }
  };

  // ==========================================
  // CATEGORIES HANDLERS
  // ==========================================

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await api.adminCreateCategory(newCategoryName);
      setNewCategoryName('');
      showMessage('Category added!');
      loadDashboardData();
    } catch (err: any) {
      showMessage(err.message || 'Failed to add category.', 'error');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category? This will fail if articles are linked.')) return;
    try {
      await api.adminDeleteCategory(id);
      showMessage('Category deleted.');
      loadDashboardData();
    } catch (err: any) {
      showMessage(err.message || 'Failed to delete category.', 'error');
    }
  };

  // ==========================================
  // PROFILE HANDLERS
  // ==========================================

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorBio.trim() || !authorImage.trim()) {
      showMessage('Profile name, bio and image are required.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await api.adminUpdateAuthor({
        name: authorName,
        bio: authorBio,
        profileImage: authorImage,
        githubLink: authorGithub || undefined,
        linkedinLink: authorLinkedin || undefined,
        twitterLink: authorTwitter || undefined,
        portfolioLink: authorPortfolio || undefined
      });
      showMessage('Profile updated!');
      loadDashboardData();
    } catch (err) {
      showMessage('Failed to update author profile', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full flex-grow flex flex-col md:flex-row gap-8">
      
      {/* Tab Selector Column */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="text-emerald-500" size={18} />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Control Panel</span>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('overview'); setIsEditingArticle(false); }}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'overview' && !isEditingArticle
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('articles'); setIsEditingArticle(false); }}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'articles' || isEditingArticle
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={18} />
              <span>Articles</span>
            </button>

            <button
              onClick={() => { setActiveTab('comments'); setIsEditingArticle(false); }}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'comments' && !isEditingArticle
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare size={18} />
              <span>Comments</span>
              {stats.pendingComments > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingComments}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setIsEditingArticle(false); }}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'categories' && !isEditingArticle
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Tags size={18} />
              <span>Categories</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setIsEditingArticle(false); }}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'profile' && !isEditingArticle
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User size={18} />
              <span>Author Profile</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="flex-grow space-y-6">
        
        {/* Dynamic Alerts */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
            message.type === 'success'
              ? 'bg-green-50/50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-300'
              : 'bg-red-50/50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-300'
          }`}>
            <Check size={16} />
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
          </div>
        ) : isEditingArticle ? (
          
          /* ==========================================
             SUB-VIEW: ARTICLE EDITOR FORM
             ========================================== */
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <button 
                onClick={() => setIsEditingArticle(false)}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingArticleId ? 'Edit Article' : 'Create Weekly Article'}
              </h2>
            </div>

            <form onSubmit={saveArticle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="e.g. Scaling Spring Boot in 2026"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slug (Auto-generated if empty)</label>
                  <input
                    type="text"
                    value={articleSlug}
                    onChange={(e) => setArticleSlug(e.target.value)}
                    placeholder="e.g. scaling-spring-boot-in-2026"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    required
                    value={articleCategoryId}
                    onChange={(e) => setArticleCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={articleStatus}
                    onChange={(e) => setArticleStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reading Time (Minutes)</label>
                  <input
                    type="number"
                    value={articleReadingTime}
                    onChange={(e) => setArticleReadingTime(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Auto-calculated if empty"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Featured Image URL</label>
                <input
                  type="text"
                  value={articleFeaturedImage}
                  onChange={(e) => setArticleFeaturedImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Article Summary *</label>
                <input
                  type="text"
                  required
                  value={articleSummary}
                  onChange={(e) => setArticleSummary(e.target.value)}
                  placeholder="Provide a brief summary for lists"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Content (Supports Markdown) *</label>
                <textarea
                  required
                  rows={14}
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  placeholder="### Introduction..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingArticle(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          
          /* ==========================================
             SUB-VIEW: TABS CONTROL SWITCH
             ========================================== */
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Overview Dashboard</h1>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Articles', val: stats.totalArticles, desc: `${stats.publishedArticles} Published / ${stats.draftArticles} Drafts` },
                    { label: 'Total Comments', val: stats.totalComments, desc: `${stats.pendingComments} Pending Moderation` },
                    { label: 'Total Reactions', val: stats.totalReactions, desc: 'Likes & Loves' },
                  ].map((metric) => (
                    <div key={metric.label} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{metric.label}</span>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white block mt-2">{metric.val}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1.5">{metric.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 to-indigo-50/50 dark:from-emerald-950/15 dark:to-indigo-950/15 p-8 text-center space-y-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Quick Actions</h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startNewArticle}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Write Article</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Articles Manager</h1>
                  <button
                    onClick={startNewArticle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create Article</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Released Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                        {articles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">No articles created yet.</td>
                          </tr>
                        ) : (
                          articles.map((art) => (
                            <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{art.title}</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-full border border-slate-200 dark:border-slate-700">{art.categoryName}</span></td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                  art.status === 'PUBLISHED' 
                                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                                    : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {art.status}
                                </span>
                              </td>
                              <td className="p-4">{new Date(art.createdDate).toLocaleDateString('en-US')}</td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => startEditArticle(art.id)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => deleteArticle(art.id)}
                                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
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
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Comments Moderator</h1>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 rounded-2xl text-center text-slate-400 shadow-sm">
                      No comments submitted yet.
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{c.username}</span>
                            <span className="text-xs text-slate-400">on {c.article ? c.article.title : 'Deleted Article'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{new Date(c.createdDate).toLocaleDateString('en-US')}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              c.status === 'APPROVED' 
                                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300' 
                                : c.status === 'SPAM'
                                ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                                : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 dark:text-slate-300">{c.commentText}</p>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {c.status !== 'APPROVED' && (
                            <button
                              onClick={() => updateCommentStatus(c.id, 'APPROVED')}
                              className="px-3 py-1 bg-green-500/10 hover:bg-green-500 text-green-700 dark:text-green-400 hover:text-white text-xs font-semibold rounded-lg border border-green-500/20 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {c.status !== 'SPAM' && (
                            <button
                              onClick={() => updateCommentStatus(c.id, 'SPAM')}
                              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-white text-xs font-semibold rounded-lg border border-amber-500/20 transition-all cursor-pointer"
                            >
                              Flag Spam
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-700 hover:text-white text-xs font-semibold rounded-lg border border-red-500/20 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Categories Manager</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category add form */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-4 h-fit">
                    <h3 className="font-bold text-slate-900 dark:text-white">Add New Category</h3>
                    <form onSubmit={addCategory} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
                        <input
                          type="text"
                          required
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="e.g. Tutorials"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Plus size={16} />
                        <span>Add Category</span>
                      </button>
                    </form>
                  </div>

                  {/* Categories list */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Existing Categories</h3>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {categories.map((c) => (
                        <li key={c.id} className="py-2.5 flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">{c.name}</span>
                          <button
                            onClick={() => deleteCategory(c.id)}
                            className="p-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edit Author Profile</h1>

                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Author Name *</label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Profile Image URL *</label>
                        <input
                          type="text"
                          required
                          value={authorImage}
                          onChange={(e) => setAuthorImage(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bio *</label>
                      <textarea
                        required
                        rows={4}
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">GitHub Profile URL</label>
                        <input
                          type="text"
                          value={authorGithub}
                          onChange={(e) => setAuthorGithub(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                        <input
                          type="text"
                          value={authorLinkedin}
                          onChange={(e) => setAuthorLinkedin(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Twitter Profile URL</label>
                        <input
                          type="text"
                          value={authorTwitter}
                          onChange={(e) => setAuthorTwitter(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Portfolio/Resume Website URL</label>
                        <input
                          type="text"
                          value={authorPortfolio}
                          onChange={(e) => setAuthorPortfolio(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading ? 'Saving...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
