import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Point to your backend
    withCredentials: true // THIS IS CRUCIAL: It tells Axios to send the JWT cookie
});

export default instance;