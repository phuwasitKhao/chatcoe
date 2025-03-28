// hooks/useUserData.ts
"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Extend the Session type to include the 'id' property
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export function useUserData() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`/api/user?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData({
              name: data.user.name || 'ไม่ระบุชื่อ',
              email: data.user.email || 'ไม่ระบุอีเมล',
              avatar: data.user.avatar || "/avatars/default.jpg"
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  return { userData, loading, status };
}