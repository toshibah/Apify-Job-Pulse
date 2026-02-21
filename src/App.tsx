import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Filter,
  Loader2,
  ChevronRight,
  Building2,
  Clock,
  Trash2,
  LayoutDashboard,
  ListFilter,
  Moon,
  Sun,
  Globe,
  Plus,
  X,
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Radar,
  Mail,
  Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchJobs, Job } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'website'>('search');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [websites, setWebsites] = useState<{id: number, name: string, url: string}[]>([]);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    fetchSavedJobs();
    fetchWebsites();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await fetch('/api/saved-jobs');
      const data = await res.json();
      setSavedJobs(data);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchWebsites = async () => {
    try {
      const res = await fetch('/api/websites');
      const data = await res.json();
      setWebsites(data);
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebsiteName.trim() || !newWebsiteUrl.trim()) return;

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWebsiteName, url: newWebsiteUrl })
      });
      if (res.ok) {
        setNewWebsiteName('');
        setNewWebsiteUrl('');
        fetchWebsites();
      }
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };

  const handleDeleteWebsite = async (id: number) => {
    try {
      await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    setJobs([]);
    try {
      const results = await searchJobs(query, location, salary);
      setJobs(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleSaveJob = async (job: Job) => {
    const isSaved = savedJobs.some(sj => sj.id === job.id);
    
    if (isSaved) {
      try {
        await fetch(`/api/saved-jobs/${job.id}`, { method: 'DELETE' });
        setSavedJobs(prev => prev.filter(sj => sj.id !== job.id));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    } else {
      try {
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job)
        });
        setSavedJobs(prev => [job, ...prev]);
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }
  };

  const isJobSaved = (id: string) => savedJobs.some(sj => sj.id === id);

  return (
    <div className="min-h-screen bg-app-bg text-app-text-primary font-sans selection:bg-app-primary selection:text-white transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-app-border bg-app-panel sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-serif italic font-bold tracking-tighter">JobPulse</h1>
          <div className="pulse-dot ml-1">
            <span className="pulse-dot-inner"></span>
            <span className="pulse-dot-center"></span>
          </div>
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-app-text-primary/5 transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 border-r border-app-border bg-app-panel z-20 hidden md:block transition-colors duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-2xl font-serif italic font-bold tracking-tighter">JobPulse</h1>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-app-text-primary/5 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          <nav className="space-y-4">
            <button 
              onClick={() => setActiveTab('search')}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200",
                activeTab === 'search' ? "bg-app-primary text-white glow-primary" : "text-app-text-secondary hover:bg-app-text-primary/5"
              )}
            >
              <Radar size={20} />
              <span className="font-medium">Intelligence Radar</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200",
                activeTab === 'saved' ? "bg-app-primary text-white glow-primary" : "text-app-text-secondary hover:bg-app-text-primary/5"
              )}
            >
              <Bookmark size={20} />
              <span className="font-medium">Saved Jobs</span>
              {savedJobs.length > 0 && (
                <span className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full",
                  activeTab === 'saved' ? "bg-white text-app-primary" : "bg-app-primary text-white"
                )}>
                  {savedJobs.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('website')}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200",
                activeTab === 'website' ? "bg-app-primary text-white glow-primary" : "text-app-text-secondary hover:bg-app-text-primary/5"
              )}
            >
              <Globe size={20} />
              <span className="font-medium">Add Websites</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="p-4 border border-app-border rounded-xl bg-app-card/30 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-widest text-app-text-muted mb-2">Global Activity</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-app-text-secondary">Nodes Active</span>
                <span className="text-[10px] font-mono text-app-accent">14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-app-text-secondary">Signals/min</span>
                <span className="text-[10px] font-mono text-app-primary">842</span>
              </div>
              <div className="h-1 w-full bg-app-border rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="h-full bg-app-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border border-app-border rounded-xl bg-app-card/30 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-widest text-app-text-muted mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="pulse-dot">
                <span className="pulse-dot-inner"></span>
                <span className="pulse-dot-center"></span>
              </div>
              <span className="text-xs font-mono text-app-text-secondary">Multi-Source Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 lg:p-12 radar-grid min-h-screen">
        <div className="max-w-5xl mx-auto relative">
          {activeTab === 'search' ? (
            <div className="space-y-8">
              {/* Radar Status Bar */}
              <div className="flex items-center justify-between p-3 glass-panel rounded-xl mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-app-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-app-text-secondary">Scan Frequency: 2.4GHz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-app-primary" />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-app-text-secondary">Latency: 142ms</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] uppercase tracking-widest font-mono text-app-text-secondary">Integrity: 99.8%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-app-text-muted">v2.4.0-stable</span>
                </div>
              </div>

              <header className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-serif italic font-medium">Job Pulse Ai Aggregator</h2>
                  <div className="px-2 py-0.5 bg-app-primary/10 border border-app-primary/20 rounded text-[10px] font-mono text-app-primary uppercase tracking-tighter">Live Feed</div>
                </div>
                <p className="text-app-text-secondary max-w-xl">
                  All Open Jobs.One Intelligent Real-time Feed. 
                </p>
              </header>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-app-card border border-app-border rounded-2xl shadow-xl transition-all duration-300">
                <div className="md:col-span-2 relative group/input">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within/input:text-app-primary transition-all" size={18} />
                  <input 
                    type="text" 
                    placeholder="Role (e.g. Senior Product Designer)" 
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm placeholder:text-app-text-muted transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="absolute bottom-2 left-10 right-4 h-0.5 bg-app-primary scale-x-0 group-focus-within/input:scale-x-100 transition-transform origin-left duration-300 opacity-40" />
                </div>
                <div className="relative border-l border-app-border group/input">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within/input:text-app-primary transition-all" size={18} />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm placeholder:text-app-text-muted transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <div className="absolute bottom-2 left-10 right-4 h-0.5 bg-app-primary scale-x-0 group-focus-within/input:scale-x-100 transition-transform origin-left duration-300 opacity-40" />
                </div>
                <button 
                  type="submit"
                  disabled={searching}
                  className="btn-primary py-3 px-6 disabled:opacity-50"
                >
                  {searching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  {searching ? 'Aggregating...' : 'Search'}
                </button>
              </form>

              {/* Results Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-app-border pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-app-text-muted">Results</span>
                    {jobs.length > 0 && <span className="text-xs font-mono text-app-text-secondary">{jobs.length} items found</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <ListFilter size={14} className="text-app-text-muted" />
                    <span className="text-[11px] uppercase tracking-widest font-bold text-app-text-muted">Filter</span>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {searching ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-20 flex flex-col items-center justify-center gap-6 text-app-text-muted relative overflow-hidden rounded-3xl border border-app-border bg-app-card/20"
                    >
                      <div className="radar-sweep" />
                      <div className="relative">
                        <Loader2 className="animate-spin text-app-primary" size={48} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-app-accent rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-serif italic text-xl text-app-text-primary">Scanning Global Talent Networks...</p>
                        <div className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                          <span className="animate-pulse">Pinging LinkedIn</span>
                          <span className="opacity-20">•</span>
                          <span className="animate-pulse delay-75">Parsing Indeed</span>
                          <span className="opacity-20">•</span>
                          <span className="animate-pulse delay-150">Career Portals</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {jobs.map((job, idx) => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          idx={idx} 
                          isSaved={isJobSaved(job.id)}
                          onToggleSave={() => toggleSaveJob(job)}
                        />
                      ))}
                    </div>
                  ) : !searching && hasSearched ? (
                    <div className="py-20 text-center text-app-text-muted">
                      <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-serif italic">No jobs found. Try adjusting your search parameters.</p>
                    </div>
                  ) : !searching && (
                    <div className="py-20 text-center text-app-text-muted">
                      <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-serif italic">Enter a role to begin aggregation</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : activeTab === 'saved' ? (
            <div className="space-y-8">
              <header className="space-y-2">
                <h2 className="text-4xl font-serif italic font-medium">Saved Pipeline</h2>
                <p className="text-app-text-secondary max-w-xl">
                  Your curated list of opportunities for outreach and tracking.
                </p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {savedJobs.length > 0 ? (
                  savedJobs.map((job, idx) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      idx={idx} 
                      isSaved={true}
                      onToggleSave={() => toggleSaveJob(job)}
                    />
                  ))
                ) : (
                  <div className="py-20 text-center text-app-text-muted">
                    <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-serif italic">No jobs saved to your pipeline yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <header className="space-y-2">
                <div className="flex items-center gap-3">
                  <Globe className="text-app-primary" size={32} />
                  <h2 className="text-4xl font-serif italic font-medium">Source Websites</h2>
                </div>
                <p className="text-app-text-secondary max-w-xl">
                  Manage the company career portals and job boards you want to monitor.
                </p>
              </header>

              {/* Add Website Form */}
              <form onSubmit={handleAddWebsite} className="p-6 bg-app-card border border-app-border rounded-2xl shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative group/input">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within/input:text-app-primary transition-all" size={18} />
                    <input 
                      type="text" 
                      placeholder="Company/Site Name" 
                      className="w-full pl-10 pr-4 py-3 bg-app-panel border border-app-border rounded-xl text-sm focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 outline-none transition-all placeholder:text-app-text-muted"
                      value={newWebsiteName}
                      onChange={(e) => setNewWebsiteName(e.target.value)}
                    />
                  </div>
                  <div className="relative group/input">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within/input:text-app-primary transition-all" size={18} />
                    <input 
                      type="url" 
                      placeholder="Website URL (https://...)" 
                      className="w-full pl-10 pr-4 py-3 bg-app-panel border border-app-border rounded-xl text-sm focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 outline-none transition-all placeholder:text-app-text-muted"
                      value={newWebsiteUrl}
                      onChange={(e) => setNewWebsiteUrl(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn-primary py-3 px-6"
                  >
                    <Plus size={18} />
                    Add Source
                  </button>
                </div>
              </form>

              {/* Websites List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {websites.length > 0 ? (
                  websites.map((site) => (
                    <div key={site.id} className="p-4 bg-app-card border border-app-border rounded-xl flex items-center justify-between group hover:border-app-primary/50 transition-all hover-lift">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-app-primary/10 flex items-center justify-center text-app-primary">
                          <Globe size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{site.name}</h4>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-app-text-muted hover:text-app-primary hover:underline flex items-center gap-1">
                            {site.url} <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteWebsite(site.id)}
                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-app-text-muted">
                    <Globe size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-serif italic">No custom sources added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-app-border flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-app-text-muted">
            <div className="flex items-center gap-2">
              <span className="opacity-50">© 2026 JobPulse Intelligence</span>
              <span className="opacity-20">|</span>
              <a href="#" className="hover:text-app-primary transition-colors">Kepler Camp Codes</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:jamenya1988@gmail.com" className="flex items-center gap-2 hover:text-app-primary transition-colors">
                <Mail size={12} />
                jamenya1988@gmail.com
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function JobCard({ job, idx, isSaved, onToggleSave }: { job: Job, idx: number, isSaved: boolean, onToggleSave: () => void }) {
  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('linkedin')) return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    if (s.includes('indeed')) return 'bg-teal-600/20 text-teal-400 border-teal-500/30';
    return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
  };

  // Mocked "Intelligence" metadata for command center feel
  const matchConfidence = Math.floor(Math.random() * 15) + 85; // 85-99%

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-app-card border border-app-border p-6 rounded-2xl hover:border-app-primary/50 transition-all duration-300 relative overflow-hidden hover-lift shadow-lg"
    >
      <div className="scanline opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-tighter",
              getSourceColor(job.source)
            )}>
              {job.source}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-app-accent/5 border border-app-accent/10 rounded text-[10px] font-mono text-app-accent">
              <Cpu size={10} />
              {matchConfidence}% Match
            </div>
            <span className="text-[10px] font-mono text-app-text-muted flex items-center gap-1 ml-auto md:ml-0">
              <Clock size={10} />
              {job.posted_at}
            </span>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-app-text-primary group-hover:text-app-primary transition-colors cursor-pointer flex items-center gap-2">
              {job.title}
              <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <div className="flex items-center gap-4 mt-1 text-app-text-secondary">
              <span className="flex items-center gap-1 text-sm font-medium">
                <Building2 size={14} className="text-app-text-muted" />
                {job.company}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <MapPin size={14} className="text-app-text-muted" />
                {job.location}
              </span>
            </div>
          </div>

          <p className="text-sm text-app-text-secondary line-clamp-2 leading-relaxed font-sans opacity-80">
            {job.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1 text-xs font-mono bg-app-accent/10 text-app-accent px-2 py-1 rounded border border-app-accent/20">
              <DollarSign size={12} />
              {job.salary}
            </div>
            <div className="text-[10px] font-mono text-app-text-muted uppercase tracking-widest">
              ID: {job.id.substring(0, 8)}
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-2 shrink-0">
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary flex-1 md:flex-none px-6 py-2.5 text-sm"
          >
            Apply <ExternalLink size={14} />
          </a>
          <button 
            onClick={onToggleSave}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-app-border rounded-xl transition-all text-sm font-medium",
              isSaved ? "bg-app-accent text-white border-app-accent" : "text-app-text-secondary hover:bg-app-text-primary/5"
            )}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {isSaved ? 'Track' : 'Track'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
