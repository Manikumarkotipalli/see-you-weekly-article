import {Globe, ExternalLink, XIcon, Link as LinkIcon } from 'lucide-react';
import { Author } from '@/services/api';

interface AuthorCardProps {
  author?: Author;
  loading?: boolean;
}

export default function AuthorCard({ author, loading }: AuthorCardProps) {
  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1">
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800 mt-2" />
          </div>
        </div>
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800 mt-4" />
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800 mt-2" />
      </div>
    );
  }

  if (!author) return null;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={author.profileImage}
          alt={author.name}
          className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500"
        />
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{author.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Tech & Data Writer</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
        {author.bio}
      </p>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        {author.githubLink && (
          <a
            href={author.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <Globe size={18} />
          </a>
        )}
        {author.linkedinLink && (
          <a
            href={author.linkedinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <ExternalLink size={18} />
          </a>
        )}
        {author.twitterLink && (
          <a
            href={author.twitterLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <XIcon size={18} />
          </a>
        )}
        {author.portfolioLink && (
          <a
            href={author.portfolioLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <LinkIcon size={18} />
          </a>
        )}
      </div>
    </div>
  );
}
