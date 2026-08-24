import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";


const AuthContext = createContext(null);


// =========================================================
// API BASE URL
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000/api";


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


        // -----------------------------------------------------
        // Mark user as authenticated
        // -----------------------------------------------------

        if (data?.access && data?.refresh) {

            setIsAuthenticated(true);
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================
    //
    // 1. Send logout request to Django
    // 2. Django creates UserActivity(LOGOUT)
    // 3. Remove JWT tokens from browser
    // 4. Update authentication state
    //
    // Even if the backend request fails, the user is still
    // logged out locally.
    // =========================================================

    const logout = async () => {

        const accessToken =
            localStorage.getItem("access_token");


        // -----------------------------------------------------
        // RECORD LOGOUT ACTIVITY IN DJANGO
        // -----------------------------------------------------

        if (accessToken) {

            try {

                await fetch(
                    `${API_BASE_URL}/auth/logout/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${accessToken}`,
                        },
                    }
                );

            } catch (error) {

                console.error(
                    "Logout activity could not be recorded:",
                    error
                );
            }
        }


        // -----------------------------------------------------
        // REMOVE JWT TOKENS
        // -----------------------------------------------------

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );


        // -----------------------------------------------------
        // UPDATE AUTHENTICATION STATE
        // -----------------------------------------------------

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

