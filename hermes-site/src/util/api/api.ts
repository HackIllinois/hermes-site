import axios from "axios"
import { BASE_BACKEND_URL } from "../../config";

const api = axios.create({
    baseURL: BASE_BACKEND_URL,
    withCredentials: true,
});

export default api;