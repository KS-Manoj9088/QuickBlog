import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState("");

    const fetchBlogs = async() => {
        try {
            const {data} = await axios.get('/api/blog/all');
            data.success ? setBlogs(data.blogs) : toast.error(data.message);
        } catch(error) {
            toast.error(error.message);
        }
    }

    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            setToken(token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setToken(null);
        }
    };

    const logout = () => {
        setAuthToken(null);
        navigate('/admin');
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if(storedToken) {
            setAuthToken(storedToken);
        }
        fetchBlogs();
    }, []);

    // Add axios interceptor for handling 401 errors
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const value = {
        axios,
        navigate,
        token,
        setToken: setAuthToken,
        blogs,
        setBlogs,
        input,
        setInput,
        logout
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext);
}