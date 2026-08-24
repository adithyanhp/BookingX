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

        // -----------------------------------------------------
        // SAVE ACCESS TOKEN
        // -----------------------------------------------------

        if (data?.access) {

            localStorage.setItem(
                "access_token",
                data.access
            );
        }


        // -----------------------------------------------------
        // SAVE REFRESH TOKEN
        // -----------------------------------------------------

        if (data?.refresh) {

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );
        }


        // -----------------------------------------------------
        // UPDATE AUTHENTICATION STATE
        // -----------------------------------------------------

        if (
            data?.access &&
            data?.refresh
        ) {

            setIsAuthenticated(true);
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================
    //
    // Normal logout:
    //
    // 1. Send logout request to Django
    // 2. Django creates UserActivity(LOGOUT)
    // 3. Remove JWT tokens
    // 4. Update authentication state
    //
    // Account deletion:
    //
    // logout({
    //     skipServerRequest: true
    // })
    //
    // Because the account has already been permanently deleted,
    // Django can no longer authenticate the user for /logout/.
    //
    // =========================================================

    const logout = async ({
        skipServerRequest = false,
    } = {}) => {

        const accessToken =
            localStorage.getItem("access_token");


        // =====================================================
        // RECORD LOGOUT ACTIVITY
        // =====================================================
        //
        // Skip this when the account has already been deleted.
        //
        // =====================================================

        if (
            accessToken &&
            !skipServerRequest
        ) {

            try {

                const response =
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


                // -------------------------------------------------
                // Backend logout failed
                // -------------------------------------------------

                if (!response.ok) {

                    console.warn(
                        "Logout request was not accepted by the server."
                    );
                }

            } catch (error) {

                console.error(
                    "Logout activity could not be recorded:",
                    error
                );
            }
        }


        // =====================================================
        // REMOVE JWT TOKENS
        // =====================================================

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );


        // =====================================================
        // UPDATE AUTHENTICATION STATE
        // =====================================================

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

