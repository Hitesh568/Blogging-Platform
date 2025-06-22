import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ApiResponse,
} from "@/types";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentAuthUser,
  isAuthenticated as checkAuth,
  updateUserProfile,
} from "@/lib/auth";
import { initializeDefaultData } from "@/lib/storage";
import { initializeMockData } from "@/lib/mockData";

interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials,
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  register: (
    credentials: RegisterCredentials,
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<ApiResponse<User>>;
  checkAuthentication: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize authentication state
  useEffect(() => {
    initializeDefaultData();
    initializeMockData();
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    const isAuth = checkAuth();
    const user = getCurrentAuthUser();

    setAuthState({
      user,
      token: user ? "valid-token" : null,
      isAuthenticated: isAuth,
      isLoading: false,
    });
  };

  const login = async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authLogin(credentials);

      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }

      return response;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  };

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authRegister(credentials);

      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }

      return response;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  };

  const logout = () => {
    authLogout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (
    updates: Partial<User>,
  ): Promise<ApiResponse<User>> => {
    if (!authState.user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    try {
      const response = await updateUserProfile(authState.user.id, updates);

      if (response.success && response.data) {
        setAuthState((prev) => ({
          ...prev,
          user: response.data,
        }));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
