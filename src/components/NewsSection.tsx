import React from 'react';
import { ArrowRight, Newspaper, Clock, User } from 'lucide-react';
import { NEWS_ARTICLES } from '../data/gamingData';
import { NewsArticle } from '../types/gaming';
import { soundFx } from '../utils/soundEffects';
import { SectionHeader } from './SectionHeader';

interface NewsSectionProps {
  onReadArticle: (article: NewsArticle) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onReadArticle }) => {
  return (
    <section id="news" className="relative py-28 bg-[#050711] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Cyber UI */}
        <SectionHeader
          sectionNumber="08"
          tagline="DISPATCHES & DEBRIEFS // INTEL TRANSMISSIONS"
          title="FROM THE ARENA"
          subtitle="Patch releases, tournament breakdowns, graphics engineering, and industry shifts."
          accentColor="#00F0FF"
          icon={<Newspaper className="w-6 h-6 text-cyan-400" />}
        />

        {/* 4 Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {NEWS_ARTICLES.map((article, idx) => (
            <article
              key={article.id}
              onClick={() => {
                soundFx.playClick();
                onReadArticle(article);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="group rounded-2xl bg-[#090D1C] border border-white/10 hover:border-cyan-400/80 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer hover:shadow-[0_10px_35px_rgba(0,240,255,0.18)] hover:-translate-y-1"
            >
              <div>
                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
                  <span className="font-bold">{article.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{article.date}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{article.readTime}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-gaming text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  {article.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-mono">
                  By {article.author}
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold font-gaming text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                >
                  <span>READ MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
