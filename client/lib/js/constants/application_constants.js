export const FLASK_BASE_URL = process.env.FLASK_BASE_URL;
export const TORNADO_BASE_URL = process.env.TORNADO_BASE_URL;

export const API_PATH = `${FLASK_BASE_URL}/api/`;

export default {
    API_PATH,
    FLASK_BASE_URL,
    TORNADO_BASE_URL
};
