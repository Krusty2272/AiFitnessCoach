export interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  totalWorkouts: number;
  currentStreak: number;
  isOnline: boolean;
  lastActive: string;
  status: 'training' | 'rest' | 'offline';
}

export interface FriendRequest {
  id: string;
  from: Friend;
  message: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Challenge {
  id: string;
  type: 'workouts' | 'calories' | 'streak' | 'specific';
  title: string;
  description: string;
  creator: Friend;
  participants: Friend[];
  startDate: string;
  endDate: string;
  goal: number;
  currentProgress: Record<string, number>;
  reward: string;
  status: 'pending' | 'active' | 'completed';
}

export interface SharedResult {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  workoutName: string;
  duration: number;
  calories: number;
  exercises: number;
  date: string;
  likes: string[];
  comments: Comment[];
  personalRecord?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: Friend;
  score: number;
  change: 'up' | 'down' | 'same';
  changeAmount?: number;
}

class SocialService {
  private friends: Friend[] = [];
  private friendRequests: FriendRequest[] = [];
  private challenges: Challenge[] = [];
  private sharedResults: SharedResult[] = [];
  private currentUserId = 'user_1';

  constructor() {
    this.loadData();
    this.generateMockData();
  }

  private loadData() {
    const friends = localStorage.getItem('friends');
    const requests = localStorage.getItem('friendRequests');
    const challenges = localStorage.getItem('challenges');
    const shared = localStorage.getItem('sharedResults');

    if (friends) this.friends = JSON.parse(friends);
    if (requests) this.friendRequests = JSON.parse(requests);
    if (challenges) {
      // Парсим челленджи и конвертируем Map обратно в объект если нужно
      const parsed = JSON.parse(challenges);
      this.challenges = parsed.map((c: any) => ({
        ...c,
        currentProgress: c.currentProgress || {}
      }));
    }
    if (shared) this.sharedResults = JSON.parse(shared);
  }

  private saveData() {
    localStorage.setItem('friends', JSON.stringify(this.friends));
    localStorage.setItem('friendRequests', JSON.stringify(this.friendRequests));
    localStorage.setItem('challenges', JSON.stringify(this.challenges));
    localStorage.setItem('sharedResults', JSON.stringify(this.sharedResults));
  }

  private generateMockData() {
    if (this.friends.length === 0) {
      this.friends = [
        {
          id: 'friend_1',
          username: 'СпортсменПро',
          avatar: '💪',
          level: 15,
          totalWorkouts: 150,
          currentStreak: 7,
          isOnline: true,
          lastActive: new Date().toISOString(),
          status: 'training'
        },
        {
          id: 'friend_2',
          username: 'ФитнесГуру',
          avatar: '🏃',
          level: 12,
          totalWorkouts: 98,
          currentStreak: 3,
          isOnline: true,
          lastActive: new Date().toISOString(),
          status: 'rest'
        },
        {
          id: 'friend_3',
          username: 'Новичок2024',
          avatar: '🌟',
          level: 5,
          totalWorkouts: 25,
          currentStreak: 1,
          isOnline: false,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          status: 'offline'
        }
      ];

      this.challenges = [
        {
          id: 'challenge_1',
          type: 'workouts',
          title: 'Недельный марафон',
          description: 'Выполните 7 тренировок за неделю',
          creator: this.friends[0],
          participants: [this.friends[0], this.friends[1]],
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          goal: 7,
          currentProgress: {
            'friend_1': 3,
            'friend_2': 2,
            'user_1': 1
          },
          reward: '🏆 Чемпион недели',
          status: 'active'
        }
      ];

      this.sharedResults = [
        {
          id: 'result_1',
          userId: 'friend_1',
          username: 'СпортсменПро',
          avatar: '💪',
          workoutName: 'Интенсивная тренировка',
          duration: 45,
          calories: 380,
          exercises: 12,
          date: new Date().toISOString(),
          likes: ['friend_2', 'user_1'],
          comments: [
            {
              id: 'comment_1',
              userId: 'friend_2',
              username: 'ФитнесГуру',
              text: 'Отличная работа! 💪',
              timestamp: new Date().toISOString()
            }
          ],
          personalRecord: true
        }
      ];

      this.saveData();
    }
  }

  // Друзья и приглашения
  getFriends(): Friend[] {
    return this.friends;
  }

  getFriendRequests(): FriendRequest[] {
    return this.friendRequests.filter(r => r.status === 'pending');
  }

  sendFriendRequest(username: string, message: string = ''): void {
    const request: FriendRequest = {
      id: `request_${Date.now()}`,
      from: {
        id: this.currentUserId,
        username: 'Вы',
        avatar: '🏋️',
        level: 10,
        totalWorkouts: 50,
        currentStreak: 5,
        isOnline: true,
        lastActive: new Date().toISOString(),
        status: 'rest'
      },
      message,
      sentAt: new Date().toISOString(),
      status: 'pending'
    };
    this.friendRequests.push(request);
    this.saveData();
  }

