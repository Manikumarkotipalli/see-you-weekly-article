import Link from 'next/link';
import { Calendar, Clock, ThumbsUp, Heart, MessageSquare } from 'lucide-react';
import { ArticleSummary } from '@/services/api';

interface ArticleCardProps {
  article: ArticleSummary;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.createdDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="group relative flex flex-col items-start rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {article.featuredImage && (
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImage}
            alt={article.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {article.categoryName}
          </span>
        </div>
      )}

      <div className="flex-1 p-6 flex flex-col w-full">
        {!article.featuredImage && (
          <div className="mb-3">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {article.categoryName}
            </span>
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          <Link href={`/articles/${article.slug}`}>
            <span className="absolute inset-0 z-10" />
            {article.title}
          </Link>
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed flex-grow">
          {article.summary}
        </p>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 w-full">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {article.readingTime} min read
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
              <ThumbsUp size={12} className="text-emerald-500" />
              {article.likeCount}
            </span>
            <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
              <Heart size={12} className="text-red-500" />
              {article.loveCount}
            </span>
            <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
              <MessageSquare size={12} className="text-blue-500" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
