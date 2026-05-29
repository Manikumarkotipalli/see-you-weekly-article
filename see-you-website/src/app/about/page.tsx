'use client';

import { useEffect, useState } from 'react';
import { api, Author } from '@/services/api';
import { Globe, ExternalLink, XIcon, Link as LinkIcon, Mail, BookOpen, User, Star } from 'lucide-react';

export default function About() {
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const data = await api.getAuthor();
        setAuthor(data);
      } catch (err) {
        console.error('Failed to load author profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-6 items-center">
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 mt-8" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-slate-500">Could not connect to the backend server to load the author profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-12">
      {/* Intro section */}
      <section className="flex flex-col md:flex-row items-center gap-8 md:items-start border-b border-slate-200 dark:border-slate-800 pb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={author.profileImage}
          alt={author.name}
          className="h-32 w-32 rounded-2xl object-cover border-4 border-emerald-500 shadow-md"
        />
        <div className="space-y-4 text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About {author.name}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Data Engineer & Technical Writer
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {author.githubLink && (
              <a
                href={author.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Globe size={16} />
                <span>GitHub</span>
              </a>
            )}
            {author.linkedinLink && (
              <a
                href={author.linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ExternalLink size={16} />
                <span>LinkedIn</span>
              </a>
            )}
            {author.twitterLink && (
              <a
                href={author.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <XIcon size={16} />
                <span>Twitter</span>
              </a>
            )}
            {author.portfolioLink && (
              <a
                href={author.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LinkIcon size={16} />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Profile Details */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <User className="text-emerald-500" size={24} />
          <span>Biography</span>
        </h2>
        <div className="text-slate-700 dark:text-slate-300 space-y-4 text-base leading-relaxed">
          <p>{author.bio}</p>
          <p>
            Welcome to my weekly article website, **SeeYou.Weekly**. Every week, I explore core topics in tech, data architectures, design patterns, and programming tutorials. My focus is on writing high-quality, readable, and practical guides that engineers can use to solve real-world problems.
          </p>
        </div>
      </section>

      {/* Expertise & Skills */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <BookOpen className="text-emerald-500" size={20} />
            <span>Weekly Scope</span>
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" />
              <span>**Technology**: Cloud patterns, Next.js, Spring Boot, systems design.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" />
              <span>**Data Engineering**: Spark, Kafka, real-time pipelines, SQL optimization.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" />
              <span>**Tutorials**: End-to-end setups, tooling guides, debugging workflows.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Star className="text-emerald-500" size={20} />
            <span>Core Skills</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Java', 'Spring Boot', 'Next.js', 'React.js', 'SQL Server', 'PostgreSQL', 'Apache Kafka', 'Data Engineering', 'System Architecture', 'CI/CD'].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Panel */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 to-indigo-50/50 dark:from-emerald-950/10 dark:to-indigo-950/10 p-8 text-center space-y-4">
        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Get in Touch</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Have an architectural question, a topic request for next week, or interested in collaborating? Feel free to reach out!
        </p>
        <a
          href="mailto:contact@seeyouweekly.com"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Mail size={16} />
          <span>Shoot an Email</span>
        </a>
      </section>
    </div>
  );
}
