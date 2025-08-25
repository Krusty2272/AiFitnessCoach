import { useState, useEffect } from 'react';
import type { User } from '../services/api';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем данные из localStorage
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        setUser({
          id: 1, // Mock ID
          username: 'user',
          ...userData
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const updateUser = (data: Partial<User>) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser as User);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('userData');
  };

  return {
    user,
    loading,
    updateUser,
    clearUser,
    isOnboarded: !!user?.fitness_goal && !!user?.experience_level
  };
};