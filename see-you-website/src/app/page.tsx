'use client';

import { useEffect, useState } from 'react';
import { api, ArticleSummary, Category, Author } from '@/services/api';
import ArticleCard from '@/components/ArticleCard';
import AuthorCard from '@/components/AuthorCard';
import { Search, Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [author, setAuthor] = useState<Author>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [authorData, categoriesData] = await Promise.all([
          api.getAuthor(),
          api.getCategories()
        ]);
        setAuthor(authorData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load sidebar metadata:', err);
      } finally {
        setLoadingSidebar(false);
      }
    };
    loadSidebarData();
  }, []);

  useEffect(() => {
    const loadArticles = async () => {
      setLoadingArticles(true);
      setError(null);
      try {
        const data = await api.getArticles(selectedCategory, searchQuery);
        setArticles(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load articles. Make sure the backend is running!');
      } finally {
        setLoadingArticles(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadArticles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-8">
      {/* Hero section */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="space-y-4 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
            <Sparkles size={12} />
            <span>Weekly Article Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Deep Dives into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400">Tech & Data</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Exploring scalable architectures, real-time data pipelines, tutorials, and weekly notes on modern software engineering.
          </p>
        </div>

        {/* Hero art box */}
        <div className="hidden lg:block w-72 h-48 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl relative shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 flex items-center justify-center">
            <div className="text-center space-y-2 p-4">
              <span className="text-sm font-semibold block text-slate-700 dark:text-slate-300">Next Article Releases</span>
              <span className="text-xs text-slate-500">Every Sunday Morning</span>
              <div className="flex gap-1 justify-center mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Stay Tuned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Article Listing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>

            {/* Category list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Articles list */}
          {loadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-video p-6 animate-pulse space-y-4">
                  <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50/20 dark:bg-red-950/10 text-center space-y-3">
              <AlertCircle className="text-red-500" size={36} />
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">API Connection Offline</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                {error}
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
              <span className="text-slate-400 text-lg">No articles found</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Try searching for a different term or selection filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About Author</h2>
          <AuthorCard author={author} loading={loadingSidebar} />

          {/* Quick Categories Panel */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.name === selectedCategory ? '' : cat.name)}
                    className={`w-full text-left text-sm py-1.5 px-2.5 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full border border-slate-200 dark:border-slate-700">
                      Explore
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
