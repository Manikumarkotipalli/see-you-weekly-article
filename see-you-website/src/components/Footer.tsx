import {  ExternalLink, XIcon, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} SeeYou.Weekly. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Built with Next.js, Spring Boot, and SQL Server.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            aria-label="GitHub Profile"
          >
            <Globe size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            aria-label="LinkedIn Profile"
          >
            <ExternalLink size={20} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            aria-label="Twitter / X Profile"
          >
            <XIcon size={20} />
          </a>
          <Link
            href="/about"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            aria-label="Portfolio Website"
          >
            <Globe size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
