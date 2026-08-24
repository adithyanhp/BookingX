const API_BASE_URL = "http://127.0.0.1:8000/api";


// =========================================================
// JWT TOKEN REFRESH
// =========================================================

async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem("refresh_token");


    // No refresh token available

    if (!refreshToken) {
        return null;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/refresh/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );


        // Refresh token is invalid or expired

        if (!response.ok) {

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            return null;
        }


        const data =
            await response.json();


        // Save new access token

        if (data.access) {

            localStorage.setItem(
                "access_token",
                data.access
            );

        }


        return data.access || null;


    } catch (error) {

        console.error(
            "Failed to refresh access token:",
            error
        );

        return null;
    }
}


// =========================================================
// AUTHENTICATED FETCH
// Automatically refreshes expired access token
// =========================================================

export async function authenticatedFetch(
    url,
    options = {}
) {

    const accessToken =
        localStorage.getItem("access_token");


    // =====================================================
    // CREATE REQUEST
    // =====================================================

    const makeRequest = (token) => {

        const headers = {
            ...(options.headers || {}),
        };


        /*
         * Do not manually set Content-Type for FormData.
         *
         * The browser automatically creates:
         *
         * multipart/form-data
         *
         * with the correct boundary.
         */

        if (!(options.body instanceof FormData)) {

            headers["Content-Type"] =
                "application/json";
        }


        // Add Authorization header

        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }


        return fetch(
            url,
            {
                ...options,
                headers,
            }
        );
    };


    // =====================================================
    // FIRST REQUEST
    // =====================================================

    let response =
        await makeRequest(accessToken);


    // =====================================================
    // ACCESS TOKEN STILL VALID
    // =====================================================

    if (response.status !== 401) {

        return response;
    }


    // =====================================================
    // ACCESS TOKEN EXPIRED
    // Try refreshing it
    // =====================================================

    const newAccessToken =
        await refreshAccessToken();


    // =====================================================
    // REFRESH TOKEN ALSO INVALID/EXPIRED
    // =====================================================

    if (!newAccessToken) {

        return response;
    }


    // =====================================================
    // RETRY ORIGINAL REQUEST
    // =====================================================

    response =
        await makeRequest(newAccessToken);


    return response;
}


// =========================================================
// HOTELS
// =========================================================

// ---------------------------------------------------------
// GET ALL HOTELS
// ---------------------------------------------------------

export async function getHotels() {

    const response = await fetch(
        `${API_BASE_URL}/hotels/`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch hotels"
        );
    }


    return response.json();
}


// ---------------------------------------------------------
// GET SINGLE HOTEL
// ---------------------------------------------------------

export async function getHotel(id) {

    const response = await fetch(
        `${API_BASE_URL}/hotels/${id}/`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch hotel"
        );
    }


    return response.json();
}


// ---------------------------------------------------------
// FEATURED HOTELS
// ---------------------------------------------------------

export async function getFeaturedHotels() {

    const response = await fetch(
        `${API_BASE_URL}/hotels/featured/`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch featured hotels"
        );
    }


    return response.json();
}


// ---------------------------------------------------------
// HOTEL SEARCH
// ---------------------------------------------------------

export async function searchHotels(params) {

    const query =
        new URLSearchParams();


    Object.entries(params).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                query.append(
                    key,
                    value
                );
            }
        }
    );


    const response = await fetch(
        `${API_BASE_URL}/hotels/search/?${query.toString()}`
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// =========================================================
// ROOMS
// =========================================================

// ---------------------------------------------------------
// GET ROOMS BY HOTEL
// ---------------------------------------------------------

export async function getRoomsByHotel(
    hotelId
) {

    // Prevent invalid requests

    if (
        hotelId === undefined ||
        hotelId === null ||
        hotelId === ""
    ) {

        throw new Error(
            "Hotel ID is required to fetch rooms"
        );
    }


    const response = await fetch(
        `${API_BASE_URL}/rooms/?hotel=${encodeURIComponent(hotelId)}`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch hotel rooms"
        );
    }


    return response.json();
}


// ---------------------------------------------------------
// GET SINGLE ROOM
// ---------------------------------------------------------

export async function getRoom(id) {

    const response = await fetch(
        `${API_BASE_URL}/rooms/${id}/`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch room"
        );
    }


    return response.json();
}


// =========================================================
// AUTHENTICATION
// =========================================================


// ---------------------------------------------------------
// REGISTER
// ---------------------------------------------------------

export async function registerUser(
    userData
) {

    const response = await fetch(
        `${API_BASE_URL}/auth/register/`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(
                userData
            ),
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// ---------------------------------------------------------
// LOGIN
// ---------------------------------------------------------

export async function loginUser(
    credentials
) {

    const response = await fetch(
        `${API_BASE_URL}/auth/login/`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(
                credentials
            ),
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// =========================================================
// USER PROFILE
// =========================================================


// ---------------------------------------------------------
// GET USER PROFILE
// ---------------------------------------------------------

export async function getUserProfile() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/auth/profile/`,
            {
                method: "GET",
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// ---------------------------------------------------------
// UPDATE USER PROFILE
//
// Supports:
// - First name
// - Last name
// - Username
// - Email
// - Profile image
// ---------------------------------------------------------

export async function updateUserProfile(
    profileData
) {

    const formData =
        new FormData();


    // First name

    if (
        profileData.first_name !== undefined
    ) {

        formData.append(
            "first_name",
            profileData.first_name
        );
    }


    // Last name

    if (
        profileData.last_name !== undefined
    ) {

        formData.append(
            "last_name",
            profileData.last_name
        );
    }


    // Username

    if (
        profileData.username !== undefined
    ) {

        formData.append(
            "username",
            profileData.username
        );
    }


    // Email

    if (
        profileData.email !== undefined
    ) {

        formData.append(
            "email",
            profileData.email
        );
    }


    // Profile image
    // Only send when a new image is selected

    if (profileData.profile_image) {

        formData.append(
            "profile_image",
            profileData.profile_image
        );
    }


    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/auth/profile/`,
            {
                method: "PATCH",
                body: formData,
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// =========================================================
// CHANGE PASSWORD
//
// Backend endpoint:
// PATCH /api/auth/profile/password/
//
// Fields:
// - current_password
// - new_password
// - new_password2
// =========================================================

export async function changePassword(
    passwordData
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/auth/profile/password/`,
            {
                method: "PATCH",

                body: JSON.stringify(
                    passwordData
                ),
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// =========================================================
// DELETE ACCOUNT
//
// Backend endpoint:
// DELETE /api/auth/profile/delete/
//
// Requires:
// - current_password
//
// Permanently deletes the authenticated user's account.
// =========================================================

export async function deleteAccount(
    currentPassword
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/auth/profile/delete/`,
            {
                method: "DELETE",

                body: JSON.stringify({
                    current_password:
                        currentPassword,
                }),
            }
        );


    /*
     * DELETE endpoints may return an empty response.
     * Handle both JSON and empty responses safely.
     */

    let data = null;

    const contentType =
        response.headers.get("content-type");


    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        data =
            await response.json();
    }


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// =========================================================
// BOOKINGS
// =========================================================


// ---------------------------------------------------------
// GET USER BOOKINGS
// ---------------------------------------------------------

export async function getBookings() {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/bookings/`,
            {
                method: "GET",
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}


// ---------------------------------------------------------
// CANCEL BOOKING
// ---------------------------------------------------------

export async function cancelBooking(
    id
) {

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/bookings/${id}/cancel/`,
            {
                method: "PATCH",
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw {
            status: response.status,
            data: data,
        };
    }


    return data;
}

