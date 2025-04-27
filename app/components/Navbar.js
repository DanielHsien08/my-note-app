'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 監聽認證狀態變化
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // 清理函數
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('登出失敗:', error);
      alert('登出失敗，請稍後再試');
    }
  };

  return (
    <nav className="bg-black p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold hover:text-purple-400 transition duration-300">
          Note App
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-white">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/sign-in"
                className="px-4 py-2 text-white hover:text-purple-400 transition duration-300"
              >
                登入
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
              >
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 