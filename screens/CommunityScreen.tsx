
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, MoreHorizontal, User, Send, Image as ImageIcon, Search, ChevronLeft, Tag, Swords, Trophy, Medal, Flame, Dumbbell, Star, Clock, X, Loader, Plus, ChevronRight, Check, Ban, Award, Timer, Lock } from 'lucide-react';
import { Post, UserProfile, UserStats, Challenge, Badge, Comment, Story, LeaderboardEntry, ChallengeStatus } from '../types';
import { supabase } from '../lib/supabase';
// import CommunityTutorialOverlay from '../components/CommunityTutorialOverlay'; // Disabled for Coming Soon

const POST_CATEGORIES = ['Allenamento', 'Nutrizione', 'Consigli', 'Motivazione', 'Challenge'];

interface CommunityScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  posts: Post[];
  stories?: Story[]; 
  leaderboard?: LeaderboardEntry[];
  onAddPost: (post: Post) => void;
  onLikePost: (postId: string) => void;
  onPostComment: (postId: string, comment: Comment) => void;
  userProfile?: UserProfile;
  onStartChallenge: (opponentId: string, opponentName: string, opponentImage?: string, postId?: string, postContent?: string) => void;
  onUpdateChallenge?: (challengeId: string, status: ChallengeStatus) => void;
  userStats: UserStats;
  challenges: Challenge[];
  themeColor: string;
  showTutorial?: boolean;
  onTutorialComplete?: () => void;
  onLikeStory?: (targetUserId: string) => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ 
    onBack, isDarkMode, posts, stories = [], leaderboard = [], onAddPost, onLikePost, onPostComment,
    userProfile, onStartChallenge, onUpdateChallenge, userStats, challenges, themeColor,
    showTutorial = false, onTutorialComplete, onLikeStory
}) => {
  const [activeTab, setActiveTab] = useState<'social' | 'arena'>('social');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const theme = {
      bg: isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]',
      headerBg: isDarkMode ? 'bg-black/80 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-slate-200',
      card: isDarkMode ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-slate-200 shadow-sm',
      text: isDarkMode ? 'text-white' : 'text-slate-900',
      textSub: isDarkMode ? 'text-zinc-400' : 'text-slate-500',
      inputBg: isDarkMode ? 'bg-[#2c2c2e]' : 'bg-slate-100',
      accent: `text-${themeColor}-500`,
      accentBg: `bg-${themeColor}-500`,
      accentBorder: `border-${themeColor}-500`,
  };

  const handlePostImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onloadend = () => setNewPostImage(reader.result as string); reader.readAsDataURL(file); }
  };
  const handlePost = () => {
    if (!newPostContent.trim() && !newPostImage) return;
    onAddPost({ id: `temp_${Date.now()}`, userId: userProfile?.id || '', user: userProfile?.name || 'Tu', userImage: userProfile?.image, time: 'Adesso', content: newPostContent, likes: 0, comments: 0, tag: selectedTag || undefined, image: newPostImage || undefined, commentsList: [] });
    setNewPostContent(''); setNewPostImage(null); setSelectedTag(null); setActiveFilter('Tutti'); 
  };
  
  const handleSendComment = () => {
      if (!activePostId || !commentInput.trim()) return;
      onPostComment(activePostId, { id: `c_${Date.now()}`, user: userProfile?.name || 'Tu', userImage: userProfile?.image, text: commentInput, time: 'Adesso' });
      setCommentInput('');
  };
  
  const filteredPosts = posts.filter(post => { if (activeFilter === 'Tutti') return true; if (activeFilter === 'Popolari') return post.likes > 20; return post.tag === activeFilter; });
  const activePostComments = activePostId ? posts.find(p => p.id === activePostId)?.commentsList || [] : [];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} pb-24 transition-colors duration-300 relative`}>
      <div className={`pt-safe px-5 pb-0 sticky top-0 z-30 border-b transition-colors ${theme.headerBg}`}>
        <div className="flex justify-between items-center pt-4 mb-2">
            <h1 className="text-2xl font-black tracking-tight">Community</h1>
            <button onClick={onBack} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 ${isDarkMode ? 'bg-[#2c2c2e]' : 'bg-slate-100'}`}><ChevronLeft size={22} /></button>
        </div>
        <div className="flex gap-6 mb-0 relative">
            <button onClick={() => setActiveTab('social')} className={`py-3 text-sm font-bold transition-colors relative ${activeTab === 'social' ? theme.text : theme.textSub}`}>Social Feed{activeTab === 'social' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${theme.accentBg}`}></div>}</button>
            <button onClick={() => setActiveTab('arena')} className={`py-3 text-sm font-bold transition-colors relative ${activeTab === 'arena' ? theme.text : theme.textSub}`}>Arena & Sfide{activeTab === 'arena' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${theme.accentBg}`}></div>}</button>
        </div>
      </div>

      {activeTab === 'arena' && (
          <div className="px-5 py-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className={`rounded-2xl p-4 mb-6 relative overflow-hidden flex items-center justify-between border ${theme.accentBorder} bg-${themeColor}-500/10`}>
                  <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.accentBg} text-white animate-pulse`}><Timer size={20} /></div>
                      <div><p className={`text-[10px] font-bold uppercase tracking-widest ${theme.accent}`}>Stagione in corso</p><p className={`font-bold text-sm ${theme.text}`}>Termina in <span className={theme.accent}>2 giorni</span></p></div>
                  </div>
                  <ChevronRight size={18} className={`${theme.accent} relative z-10`} />
              </div>

              <div className="mb-10">
                  <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${theme.text}`}><Trophy size={18} className="text-yellow-500" /> Classifica Globale</h3>
                  {leaderboard.length >= 3 && (
                      <div className="flex justify-center items-end gap-3 mb-8 h-48 pt-4">
                          {/* 2nd Place */}
                          <div className="flex flex-col items-center w-1/3">
                              <div className="relative mb-2">
                                  <div className={`w-16 h-16 rounded-full border-2 border-slate-300 overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                      {leaderboard[1].image ? <img src={leaderboard[1].image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-300" />}
                                  </div>
                                  <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-slate-300 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#121212]">2</span></div>
                              </div>
                              <p className={`text-xs font-bold text-center truncate w-full ${theme.text}`}>{leaderboard[1].name}</p>
                              <div className="w-full h-24 bg-gradient-to-t from-slate-300/20 to-transparent rounded-t-xl mt-2 border-t border-slate-300/20 flex items-end justify-center pb-2"><span className="text-[10px] font-bold text-slate-400">{leaderboard[1].workouts} WO</span></div>
                          </div>
                          {/* 1st Place */}
                          <div className="flex flex-col items-center w-1/3 z-10 -mt-6">
                              <div className="relative mb-2">
                                  <Trophy size={28} className="text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                                  <div className={`w-20 h-20 rounded-full border-2 border-yellow-400 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.3)] ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                      {leaderboard[0].image ? <img src={leaderboard[0].image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-5 text-yellow-400" />}
                                  </div>
                                  <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-yellow-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-[#121212]">1</span></div>
                              </div>
                              <p className="text-sm font-bold text-center truncate w-full text-yellow-500">{leaderboard[0].name}</p>
                              <div className="w-full h-32 bg-gradient-to-t from-yellow-400/20 to-transparent rounded-t-xl mt-2 border-t border-yellow-400/20 flex items-end justify-center pb-3 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-yellow-400/5 blur-md"></div>
                                  <span className="text-xs font-bold text-yellow-400 relative z-10">{leaderboard[0].workouts} WO</span>
                              </div>
                          </div>
                          {/* 3rd Place */}
                          <div className="flex flex-col items-center w-1/3">
                              <div className="relative mb-2">
                                  <div className={`w-16 h-16 rounded-full border-2 border-amber-700 overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                      {leaderboard[2].image ? <img src={leaderboard[2].image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-amber-700" />}
                                  </div>
                                  <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-amber-700 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#121212]">3</span></div>
                              </div>
                              <p className={`text-xs font-bold text-center truncate w-full ${theme.text}`}>{leaderboard[2].name}</p>
                              <div className="w-full h-16 bg-gradient-to-t from-amber-700/20 to-transparent rounded-t-xl mt-2 border-t border-amber-700/20 flex items-end justify-center pb-2"><span className="text-[10px] font-bold text-amber-700">{leaderboard[2].workouts} WO</span></div>
                          </div>
                      </div>
                  )}
                  {/* List for others */}
                  <div className="space-y-2">
                      {leaderboard.slice(3).map((entry) => (
                          <div key={entry.id} className={`flex items-center gap-4 p-3 rounded-2xl border ${theme.card} ${entry.isUser ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}>
                              <span className="w-6 text-center font-bold text-slate-500 text-sm">#{entry.rank}</span>
                              <div className={`w-10 h-10 rounded-full overflow-hidden border ${isDarkMode ? 'border-white/10 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
                                  {entry.image ? <img src={entry.image} className="w-full h-full object-cover" /> : <User className="p-2 text-slate-500 w-full h-full" />}
                              </div>
                              <div className="flex-1">
                                  <p className={`text-sm font-bold ${theme.text} flex items-center gap-2`}>
                                      {entry.name}
                                      {entry.hasActiveChallenge && <Swords size={12} className="text-red-500"/>}
                                  </p>
                              </div>
                              <div className={`px-2 py-1 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}><p className={`text-xs font-bold ${theme.text}`}>{entry.workouts} WO</p></div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* CHALLENGES */}
              <div>
                  <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${theme.text}`}><Swords size={18} className={theme.accent} /> Sfide Attive</h3>
                  <div className="space-y-4">
                      {challenges.length === 0 ? (
                          <div className={`p-8 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center gap-2 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-300 bg-slate-50'}`}><Swords size={32} className="text-slate-500 opacity-50" /><p className={`${theme.textSub} text-sm font-medium`}>L'arena è vuota. Lancia la prima sfida!</p></div>
                      ) : (
                          challenges.map(challenge => (
                              <div key={challenge.id} className={`${theme.card} p-0 rounded-3xl border overflow-hidden`}>
                                  <div className="bg-gradient-to-r from-red-900/40 to-blue-900/40 p-4 flex justify-between items-center relative">
                                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                      <div className="flex flex-col items-center z-10 w-1/3">
                                          <div className={`w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden mb-1`}><img src={userProfile?.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"} className="w-full h-full object-cover"/></div>
                                          <span className="text-[10px] font-bold text-emerald-400">TU</span>
                                      </div>
                                      <div className="z-10 font-black text-2xl italic text-white/20">VS</div>
                                      <div className="flex flex-col items-center z-10 w-1/3">
                                          <div className={`w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden mb-1`}>
                                              {challenge.opponentImage ? <img src={challenge.opponentImage} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-500 bg-slate-800" />}
                                          </div>
                                          <span className="text-[10px] font-bold text-red-400 truncate w-full text-center">{challenge.opponentName.split(' ')[0]}</span>
                                      </div>
                                  </div>
                                  <div className="p-4 text-center">
                                      <h4 className={`font-black text-lg ${theme.text} mb-1`}>{challenge.exercise}</h4>
                                      <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest">{challenge.targetMetric === 'time' ? 'Resistenza' : 'Forza'} • {challenge.targetValue}</p>
                                      
                                      <div className="flex justify-center mb-4">
                                          {challenge.status === 'active' && (
                                              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">In attesa dell'avversario...</span>
                                          )}
                                          {challenge.status === 'expired_win' && (
                                              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">Vinta (Scadenza)</span>
                                          )}
                                          {challenge.status === 'expired_loss' && (
                                              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">Persa (Tempo Scaduto)</span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --- SOCIAL TAB --- */}
      {activeTab === 'social' && (
        <div className="animate-in fade-in slide-in-from-left-8 duration-500">
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${isDarkMode ? 'bg-[#18181b]' : 'bg-white'}`}>
                <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                        {userProfile?.image ? <img src={userProfile.image} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                        <div className={`w-full rounded-2xl p-3 min-h-[48px] ${theme.inputBg}`}>
                            <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Condividi un traguardo..." rows={1} className={`w-full bg-transparent ${theme.text} placeholder-zinc-500 text-sm focus:outline-none resize-none`} />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <button onClick={handlePost} disabled={!newPostContent.trim()} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${newPostContent.trim() ? theme.accentBg : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}><Send size={14} className={newPostContent.trim() ? 'text-white' : ''} /></button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-5 space-y-6 pb-10 mt-4">
                {filteredPosts.map(post => (
                    <div key={post.id} className={`${theme.card} rounded-[2rem] overflow-hidden`}>
                        <div className="p-4 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full overflow-hidden border ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                                    {post.userImage ? <img src={post.userImage} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-500 bg-slate-800" />}
                                </div>
                                <div><h4 className={`font-bold text-sm ${theme.text}`}>{post.user}</h4><span className={`text-[10px] ${theme.textSub}`}>{post.time}</span></div>
                            </div>
                        </div>
                        <div className="px-4 pb-3"><p className={`text-sm leading-relaxed ${theme.text}`}>{post.content}</p></div>
                        {post.image && <div className="w-full aspect-[4/3] bg-black relative"><img src={post.image} className="w-full h-full object-cover" /></div>}
                        
                        {post.activeChallengeId && (
                            <div className="px-4 pb-2">
                                <div className={`w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-900/40 to-blue-900/40 border border-white/10 flex items-center justify-between`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2"><Swords size={12} className="animate-pulse"/> Sfida in Corso</span>
                                    <span className="text-[10px] font-mono text-zinc-300">Scadenza: 48h</span>
                                </div>
                            </div>
                        )}

                        <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-5">
                                <button onClick={() => onLikePost(post.id)} className={`flex items-center gap-1.5 group ${post.liked ? 'text-red-500' : theme.textSub}`}>
                                    <Heart size={22} fill={post.liked ? "currentColor" : "none"}/>
                                    <span className="text-xs font-bold">{post.likes}</span>
                                </button>
                                
                                <button onClick={() => setActivePostId(post.id)} className={`flex items-center gap-1.5 group ${theme.textSub} hover:text-blue-400`}>
                                    <MessageCircle size={22} />
                                    <span className="text-xs font-bold">{post.comments}</span>
                                </button>

                                {userProfile?.id !== post.userId && !post.activeChallengeId && (
                                    <button 
                                        onClick={() => onStartChallenge(post.userId, post.user, post.userImage, post.id, post.content)} 
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${themeColor}-500/10 text-${themeColor}-500 hover:bg-${themeColor}-500/20 transition-colors border border-${themeColor}-500/20`}
                                    >
                                        <Swords size={16} />
                                        <span className="text-xs font-bold">SFIDA</span>
                                    </button>
                                )}
                            </div>
                            <button className={theme.textSub}><MoreHorizontal size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* COMING SOON OVERLAY */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm`}></div>
          
          <div className="relative z-10 max-w-xs w-full bg-[#1c1c1e] border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl transform rotate-[-2deg] animate-in zoom-in-95 duration-700">
              <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-${themeColor}-400 to-${themeColor}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${themeColor}-500/20`}>
                  <Lock size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 italic tracking-tight uppercase">
                  Coming Soon
              </h2>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                  Stiamo costruendo l'arena definitiva. Prepara i muscoli per le sfide.
              </p>
          </div>
      </div>

      {/* Disabled Tutorial Overlay */}
      {/* {showTutorial && onTutorialComplete && <CommunityTutorialOverlay onComplete={onTutorialComplete} onRequestTabChange={setActiveTab} themeColor={themeColor} />} */}
    </div>
  );
};

export default CommunityScreen;
