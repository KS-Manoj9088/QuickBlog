import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { setToken } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        toast.success("Login successful!");
        navigate('/admin');
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch(error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='w-full max-w-sm p-6 max-md:m-6 border border-primary/30
      shadow-xl shadow-primary/15 rounded-lg'>
        <div className='flex flex-col items-center justify-center'>
            <div className='w-full py-6 text-center'>
                <h1 className='text-3xl font-bold'><span className='text-primary'>Admin</span> Login</h1>
                <p className='font-light'>Enter your credentials to access
                     the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
                    <div className='flex flex-col'>
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            placeholder='Your Email Id' 
                            className='border-b-2 border-gray-300 p-2 outline-none mb-6' 
                            onChange={(event) => setEmail(event.target.value)} 
                            value={email}
                            disabled={isLoading}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            placeholder='Your Password' 
                            className='border-b-2 border-gray-300 p-2 outline-none mb-6'
                            onChange={(event) => setPassword(event.target.value)} 
                            value={password}
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type='submit' 
                        disabled={isLoading}
                        className='w-full py-3 font-medium bg-primary text-white rounded cursor-pointer
                        hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Login
