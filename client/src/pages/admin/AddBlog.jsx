import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill' 
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {parse} from 'marked';

const AddBlog = () => {
  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);
  const {axios, token} = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      navigate('/admin');
    }
  }, [token, navigate]);

  const onSumbitHandler = async(event) => {
    try {
      event.preventDefault();
      
      if (!token) {
        toast.error("Please login first");
        navigate('/admin');
        return;
      }

      if (!image) {
        toast.error("Please upload a thumbnail image");
        return;
      }

      if (!title || !subTitle || !category) {
        toast.error("Please fill in all required fields");
        return;
      }

      const description = quillRef.current.root.innerHTML;
      if (!description || description === '<p><br></p>') {
        toast.error("Please add blog description");
        return;
      }

      setIsAdding(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('subTitle', subTitle);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('isPublished', isPublished);
      formData.append('image', image);

      const {data} = await axios.post(`/api/blog/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if(data.success) {
        toast.success(data.message);
        // Reset form
        setImage(false);
        setTitle('');
        setSubTitle('');
        quillRef.current.root.innerHTML = '';
        setCategory('Startup');
        setIsPublished(false);
      } else {
        toast.error(data.message);
      }
    } catch(error) {
      console.error("Error adding blog:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate('/admin');
      } else {
        toast.error(error.response?.data?.message || "Error adding blog");
      }
    } finally {
      setIsAdding(false);
    }
  }

  const generateContent = async()=>{
    if(!title) return toast.error('Please Enter a Title');
    try {
      setLoading(true);
      const {data} = await axios.post('/api/blog/generate',{prompt : title});
      if(data.success){
        quillRef.current.root.innerHTML = parse(data.content);
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    if(!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {theme: 'snow'})
    }
  }, [])

  return (
    <form className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll' onSubmit={onSumbitHandler}>
      <div className='bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded'>
        <p>
          Upload thumbnail
        </p>

        <label htmlFor="image">
          <img src={!image ? assets.upload_area : URL.createObjectURL(image)}
           alt="" className='mt-2 h-16 rounded cursor-pointer'/>
          <input 
            type="file" 
            id='image' 
            hidden 
            required 
            accept="image/*"
            onChange={(event) => setImage(event.target.files[0])}
          />
        </label>

        <p className='mt-4'>Blog Title</p>
        <input 
          type="text" 
          placeholder='Type Here' 
          required 
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' 
          onChange={(event) => setTitle(event.target.value)} 
          value={title}
        />

        <p className='mt-4'>Sub Title</p>
        <input 
          type="text" 
          placeholder='Type Here' 
          required 
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' 
          onChange={(event) => setSubTitle(event.target.value)} 
          value={subTitle}
        />

        <p className='mt-4'>Blog Description</p>
        <div className='max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative'>
          <div ref={editorRef}></div>
          {loading && (
            <div className='absolute inset-0 bg-white/50 flex items-center justify-center z-10'>
              <div className='w-8 h-8 rounded-full border-4 border-t-primary border-gray-200 animate-spin'></div>
            </div>
          )}
          <button 
            type='button' 
            disabled={loading}
            className='absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={generateContent}
          >
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>

        <p className='mt-4'>Blog Category</p>
        <select 
          name="category" 
          className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded' 
          onChange={(event) => setCategory(event.target.value)} 
          value={category}
          required
        >
          {blogCategories.map((item, index) => (
            <option value={item} key={index}>{item}</option>
          ))}
        </select>
        
        <div className='flex gap-2 mt-4'>
          <p>Publish Now</p>
          <input 
            type="checkbox" 
            checked={isPublished} 
            className='scale-125 cursor-pointer' 
            onChange={(event) => setIsPublished(event.target.checked)}
          />
        </div>

        <button 
          type='submit' 
          disabled={isAdding}
          className='mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm disabled:opacity-50'
        >
          {isAdding ? 'Adding...' : 'Add Blog'}
        </button>
      </div>
    </form>
  )
}

export default AddBlog
