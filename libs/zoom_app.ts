import axios from "axios";

export const zoomApp = {
    host: process.env.ZM_HOST || 'https://zoom.us',
    clientId: process.env.ZM_CLIENT_ID || '',
    clientSecret: process.env.ZM_CLIENT_SECRET || '',
    redirectUrl: process.env.ZM_REDIRECT_URL || '',
    sessionSecret: process.env.SESSION_SECRET,
};


// Get Zoom API URL from Zoom Host value
const host = new URL(zoomApp.host);
host.hostname = `api.${host.hostname}`;

const baseURL = host.href;

/**
 * Generic function for making requests to the Zoom API
 * @param {string} method - Request method
 * @param {string | URL} endpoint - Zoom API Endpoint
 * @param {string} token - Access Token
 * @param {object} [data=null] - Request data
 */
export function apiRequest(method: string, endpoint: string, token: string, data = null) {
    return axios({
        data,
        method,
        baseURL,
        url: `/v2${endpoint}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then(({ data }) => Promise.resolve(data));
}
