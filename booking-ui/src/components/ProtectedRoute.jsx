import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
