import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] =
        useState(false);

    const [authLoading, setAuthLoading] =
        useState(true);


    // =========================================================
    // CHECK AUTHENTICATION WHEN APP STARTS
    // =========================================================

    useEffect(() => {

        const accessToken =
            localStorage.getItem("access_token");

        const refreshToken =
            localStorage.getItem("refresh_token");


        if (accessToken && refreshToken) {

            setIsAuthenticated(true);

        } else {

            setIsAuthenticated(false);
        }


        setAuthLoading(false);

    }, []);


    // =========================================================
    // LOGIN
    // =========================================================

    const login = (data) => {

        if (data?.access) {

            localStorage.setItem(
                "access_token",
                data.access
            );
        }


        if (data?.refresh) {

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );
        }


        // Mark user as authenticated
        if (data?.access && data?.refresh) {

            setIsAuthenticated(true);
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );


        setIsAuthenticated(false);
    };


    // =========================================================
    // CONTEXT
    // =========================================================

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


// =========================================================
// USE AUTH
// =========================================================

export function useAuth() {

    return useContext(AuthContext);
}