  acceptFriendRequest(requestId: string): void {
    const request = this.friendRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'accepted';
      this.friends.push(request.from);
      this.saveData();
    }
  }

  rejectFriendRequest(requestId: string): void {
    const request = this.friendRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'rejected';
      this.saveData();
    }
  }

  // Челленджи
  getChallenges(): Challenge[] {
    return this.challenges;
  }

  createChallenge(challenge: Omit<Challenge, 'id' | 'creator' | 'currentProgress' | 'status'>): void {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge_${Date.now()}`,
      creator: {
        id: this.currentUserId,
        username: 'Вы',
        avatar: '🏋️',
        level: 10,
        totalWorkouts: 50,
        currentStreak: 5,
        isOnline: true,
        lastActive: new Date().toISOString(),
        status: 'rest'
      },
      currentProgress: {},
      status: 'pending'
    };
    this.challenges.push(newChallenge);
    this.saveData();
  }

  joinChallenge(challengeId: string): void {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (challenge && challenge.status === 'pending') {
      challenge.status = 'active';
      challenge.currentProgress[this.currentUserId] = 0;
      this.saveData();
    }
  }

  updateChallengeProgress(challengeId: string, progress: number): void {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (challenge && challenge.status === 'active') {
      challenge.currentProgress[this.currentUserId] = progress;
      
      // Проверяем, достигнута ли цель
      if (progress >= challenge.goal) {
        challenge.status = 'completed';
      }
      this.saveData();
    }
  }

  // Результаты и социальное взаимодействие
  getSharedResults(): SharedResult[] {
    return this.sharedResults.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  shareResult(workoutData: {
    workoutName: string;
    duration: number;
    calories: number;
    exercises: number;
  }): void {
    const result: SharedResult = {
      id: `result_${Date.now()}`,
      userId: this.currentUserId,
      username: 'Вы',
      avatar: '🏋️',
      ...workoutData,
      date: new Date().toISOString(),
      likes: [],
      comments: [],
      personalRecord: Math.random() > 0.7 // Случайно определяем личный рекорд
    };
    this.sharedResults.unshift(result);
    this.saveData();
  }

  likeResult(resultId: string): void {
    const result = this.sharedResults.find(r => r.id === resultId);
    if (result) {
      const index = result.likes.indexOf(this.currentUserId);
      if (index === -1) {
        result.likes.push(this.currentUserId);
      } else {
        result.likes.splice(index, 1);
      }
      this.saveData();
    }
  }

  commentOnResult(resultId: string, text: string): void {
    const result = this.sharedResults.find(r => r.id === resultId);
    if (result) {
      result.comments.push({
        id: `comment_${Date.now()}`,
        userId: this.currentUserId,
        username: 'Вы',
        text,
        timestamp: new Date().toISOString()
      });
      this.saveData();
    }
  }

  // Рейтинг
  getLeaderboard(type: 'workouts' | 'streak' | 'calories' = 'workouts'): LeaderboardEntry[] {
    const allUsers = [
      ...this.friends,
      {
        id: this.currentUserId,
        username: 'Вы',
        avatar: '🏋️',
        level: 10,
        totalWorkouts: 50,
        currentStreak: 5,
        isOnline: true,
        lastActive: new Date().toISOString(),
        status: 'rest' as const
      }
    ];

    const sorted = allUsers.sort((a, b) => {
      switch (type) {
        case 'workouts':
          return b.totalWorkouts - a.totalWorkouts;
        case 'streak':
          return b.currentStreak - a.currentStreak;
        default:
          return b.level - a.level;
      }
    });

    return sorted.map((user, index) => ({
      rank: index + 1,
      user,
      score: type === 'workouts' ? user.totalWorkouts : 
             type === 'streak' ? user.currentStreak : 
             user.level * 100,
      change: 'same' as const,
      changeAmount: 0
    }));
  }

  // Поиск пользователей
  searchUsers(query: string): Friend[] {
    // В реальном приложении это был бы запрос к серверу
    const mockResults: Friend[] = [
      {
        id: `search_${Date.now()}`,
        username: query,
        avatar: '🤸',
        level: Math.floor(Math.random() * 20),
        totalWorkouts: Math.floor(Math.random() * 200),
        currentStreak: Math.floor(Math.random() * 30),
        isOnline: Math.random() > 0.5,
        lastActive: new Date().toISOString(),
        status: 'offline'
      }
    ];
    return mockResults;
  }
}

export default new SocialService();