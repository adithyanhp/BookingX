import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {

    const accessToken =
        localStorage.getItem("access_token");

    const refreshToken =
        localStorage.getItem("refresh_token");


    // =========================================================
    // USER MUST BE LOGGED IN
    // =========================================================

    if (!accessToken || !refreshToken) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // =========================================================
    // USER IS AUTHENTICATED
    // =========================================================

    return <Outlet />;
}

export default ProtectedRoute;

