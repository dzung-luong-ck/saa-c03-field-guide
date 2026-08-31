'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GitBranch,
  Menu,
  Moon,
  Search,
  Sun,
  Target,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type Article = {
  id: string;
  path: string;
  group: string;
  day: string;
  dayLabel: string;
  title: string;
  description: string;
  minutes: number;
  content: string;
};

type GroupMeta = {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
};

const groups: GroupMeta[] = [
  { key: 'start', label: 'Bắt đầu', shortLabel: '00', order: 0 },
  { key: 'security', label: 'Ngày 1 · Security', shortLabel: '01', order: 1 },
  { key: 'resilience', label: 'Ngày 2 · Resilience', shortLabel: '02', order: 2 },
  { key: 'storage', label: 'Ngày 3 · Storage & Database', shortLabel: '03', order: 3 },
  { key: 'networking', label: 'Ngày 4 · Networking', shortLabel: '04', order: 4 },
  { key: 'compute', label: 'Ngày 5 · Compute & Integration', shortLabel: '05', order: 5 },
  { key: 'operations', label: 'Ngày 6 · Cost, Migration & Ops', shortLabel: '06', order: 6 },
  { key: 'review', label: 'Ngày 7 · Mock & Review', shortLabel: '07', order: 7 },
  { key: 'quick', label: 'Tra cứu tổng hợp', shortLabel: '★', order: 8 },
];

const markdownModules = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#]/g, '')
    .trim();
}

function groupForPath(path: string) {
  if (path === 'SAA-C03-CHEATSHEET-7-NGAY.md') return 'quick';
  if (path === 'README.md' || path.startsWith('00-BAT-DAU/')) return 'start';
  if (path.startsWith('01-NGAY-1-SECURITY/')) return 'security';
  if (path.startsWith('02-NGAY-2-RESILIENCE/')) return 'resilience';
  if (path.startsWith('03-NGAY-3-STORAGE-DATABASE/')) return 'storage';
  if (path.startsWith('04-NGAY-4-NETWORKING/')) return 'networking';
  if (path.startsWith('05-NGAY-5-COMPUTE-INTEGRATION/')) return 'compute';
  if (path.startsWith('06-NGAY-6-COST-MIGRATION-OPS/')) return 'operations';
  return 'review';
}

