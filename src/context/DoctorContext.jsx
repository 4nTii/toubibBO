import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/config";
import { getUserInfo } from "../services/authService";
import { getDoctorInfo, updateDoctorProfile } from "../services/doctorService";

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear expired cookie via logout API
  const clearExpiredCookie = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore errors - cookie might already be cleared
    }
  };

  // Check auth via API (cookie is sent automatically)
  const checkAuthAndFetchUser = async () => {
    const result = await getUserInfo();

    if (result && result.status) {
      setUser(result.user);
      return true;
    } else {
      // Clear expired cookie so user can login again
      await clearExpiredCookie();
      setUser(null);
      return false;
    }
  };

  const fetchDoctorInfo = async () => {
    const result = await getDoctorInfo();

    if (result && result.status) {
      setDoctor(result.data.doctor);
    } else {
      setDoctor(null);
    }
  };

  // Initial auth check on load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthAndFetchUser();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Fetch doctor info when user changes
  useEffect(() => {
    if (user) {
      fetchDoctorInfo();
    } else {
      setDoctor(null);
    }
  }, [user]);

  // Re-check auth on visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthAndFetchUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/doctor/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La connexion a échoué");
      }

      const userResult = await getUserInfo();
      if (userResult && userResult.status) {
        setUser(userResult.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    setDoctor(null);
    await clearExpiredCookie();
  };

  const updateDoctor = async (fields, photoFile = null) => {
    const result = await updateDoctorProfile(fields, photoFile);

    if (result.success) {
      await fetchDoctorInfo();
    }

    return result;
  };

  const value = {
    user,
    doctor,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    fetchUserInfo: checkAuthAndFetchUser,
    fetchDoctorInfo,
    updateDoctor,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useAuth must be used within a DoctorProvider");
  }
  return context;
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctor must be used within a DoctorProvider");
  }
  return context;
}
