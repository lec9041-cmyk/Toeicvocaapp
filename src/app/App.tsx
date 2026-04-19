import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Switch } from './components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Separator } from './components/ui/separator';
import { QuizModal } from './components/QuizModal';
import { Play, RotateCcw, Target, TrendingUp, Zap, Volume2, Timer, RefreshCw, Eye, Calendar as CalendarIcon, Home, BookOpen, BarChart3, Settings as SettingsIcon } from 'lucide-react';

interface Word {
  day: number;
  english: string;
  korean: string;
  index: number;
}

interface Stats {
  todayCount: number;
  streak: number;
  totalSolved: number;
  xp: number;
  level: number;
  lastStudyDate: string;
  dailyLog: { [date: string]: number };
}

interface Settings {
  orderMode: string;
  shuffleChoices: boolean;
  timerOn: boolean;
  timerMode: string;
  perQSec: string;
  sessionMin: string;
  autoNextMs: string;
  flashRevealDelay: string;
  reinsertLimit: string;
  mcReinsert: boolean;
  speakOnReveal: boolean;
  wrongMark: boolean;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([5]);
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    streak: 0,
    totalSolved: 0,
    xp: 0,
    level: 1,
    lastStudyDate: '',
    dailyLog: {},
  });

  const [todayGoal] = useState(30);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizWords, setQuizWords] = useState<Word[]>([]);

  // Learning settings
  const [mode, setMode] = useState('flash');
  const [direction, setDirection] = useState('en2ko');
  const [count, setCount] = useState('30');
  const [voice, setVoice] = useState('en-US');
  const [wrongFirst, setWrongFirst] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    orderMode: 'random',
    shuffleChoices: true,
    timerOn: false,
    timerMode: 'perQ',
    perQSec: '10',
    sessionMin: '5',
    autoNextMs: '1200',
    flashRevealDelay: '0',
    reinsertLimit: '2',
    mcReinsert: false,
    speakOnReveal: false,
    wrongMark: true,
  });

  // Load data on mount
  useEffect(() => {
    loadStats();
    loadSampleWords();
  }, []);

  const loadStats = () => {
    const savedStats = localStorage.getItem('toeic_stats_v2');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveStats = (newStats: Stats) => {
    setStats(newStats);
    localStorage.setItem('toeic_stats_v2', JSON.stringify(newStats));
  };

  const loadSampleWords = async () => {
    try {
      const response = await fetch('/toeic_words_sample.csv');
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');

      const loadedWords: Word[] = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        return {
          day: parseInt(values[0]),
          english: values[1],
          korean: values[2],
          index: index,
        };
      });

      setWords(loadedWords);
    } catch (error) {
      console.error('Failed to load words:', error);
      // Fallback to sample data
      const sampleWords: Word[] = [
        { day: 5, english: 'accomplish', korean: '성취하다 완수하다', index: 0 },
        { day: 5, english: 'achievement', korean: '성취 업적', index: 1 },
        { day: 5, english: 'acquire', korean: '획득하다 습득하다', index: 2 },
        { day: 5, english: 'acquisition', korean: '획득 인수', index: 3 },
        { day: 5, english: 'advance', korean: '진전 발전 / 전진하다', index: 4 },
        { day: 5, english: 'advantage', korean: '이점 유리함', index: 5 },
        { day: 5, english: 'beneficial', korean: '유익한 이로운', index: 6 },
        { day: 5, english: 'benefit', korean: '혜택 이익', index: 7 },
        { day: 5, english: 'capable', korean: '유능한 능력 있는', index: 8 },
        { day: 5, english: 'capacity', korean: '능력 수용력', index: 9 },
        { day: 5, english: 'competent', korean: '유능한 적격의', index: 10 },
        { day: 5, english: 'competitive', korean: '경쟁력 있는', index: 11 },
        { day: 5, english: 'competitor', korean: '경쟁자', index: 12 },
        { day: 5, english: 'proficient', korean: '능숙한 숙련된', index: 13 },
        { day: 5, english: 'proficiency', korean: '숙달 능숙', index: 14 },
      ];
      setWords(sampleWords);
    }
  };

  const calculateXPForLevel = (level: number) => {
    return 100 * level;
  };

  const startQuiz = () => {
    const filteredWords = words.filter(w => selectedDays.includes(w.day));
    const selectedWords = filteredWords
      .sort(() => settings.orderMode === 'random' ? Math.random() - 0.5 : 1)
      .slice(0, parseInt(count));

    setQuizWords(selectedWords);
    setShowQuiz(true);
  };

  const handleQuizComplete = (quizStats: { correct: number; total: number; xp: number }) => {
    const today = new Date().toISOString().split('T')[0];
    const newXP = stats.xp + quizStats.xp;
    const xpNeeded = calculateXPForLevel(stats.level);
    let newLevel = stats.level;

    if (newXP >= xpNeeded) {
      newLevel = stats.level + 1;
    }

    const newStreak = stats.lastStudyDate === today ? stats.streak : stats.streak + 1;

    const newStats = {
      ...stats,
      todayCount: stats.todayCount + quizStats.total,
      streak: newStreak,
      totalSolved: stats.totalSolved + quizStats.total,
      xp: newXP,
      level: newLevel,
      lastStudyDate: today,
      dailyLog: {
        ...stats.dailyLog,
        [today]: (stats.dailyLog[today] || 0) + quizStats.total,
      },
    };

    saveStats(newStats);
    setShowQuiz(false);
  };

  const PlantLevel = () => {
    const plantEmojis = ['🌱', '🌿', '🪴', '🌳', '🌲', '🎄'];
    return plantEmojis[Math.min(stats.level - 1, 5)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4 md:py-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                TOEIC
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 font-medium">Master Your Vocabulary</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="px-2 md:px-4 py-1 md:py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50">
                <span className="text-xs md:text-sm font-bold text-orange-600">{stats.streak}🔥</span>
              </div>
              <div className="px-2 md:px-4 py-1 md:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50">
                <span className="text-xs md:text-sm font-bold text-blue-600">Lv.{stats.level}</span>
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1 border-b border-gray-100 -mb-px">
            {[
              { id: 'home', label: '홈', icon: Home },
              { id: 'learn', label: '학습', icon: BookOpen },
              { id: 'stats', label: '통계', icon: BarChart3 },
              { id: 'settings', label: '설정', icon: SettingsIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`
                  group relative px-8 py-3 text-sm font-semibold transition-all duration-300
                  ${currentTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {currentTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {currentTab === 'home' && (
          <div className="space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="text-center py-6 md:py-12">
              <div className="inline-block mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50">
                <span className="text-xs md:text-sm font-semibold text-blue-600">Today's Progress</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                {stats.todayCount} / {todayGoal}
              </h2>
              <p className="text-gray-500 text-sm md:text-lg font-medium">단어 학습 완료</p>

              <div className="mt-4 md:mt-8 max-w-2xl mx-auto">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stats.todayCount / todayGoal) * 100}%` }}
                  />
                </div>
              </div>

              <Button
                size="lg"
                onClick={startQuiz}
                className="mt-6 md:mt-12 px-8 md:px-12 py-5 md:py-7 text-base md:text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                학습 시작하기
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {[
                { value: stats.todayCount, label: '오늘 학습', color: 'blue' },
                { value: `${stats.streak}일`, label: '연속 학습', color: 'orange' },
                { value: stats.xp, label: 'Total XP', color: 'purple' },
                { value: `Lv.${stats.level}`, label: '레벨', color: 'green' },
              ].map((stat, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className={`
                    relative overflow-hidden rounded-2xl md:rounded-3xl p-4 md:p-8
                    bg-gradient-to-br ${
                      stat.color === 'blue' ? 'from-blue-500/5 to-indigo-500/5' :
                      stat.color === 'purple' ? 'from-purple-500/5 to-pink-500/5' :
                      stat.color === 'green' ? 'from-green-500/5 to-emerald-500/5' :
                      'from-orange-500/5 to-amber-500/5'
                    }
                    border border-gray-100 hover:border-gray-200
                    transition-all duration-500 hover:scale-105
                  `}>
                    <div className="relative z-10">
                      <div className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1 md:mb-2">
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">빠른 액션</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { icon: Play, label: '이어서 학습', color: 'from-blue-500 to-indigo-600', action: startQuiz },
                  { icon: RotateCcw, label: '오답 복습', color: 'from-purple-500 to-pink-600', action: () => {} },
                  { icon: Target, label: '오늘 목표', color: 'from-green-500 to-emerald-600', action: () => setCurrentTab('learn') },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="group relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105 text-left"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${action.color} mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="font-bold text-gray-900 text-sm md:text-base">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plant Growth */}
            <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-100 text-center">
              <div className="text-6xl md:text-8xl mb-4 md:mb-6">{PlantLevel()}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">단어 나무 Lv.{stats.level}</h3>
              <p className="text-sm md:text-base text-green-700 font-medium">
                다음 성장까지 {calculateXPForLevel(stats.level) - stats.xp} XP
              </p>
            </div>
          </div>
        )}

        {currentTab === 'learn' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">학습 설정</h2>
              <p className="text-sm md:text-lg text-gray-500">나만의 학습 경험을 만들어보세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">학습 모드</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl border-gray-200 text-sm md:text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flash">플래시카드</SelectItem>
                    <SelectItem value="mc">4지선다</SelectItem>
                    <SelectItem value="sa">주관식</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">방향</label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl border-gray-200 text-sm md:text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en2ko">영단어 → 뜻</SelectItem>
                    <SelectItem value="ko2en">뜻 → 영단어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">문제수</label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl border-gray-200 text-sm md:text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10문제</SelectItem>
                    <SelectItem value="20">20문제</SelectItem>
                    <SelectItem value="30">30문제</SelectItem>
                    <SelectItem value="50">50문제</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">발음</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl border-gray-200 text-sm md:text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">미국식 🇺🇸</SelectItem>
                    <SelectItem value="en-GB">영국식 🇬🇧</SelectItem>
                    <SelectItem value="en-AU">호주식 🇦🇺</SelectItem>
                    <SelectItem value="random">토익 랜덤 🎲</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              onClick={startQuiz}
              className="w-full h-14 md:h-16 text-base md:text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              학습 시작
            </Button>

            {/* Stats Pills */}
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold border-2">
                오늘 {stats.todayCount}
              </Badge>
              <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold border-2">
                연속 {stats.streak}일
              </Badge>
              <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold border-2">
                XP {stats.xp}/{calculateXPForLevel(stats.level)}
              </Badge>
            </div>
          </div>
        )}

        {currentTab === 'stats' && (
          <div className="space-y-6 md:space-y-12">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">학습 통계</h2>
              <p className="text-sm md:text-lg text-gray-500">당신의 성장을 확인하세요</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { value: stats.todayCount, label: '오늘' },
                { value: `${stats.streak}일`, label: '연속' },
                { value: stats.totalSolved, label: '총 학습' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl md:rounded-3xl p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center">
                  <div className="text-2xl md:text-4xl font-bold text-blue-900 mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-blue-700 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">학습 달력</h3>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 35 + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const count = stats.dailyLog[dateStr] || 0;

                  return (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded-lg md:rounded-xl transition-all duration-300 cursor-pointer
                        ${count > 0
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 hover:scale-110 shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                        }
                      `}
                      title={`${dateStr}: ${count}문제`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">설정</h2>
              <p className="text-sm md:text-lg text-gray-500">학습 환경을 최적화하세요</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* 문제 순서 */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  문제 순서
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1 pr-4">
                      <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">문제 출제 순서</div>
                      <div className="text-xs md:text-sm text-gray-500">순서대로 또는 랜덤</div>
                    </div>
                    <Select value={settings.orderMode} onValueChange={(v) => setSettings({...settings, orderMode: v})}>
                      <SelectTrigger className="w-32 md:w-44 h-10 md:h-11 rounded-xl text-xs md:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">랜덤 🔀</SelectItem>
                        <SelectItem value="sequential">순서대로 📖</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">4지선다 보기 뒤섞기</div>
                      <div className="text-xs md:text-sm text-gray-500">보기 순서 무작위</div>
                    </div>
                    <Switch checked={settings.shuffleChoices} onCheckedChange={(v) => setSettings({...settings, shuffleChoices: v})} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 타임어택 */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-5 md:h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                  타임어택
                </h3>

                <div className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      타임어택 활성화
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">시간 제한</div>
                  </div>
                  <Switch checked={settings.timerOn} onCheckedChange={(v) => setSettings({...settings, timerOn: v})} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3 shadow-2xl safe-area-pb z-50">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'home', label: '홈', icon: Home },
            { id: 'learn', label: '학습', icon: BookOpen },
            { id: 'stats', label: '통계', icon: BarChart3 },
            { id: 'settings', label: '설정', icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200
                ${currentTab === tab.id
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          words={quizWords}
          mode={mode as 'flash' | 'mc' | 'sa'}
          direction={direction as 'en2ko' | 'ko2en'}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
