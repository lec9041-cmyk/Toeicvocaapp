import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Home, Settings } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAppStore } from './store/useAppStore';
import { Word } from './types/stats';

type Tab = 'home' | 'learn' | 'stats' | 'settings';

const parseCsvWords = (csvText: string): Word[] => {
  const lines = csvText.trim().split('\n');
  return lines
    .slice(1)
    .map((line, index) => {
      const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      if (!matches || matches.length < 4) return null;
      return {
        day: parseInt(matches[0].replace(/^DAY/, '')),
        no: parseInt(matches[1].trim()),
        english: matches[2].replace(/^"|"$/g, ''),
        korean: matches[3].replace(/^"|"$/g, ''),
        index,
      };
    })
    .filter((word): word is Word => !!word);
};

export default function App() {
  const { setWords } = useAppStore();
  const [tab, setTab] = useState<Tab>('home');
  const [autoStartLearn, setAutoStartLearn] = useState(false);

  useEffect(() => {
    const loadWords = async () => {
      try {
        let csvText: string;
        try {
          const imported = await import('../imports/toeic_words.csv?raw');
          csvText = imported.default;
        } catch {
          const response = await fetch('/toeic_words.csv');
          csvText = await response.text();
        }
        setWords(parseCsvWords(csvText));
      } catch (error) {
        console.error('CSV 로드 실패', error);
        setWords([]);
      }
    };
    loadWords();
  }, [setWords]);

  const content = () => {
    if (tab === 'home') {
      return (
        <HomePage
          onStartLearning={() => {
            setTab('learn');
            setAutoStartLearn(true);
          }}
        />
      );
    }
    if (tab === 'learn') return <LearnPage autoStart={autoStartLearn} onAutoStarted={() => setAutoStartLearn(false)} />;
    if (tab === 'stats') return <StatsPage />;
    return <SettingsPage />;
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'learn', label: '학습', icon: BookOpen },
    { id: 'stats', label: '통계', icon: BarChart3 },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 pb-24">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">TOEIC Voca</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5">{content()}</main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto grid grid-cols-4">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                className={`py-3 flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-500'}`}
                onClick={() => {
                  setTab(item.id);
                  if (item.id !== 'learn') setAutoStartLearn(false);
                }}
              >
                <Icon className="size-5" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
