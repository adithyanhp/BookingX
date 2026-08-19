const API_BASE_URL = "http://127.0.0.1:8000/api";


// =========================================================
// HOTELS
// =========================================================

export async function getHotels() {
    const response = await fetch(
        `${API_BASE_URL}/hotels/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch hotels");
    }

    return response.json();
}


export async function getHotel(id) {
    const response = await fetch(
        `${API_BASE_URL}/hotels/${id}/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch hotel");
    }

    return response.json();
}


// =========================================================
// HOTEL SEARCH
// =========================================================

export async function searchHotels(params) {
    const query = new URLSearchParams();

    // Add only values that actually exist
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });

    const response = await fetch(
        `${API_BASE_URL}/hotels/search/?${query.toString()}`
    );

    const data = await response.json();

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

export async function getRoomsByHotel(hotelId) {
    const response = await fetch(
        `${API_BASE_URL}/rooms/?hotel=${hotelId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch hotel rooms");
    }

    return response.json();
}


export async function getRoom(id) {
    const response = await fetch(
        `${API_BASE_URL}/rooms/${id}/`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch room");
    }

    return response.json();
}


// =========================================================
// AUTHENTICATION
// =========================================================

export async function registerUser(userData) {
    const response = await fetch(
        `${API_BASE_URL}/auth/register/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(userData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data: data,
        };
    }

    return data;
}


export async function loginUser(credentials) {
    const response = await fetch(
        `${API_BASE_URL}/auth/login/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(credentials),
        }
    );

    const data = await response.json();

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

export async function getBookings(token) {
    const response = await fetch(
        `${API_BASE_URL}/bookings/`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data: data,
        };
    }

    return data;
}


export async function cancelBooking(id, token) {
    const response = await fetch(
        `${API_BASE_URL}/bookings/${id}/cancel/`,
        {
            method: "PATCH",

            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data: data,
        };
    }

    return data;
}