function titleFromMarkdown(content: string, path: string) {
  const heading = content.split('\n').find((line) => /^#\s+/.test(line));
  if (heading) return stripMarkdown(heading.replace(/^#\s+/, ''));
  return path.split('/').at(-1)?.replace(/\.md$/, '').replace(/-/g, ' ') ?? path;
}

function descriptionFromMarkdown(content: string) {
  const lines = content.split('\n');
  const line = lines.find((item) => {
    const trimmed = item.trim();
    return (
      trimmed.length > 35 &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('```') &&
      !trimmed.startsWith('-')
    );
  });
  const description = stripMarkdown(line ?? 'Tóm tắt kiến thức và các tình huống thường gặp trong đề thi.');
  return description.length > 150 ? `${description.slice(0, 147)}…` : description;
}

const articles: Article[] = Object.entries(markdownModules)
  .map(([modulePath, content]) => {
    const path = modulePath.replace(/^\.\.\/content\//, '').replace(/\\/g, '/');
    const group = groupForPath(path);
    const meta = groups.find((item) => item.key === group) ?? groups[0];
    const words = content.trim().split(/\s+/).length;
    return {
      id: slugify(path.replace(/\.md$/, '')),
      path,
      group,
      day: meta.shortLabel,
      dayLabel: meta.label,
      title: titleFromMarkdown(content, path),
      description: descriptionFromMarkdown(content),
      minutes: Math.max(5, Math.min(120, Math.ceil(words / 180))),
      content,
    };
  })
  .sort((a, b) => {
    const aOrder = groups.find((item) => item.key === a.group)?.order ?? 99;
    const bOrder = groups.find((item) => item.key === b.group)?.order ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.path === 'README.md') return -1;
    if (b.path === 'README.md') return 1;
    if (a.path.endsWith('/README.md')) return -1;
    if (b.path.endsWith('/README.md')) return 1;
    return a.path.localeCompare(b.path, 'vi');
  });

function extractHeadings(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      const label = stripMarkdown(match?.[2] ?? line);
      return { level: match?.[1].length ?? 2, label, id: slugify(label) };
    });
}

function resolveMarkdownPath(currentPath: string, href: string) {
  const cleanHref = decodeURIComponent(href.split('#')[0]).replace(/\\/g, '/');
  if (!cleanHref.endsWith('.md')) return null;
  const segments = currentPath.split('/');
  segments.pop();
  for (const segment of cleanHref.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  return segments.join('/');
}

export default function StudyApp() {
  const defaultArticle = articles.find((article) => article.path === 'README.md') ?? articles[0];
  const [activeId, setActiveId] = useState(defaultArticle.id);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const activeArticle = articles.find((article) => article.id === activeId) ?? defaultArticle;
  const activeIndex = articles.findIndex((article) => article.id === activeArticle.id);
  const headings = useMemo(() => extractHeadings(activeArticle.content), [activeArticle.content]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles = useMemo(
    () =>
      normalizedQuery
        ? articles.filter((article) =>
            `${article.title} ${article.description} ${article.dayLabel} ${article.content}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : articles,
    [normalizedQuery],
  );
  const completionPercent = Math.round((completed.size / articles.length) * 100);

  useEffect(() => {
    const savedTheme = localStorage.getItem('saa-theme');
    const shouldUseDark = savedTheme
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(shouldUseDark);

    const savedProgress = localStorage.getItem('saa-completed');
    if (savedProgress) {
      try {
        setCompleted(new Set(JSON.parse(savedProgress) as string[]));
      } catch {
        localStorage.removeItem('saa-completed');
      }
    }

    const syncFromHash = () => {
      const id = window.location.hash.match(/^#\/bai\/(.+)$/)?.[1];
      if (id && articles.some((article) => article.id === id)) setActiveId(id);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('saa-theme', dark ? 'dark' : 'light');
  }, [dark]);

  function openArticle(id: string) {
    setActiveId(id);
    setMenuOpen(false);
    window.history.pushState(null, '', `#/bai/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleComplete() {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(activeArticle.id)) next.delete(activeArticle.id);
      else next.add(activeArticle.id);
      localStorage.setItem('saa-completed', JSON.stringify([...next]));
      return next;
    });
  }

  const markdownComponents: Components = {
    h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
    a: ({ href = '', children }) => {
      const targetPath = resolveMarkdownPath(activeArticle.path, href);
      const targetArticle = targetPath
        ? articles.find((article) => article.path.toLowerCase() === targetPath.toLowerCase())
        : null;
      if (targetArticle) {
        return (
          <a
            href={`#/bai/${targetArticle.id}`}
            onClick={(event) => {
              event.preventDefault();
              openArticle(targetArticle.id);
            }}
          >
            {children}
          </a>
        );
      }
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở mục lục" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
          <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => openArticle(defaultArticle.id)}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Target className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">SAA-C03 Field Guide</span>
              <span className="block truncate text-[11px] text-muted-foreground">Ôn trọng tâm trong 7 ngày</span>
            </span>
          </button>

          <div className="relative ml-auto hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong 40 bài học..." className="h-10 rounded-xl bg-muted/60 pl-9" aria-label="Tìm bài học" />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Badge variant="secondary" className="hidden h-7 px-3 sm:inline-flex">
              <CheckCircle2 /> {completed.size}/{articles.length} đã học
            </Badge>
            <Button variant="outline" size="icon" aria-label={dark ? 'Bật giao diện sáng' : 'Bật giao diện tối'} onClick={() => setDark((value) => !value)}>
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[310px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)_250px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r bg-sidebar lg:block">
          <Navigation articles={filteredArticles} activeId={activeArticle.id} query={query} setQuery={setQuery} onOpen={openArticle} completed={completed} completionPercent={completionPercent} />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button className="absolute inset-0 bg-black/45" aria-label="Đóng mục lục" onClick={() => setMenuOpen(false)} />
            <aside className="relative h-full w-[min(90vw,360px)] border-r bg-sidebar shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <span className="font-bold">Mục lục khóa học</span>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Đóng"><X /></Button>
              </div>
              <Navigation articles={filteredArticles} activeId={activeArticle.id} query={query} setQuery={setQuery} onOpen={openArticle} completed={completed} completionPercent={completionPercent} />
            </aside>
          </div>
        )}

        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <article className="mx-auto max-w-4xl">
            <div className="mb-9 border-b pb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary">{activeArticle.dayLabel}</Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> {activeArticle.minutes} phút đọc</span>
                <span className="text-xs text-muted-foreground">Bài {activeIndex + 1}/{articles.length}</span>
              </div>
              <h1 className="text-balance text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">{activeArticle.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{activeArticle.description}</p>
              <Button variant={completed.has(activeArticle.id) ? 'secondary' : 'outline'} className="mt-5" onClick={toggleComplete}>
                {completed.has(activeArticle.id) ? <Check /> : <CheckCircle2 />}
                {completed.has(activeArticle.id) ? 'Đã học xong' : 'Đánh dấu đã học'}
              </Button>
            </div>

            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{activeArticle.content}</ReactMarkdown>
            </div>

            <nav className="mt-14 grid gap-3 border-t pt-8 sm:grid-cols-2" aria-label="Điều hướng bài học">
              {activeIndex > 0 ? (
                <Button variant="outline" className="h-auto justify-start px-4 py-3" onClick={() => openArticle(articles[activeIndex - 1].id)}>
                  <ArrowLeft /><span className="min-w-0 text-left"><span className="block text-[11px] text-muted-foreground">Bài trước</span><span className="block truncate">{articles[activeIndex - 1].title}</span></span>
                </Button>
              ) : <span />}
              {activeIndex < articles.length - 1 && (
                <Button variant="outline" className="h-auto justify-end px-4 py-3" onClick={() => openArticle(articles[activeIndex + 1].id)}>
                  <span className="min-w-0 text-right"><span className="block text-[11px] text-muted-foreground">Bài tiếp theo</span><span className="block truncate">{articles[activeIndex + 1].title}</span></span><ArrowRight />
                </Button>
              )}
            </nav>
          </article>
        </main>

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto border-l px-6 py-10 xl:block">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Trong bài này</p>
          <nav className="space-y-1" aria-label="Mục lục trong bài">
            {headings.slice(0, 18).map((heading, index) => (
              <a key={`${heading.id}-${index}`} href={`#${heading.id}`} className={`block border-l-2 border-transparent py-1.5 text-sm leading-5 text-muted-foreground transition hover:border-primary hover:text-foreground ${heading.level === 3 ? 'pl-5' : 'pl-3'}`}>
                {heading.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border bg-card p-4">
            <p className="text-sm font-bold">Mẹo ôn nhanh</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Sau mỗi bài, tự nói lại decision tree mà không nhìn tài liệu.</p>
          </div>
          <a href="https://github.com/dzung-luong-ck/saa-c03-field-guide" target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 px-1 text-xs text-muted-foreground hover:text-foreground">
            <GitBranch className="size-3.5" /> Mã nguồn trên GitHub
          </a>
        </aside>
      </div>
    </div>
  );
}

function Navigation({ articles: visibleArticles, activeId, query, setQuery, onOpen, completed, completionPercent }: { articles: Article[]; activeId: string; query: string; setQuery: (value: string) => void; onOpen: (id: string) => void; completed: Set<string>; completionPercent: number }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="relative mb-4 md:hidden">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong bài học..." className="h-10 pl-9" />
      </div>

      <div className="mb-5 rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
        <div className="flex items-center justify-between gap-2 text-sm font-bold text-primary"><span className="flex items-center gap-2"><BookOpen className="size-4" /> Tiến độ 7 ngày</span><span>{completionPercent}%</span></div>
        <Progress value={completionPercent} className="mt-3" />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{completed.size} trên {articles.length} bài đã hoàn thành.</p>
      </div>

      {query && <p className="mb-4 px-2 text-xs text-muted-foreground">{visibleArticles.length} kết quả phù hợp</p>}

      <div className="space-y-6 pb-8">
        {groups.map((group) => {
          const groupArticles = visibleArticles.filter((article) => article.group === group.key);
          if (groupArticles.length === 0) return null;
          return (
            <section key={group.key}>
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{group.label}</p>
              <div className="space-y-1">
                {groupArticles.map((article) => (
                  <button key={article.id} onClick={() => onOpen(article.id)} className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${activeId === article.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-sidebar-accent'}`}>
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-extrabold ${activeId === article.id ? 'bg-white/15' : completed.has(article.id) ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                      {completed.has(article.id) ? <Check className="size-3" /> : article.day}
                    </span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5">{article.title}</span><span className="mt-0.5 block text-[11px] opacity-65">{article.minutes} phút</span></span>
                    <ChevronRight className="mt-1.5 size-4 shrink-0 opacity-40 transition group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {visibleArticles.length === 0 && <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Không tìm thấy nội dung phù hợp.</p>}
      </div>
    </div>
  );
}
