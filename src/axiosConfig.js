import axios from "axios";

const instance = axios.create({
  baseURL: "https://task-manager-backend-production-00e4.up.railway.app/api", // Point to your backend
  withCredentials: true, // THIS IS CRUCIAL: It tells Axios to send the JWT cookie
});

export default instance;
