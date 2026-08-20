import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && refreshToken) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }

        setAuthLoading(false);
    }, []);

    const login = (data) => {
        if (data.access) {
            localStorage.setItem("access_token", data.access);
        }

        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }

        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                authLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

