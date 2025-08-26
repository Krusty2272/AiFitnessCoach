import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import socialService, { Friend, Challenge, SharedResult, LeaderboardEntry } from '../services/socialService';
import achievementService from '../services/achievementService';
import particleService from '../services/particleService';
import hapticService from '../services/hapticService';
import levelService from '../services/levelService';
import userProfileService from '../services/userProfileService';

type Tab = 'friends' | 'challenges' | 'feed' | 'leaderboard';

const SocialScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [feed, setFeed] = useState<SharedResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const userProfile = userProfileService.getProfile();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFriends(socialService.getFriends());
    setChallenges(socialService.getChallenges());
    setFeed(socialService.getSharedResults());
    setLeaderboard(socialService.getLeaderboard('workouts'));
  };

  const handleInviteFriend = () => {
    if (searchQuery.trim()) {
      socialService.sendFriendRequest(searchQuery, 'Давай тренироваться вместе! 💪');
      hapticService.success();
      particleService.stars(window.innerWidth / 2, 200);
      setSearchQuery('');
      setShowInviteModal(false);
      
      // Обновляем достижения
      achievementService.updateSocialProgress('friends', friends.length + 1);
      
      // Начисляем опыт за добавление друга
      levelService.onSocialInteraction('friend');
    }
  };

  const handleLikeResult = (resultId: string) => {
    socialService.likeResult(resultId);
    hapticService.light();
    setFeed(socialService.getSharedResults());
    
    // Опыт за лайк
    levelService.onSocialInteraction('like');
  };

  const handleJoinChallenge = (challengeId: string) => {
    socialService.joinChallenge(challengeId);
    hapticService.success();
    particleService.confetti({
      particleCount: 30,
      spread: 45,
      origin: { x: 0.5, y: 0.5 }
    });
    setChallenges(socialService.getChallenges());
    
    // Опыт за участие в челлендже
    levelService.addXP('CHALLENGE_PARTICIPATION');
  };

  const tabs = [
    { id: 'friends' as Tab, label: 'Друзья', icon: '👥' },
    { id: 'challenges' as Tab, label: 'Челленджи', icon: '🎯' },
    { id: 'feed' as Tab, label: 'Лента', icon: '📱' },
    { id: 'leaderboard' as Tab, label: 'Рейтинг', icon: '🏆' }
  ];

  return (
    <div className="app-content">
      <div className="app-header">
        <h1>Сообщество</h1>
        <p>Тренируйтесь вместе с друзьями</p>
      </div>

      {/* Табы */}
      <div style={{
        display: 'flex',
        gap: '5px',
        padding: '10px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '10px',
              background: activeTab === tab.id ? 'var(--primary-gradient)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        {/* Контент вкладок */}
        {activeTab === 'friends' && (
          <div style={{ padding: '20px' }}>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-primary btn-full"
              style={{ marginBottom: '20px' }}
            >
              ➕ Пригласить друга
            </button>

            <h3 style={{ marginBottom: '15px' }}>Ваши друзья ({friends.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {friends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => navigate(`/profile/${friend.id}`)}
                  style={{
                    background: 'var(--background-card)',
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    width: '50px',
                    height: '50px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {friend.avatar}
                    {friend.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '12px',
                        height: '12px',
                        background: '#4ade80',
                        borderRadius: '50%',
                        border: '2px solid var(--background-primary)'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {friend.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Уровень {friend.level} • {friend.totalWorkouts} тренировок
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {friend.status === 'training' ? '🏋️ Тренируется' :
                       friend.status === 'rest' ? '😌 Отдыхает' :
                       '💤 Офлайн'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px' }}>🔥</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {friend.currentStreak}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Активные челленджи</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {challenges.map(challenge => (
                <div
                  key={challenge.id}
                  style={{
                    background: 'var(--background-card)',
                    borderRadius: '12px',
                    padding: '15px',
                    border: challenge.status === 'active' ? '2px solid #667eea' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4>{challenge.title}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      background: challenge.status === 'active' ? '#4ade80' :
                                 challenge.status === 'completed' ? '#ffd700' : '#667eea',
                      fontSize: '12px',
                      color: 'black'
                    }}>
                      {challenge.status === 'active' ? 'Активен' :
                       challenge.status === 'completed' ? 'Завершен' : 'Ожидает'}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {challenge.description}
                  </p>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px' }}>Прогресс</span>
                      <span style={{ fontSize: '12px' }}>
                        {Object.values(challenge.currentProgress || {}).reduce((a, b) => a + b, 0)} / {challenge.goal}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(Object.values(challenge.currentProgress || {}).reduce((a, b) => a + b, 0) / challenge.goal) * 100}%`,
                        height: '100%',
                        background: 'var(--primary-gradient)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Награда: {challenge.reward}
                    </div>
                    {challenge.status === 'pending' && (
                      <button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="btn btn-sm"
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          background: 'var(--primary-gradient)'
                        }}
                      >
                        Присоединиться
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Лента активности</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {feed.map(result => (
                <div
                  key={result.id}
                  style={{
                    background: 'var(--background-card)',
                    borderRadius: '12px',
                    padding: '15px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '24px',
                      width: '40px',
                      height: '40px',
                      background: 'var(--primary-gradient)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {result.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{result.username}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(result.date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    {result.personalRecord && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'black'
                      }}>
                        🏆 Личный рекорд!
                      </span>
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ marginBottom: '10px' }}>{result.workoutName}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{result.duration}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>мин</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{result.calories}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ккал</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{result.exercises}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>упр.</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      onClick={() => handleLikeResult(result.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: result.likes.includes('user_1') ? '#ef4444' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {result.likes.includes('user_1') ? '❤️' : '🤍'} {result.likes.length}
                    </button>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      💬 {result.comments.length}
                    </button>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      📤 Поделиться
                    </button>
                  </div>

                  {result.comments.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      {result.comments.map(comment => (
                        <div key={comment.id} style={{ marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                            {comment.username}:
                          </span>{' '}
                          <span style={{ fontSize: '12px' }}>{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Рейтинг лидеров</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id}
                  style={{
                    background: index < 3 ? 
                      `linear-gradient(135deg, ${
                        index === 0 ? '#ffd700, #ffed4e' :
                        index === 1 ? '#c0c0c0, #e8e8e8' :
                        '#cd7f32, #e09865'
                      })` : 'var(--background-card)',
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    width: '30px',
                    textAlign: 'center',
                    color: index < 3 ? 'black' : 'var(--text-primary)'
                  }}>
                    {index === 0 ? '🥇' :
                     index === 1 ? '🥈' :
                     index === 2 ? '🥉' :
                     entry.rank}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    width: '40px',
                    height: '40px',
                    background: index < 3 ? 'white' : 'var(--primary-gradient)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {entry.user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: index < 3 ? 'black' : 'var(--text-primary)'
                    }}>
                      {entry.user.username}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: index < 3 ? 'rgba(0,0,0,0.7)' : 'var(--text-secondary)'
                    }}>
                      Уровень {entry.user.level}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: index < 3 ? 'black' : 'var(--text-primary)'
                    }}>
                      {entry.score}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: index < 3 ? 'rgba(0,0,0,0.7)' : 'var(--text-secondary)'
                    }}>
                      тренировок
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно приглашения */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--background-secondary)',
            borderRadius: '20px',
            padding: '20px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Пригласить друга</h3>
            <input
              type="text"
              placeholder="Введите имя пользователя"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--background-primary)',
                color: 'var(--text-primary)',
                marginBottom: '15px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleInviteFriend}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Отправить приглашение
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default SocialScreen;