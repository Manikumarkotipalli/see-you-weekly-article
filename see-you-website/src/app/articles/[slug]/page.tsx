'use client';

import React, { useEffect, useState } from 'react';
import { api, ArticleDetail, ArticleSummary, Comment } from '@/services/api';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Calendar, Clock, ThumbsUp, Heart, MessageSquare, Share2, XIcon, ExternalLink, Link2, ChevronLeft, Send, Check } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const { slug } = React.use(params);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reaction State
  const [hasLiked, setHasLiked] = useState(false);
  const [hasLoved, setHasLoved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loveCount, setLoveCount] = useState(0);

  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Share State
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const articleData = await api.getArticle(slug);
        setArticle(articleData);
        setLikeCount(articleData.likeCount);
        setLoveCount(articleData.loveCount);

        // Load local reaction state
        if (typeof window !== 'undefined') {
          setHasLiked(localStorage.getItem(`reacted_like_${articleData.id}`) === 'true');
          setHasLoved(localStorage.getItem(`reacted_love_${articleData.id}`) === 'true');
        }

        // Fetch related
        const relatedData = await api.getRelatedArticles(slug);
        setRelated(relatedData);
      } catch (err: any) {
        setError(err.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  const handleReact = async (type: 'LIKE' | 'LOVE') => {
    if (!article) return;
    try {
      const res = await api.reactToArticle(article.id, type);
      if (type === 'LIKE') {
        const added = res.status === 'ADDED';
        setHasLiked(added);
        setLikeCount(prev => added ? prev + 1 : prev - 1);
        localStorage.setItem(`reacted_like_${article.id}`, added ? 'true' : 'false');
      } else {
        const added = res.status === 'ADDED';
        setHasLoved(added);
        setLoveCount(prev => added ? prev + 1 : prev - 1);
        localStorage.setItem(`reacted_love_${article.id}`, added ? 'true' : 'false');
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !commentName.trim() || !commentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const newComment = await api.addComment(article.id, commentName, commentText);
      
      // Update local article comment list
      setArticle(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...prev.comments]
        };
      });

      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err: any) {
      setCommentError(err.message || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Article Not Found</h2>
        <p className="text-slate-500">{error || 'The requested article could not be loaded.'}</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          <ChevronLeft size={16} />
          <span>Back to Articles</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.createdDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-10">
      {/* Back button */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors">
          <ChevronLeft size={16} />
          <span>Back to list</span>
        </Link>
      </div>

      {/* Hero Header */}
      <header className="space-y-4">
        <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {article.category.name}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.author.profileImage}
              alt={article.author.name}
              className="h-10 w-10 rounded-full object-cover border border-emerald-500"
            />
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{article.author.name}</span>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-0.5"><Calendar size={12} />{formattedDate}</span>
                <span className="flex items-center gap-0.5"><Clock size={12} />{article.readingTime} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
              title="Copy URL"
            >
              {copiedLink ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
              title="Share on Twitter"
            >
              <XIcon size={16} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
              title="Share on LinkedIn"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImage}
            alt={article.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Markdown Content */}
      <article className="prose dark:prose-invert mx-auto w-full leading-relaxed border-b border-slate-200 dark:border-slate-800 pb-10">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </article>

      {/* Interactive Reactions System */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-slate-900 dark:text-white">Did you enjoy this article?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave a reaction for the author.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleReact('LIKE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer shadow-sm ${
              hasLiked
                ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ThumbsUp size={16} className={hasLiked ? 'fill-white' : ''} />
            <span>Like</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-700/50">
              {likeCount}
            </span>
          </button>

          <button
            onClick={() => handleReact('LOVE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer shadow-sm ${
              hasLoved
                ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Heart size={16} className={hasLoved ? 'fill-white' : ''} />
            <span>Love</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-700/50">
              {loveCount}
            </span>
          </button>
        </div>
      </section>

      {/* Interactive Comments System */}
      <section className="space-y-6 pt-4">
        <h3 className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
          <MessageSquare className="text-emerald-500" size={22} />
          <span>Comments ({article.comments.length})</span>
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Share your thoughts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Comment</label>
            <textarea
              required
              rows={4}
              placeholder="What did you think of this article?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              {commentSuccess && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Comment posted successfully!</span>
              )}
              {commentError && (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">{commentError}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={submittingComment}
              className="px-5 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
              <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-4">
          {article.comments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No comments yet. Be the first to start the discussion!</p>
          ) : (
            article.comments.map((comment) => (
              <div key={comment.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.username}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(comment.createdDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {comment.commentText}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">Related Weekly Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
