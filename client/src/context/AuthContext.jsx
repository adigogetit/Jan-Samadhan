import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentUser, logoutUser, } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authRequestId = useRef(0);

  const loadCurrentUser = async () => {
    const requestId = ++authRequestId.current;

    try {
      const response = await getCurrentUser();

      if (requestId !== authRequestId.current) return;

      if (response?.success && response?.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (requestId !== authRequestId.current) return;
      setUser(null);
    } finally {
      if (requestId === authRequestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const logout = async () => {
    authRequestId.current += 1;

    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser: (nextUser) => {
      authRequestId.current += 1;
      setUser(nextUser);
    },
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser: loadCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}