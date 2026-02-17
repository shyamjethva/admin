import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import authService from "../services/authServices";
import api from "../services/api";

export type UserRole = "admin" | "hr" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department: string;
  designation: string;
  avatar?: string;
  clientName?: string; // For client users
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  "rakshit@gmail.com": {
    id: "1",
    name: "Admin User",
    email: "rakshit@gmail.com",
    role: "admin",
    department: "Administration",
    designation: "System Administrator",
  },
  "hemal@gmail.com": {
    id: "2",
    name: "HR Manager",
    email: "hemal@gmail.com",
    role: "hr",
    department: "Human Resources",
    designation: "HR Manager",
  },
  "employee@company.com": {
    id: "3",
    name: "John Doe",
    email: "employee@company.com",
    role: "employee",
    department: "Development",
    designation: "Senior Developer",
  },
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    // ✅ Only restore session if BOTH user AND token exist
    if (savedUser && savedToken) {
      console.log("✅ Restoring previous session...");
      setUser(JSON.parse(savedUser));
      setShowLogin(false);
    } else {
      // ❌ Clear partial session data
      console.log("❌ No valid session found, showing login...");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      setUser(null);
      setShowLogin(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await authService.login({ email, password });

      // Extract data from axios response
      const res = response.data || response;

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      // ✅ token extract (safe way)
      const token =
        res?.token ||
        res?.data?.token ||
        res?.accessToken ||
        res?.data?.accessToken;

      const backendUser =
        res?.user || res?.data?.user;

      const success =
        res?.success ?? res?.data?.success;

      if (!success) {
        throw new Error(res?.message || res?.data?.message || "Invalid credentials");
      }

      if (!token) {
        throw new Error("Token missing in login response");
      }

      if (!backendUser) {
        throw new Error("User missing in login response");
      }

      const userData: User = {
        id: backendUser.id || backendUser._id,
        name: backendUser.name,
        email: backendUser.email,
        role: (backendUser.role || "employee") as UserRole,
        phone: backendUser.phone || "",
        department: backendUser.department || "",
        designation: backendUser.designation || "",
        avatar: backendUser.avatar || "",
      };

      // ✅ SAVE BOTH USER + TOKEN
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", token);

      console.log("TOKEN SAVED 👉", localStorage.getItem("token"));

      setShowLogin(false);
    } catch (e: any) {
      // Handle role validation error specifically
      if (e.response?.status === 403) {
        throw new Error(e.response?.data?.message || "Access denied. Only admin, HR, and employee roles are allowed to login.");
      }

      // ❌ TEMP: mock login band rakho jab tak auth fix ho
      console.log("backend login failed", e);

      throw e;
    }
  };


  const logout = async () => {
    console.log("🚪 Logging out...");
    authService.logout();
    setUser(null);
    // ✅ Clear all possible token storage keys
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    setShowLogin(true);
    console.log("✅ Logged out successfully");
  };



  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // Call backend API to update user profile
      await api.put('/auth/profile', data);

      // Update local state after successful API call
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
      // Still update local state even if API fails
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser),
      );
    }
  };

  if (showLogin) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, switchRole, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password");
  };

  // Quick login buttons for testing
  const quickLoginButtons = [
    { email: "rakshit@gmail.com", label: "Admin Login", role: "admin" },
    { email: "hemal@gmail.com", label: "HR Login", role: "hr" },
    { email: "employee@company.com", label: "Employee Login", role: "employee" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }
  return context;
}


// chatgpt code 