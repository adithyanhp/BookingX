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

        const data = await response.json();

        // Save new access token
        localStorage.setItem(
            "access_token",
            data.access
        );

        return data.access;

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
            "Content-Type": "application/json",
        };

        // Only add Authorization when a token exists
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


// =========================================================
// GET SINGLE HOTEL
// =========================================================

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


// =========================================================
// FEATURED HOTELS
// =========================================================

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


// =========================================================
// HOTEL SEARCH
// =========================================================

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

export async function getRoomsByHotel(
    hotelId
) {

    // -----------------------------------------------------
    // Prevent an invalid request such as:
    //
    // /rooms/?hotel=undefined
    // -----------------------------------------------------

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


// =========================================================
// GET SINGLE ROOM
// =========================================================

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


// =========================================================
// LOGIN
// =========================================================

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
// BOOKINGS
// =========================================================

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


// =========================================================
// CANCEL BOOKING
// =========================================================

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