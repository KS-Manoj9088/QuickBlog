import React, { useEffect, useState } from 'react'
import CommentTableItem from '../../components/admin/CommentTableItem'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Comments = () => {
  const [comments, setComments] = useState([])
  const [filter, setFilter] = useState('Not Approved');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {axios} = useAppContext();
  
  const fetchComments = async() => {
    try {
      setIsLoading(true);
      setError(null);
      const {data} = await axios.get('/api/admin/comments');
      if (data.success) {
        setComments(data.comments);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch(error) {
      console.error("Error fetching comments:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch comments. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  const filteredComments = comments.filter(comment => {
    if (filter === 'Approved') {
      return comment.isApproved === true;
    }
    return comment.isApproved === false;
  });

  return (
    <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-blue-50/50'>
      <div className='flex justify-between items-center max-w-3xl'>
        <h1 className="text-2xl font-semibold text-gray-700">Comments</h1>
        <div className='flex gap-4'>
          <button 
            className={`shadow-custom-sm border rounded-full px-4 py-1 cursor-pointer text-xs
             ${filter === 'Approved' ? 'text-primary bg-primary/10' : 'text-grey-700'}`} 
            onClick={() => setFilter('Approved')}
          >
            Approved
          </button>

          <button 
            className={`shadow-custom-sm border rounded-full px-4 py-1 cursor-pointer text-xs
             ${filter === 'Not Approved' ? 'text-primary bg-primary/10' : 'text-grey-700'}`} 
            onClick={() => setFilter('Not Approved')}
          >
            Not Approved
          </button>
        </div>
      </div>

      <div className='relative h-4/5 max-w-3xl overflow-x-auto mt-4 bg-white shadow-rounded-lg scrollbar-hide'>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-32">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchComments}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No {filter.toLowerCase()} comments found</p>
          </div>
        ) : (
          <table className='w-full text-sm text-gray-500'>
            <thead className='text-xs text-gray-700 text-left uppercase bg-gray-50'> 
              <tr>
                <th scope='col' className='px-6 py-3'>Blog Title & Comment</th>
                <th scope='col' className='px-6 py-3 max-sm:hidden'>Date</th>
                <th scope='col' className='px-6 py-3'>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredComments.map((comment, index) => (
                <CommentTableItem 
                  key={comment._id}
                  comment={comment} 
                  index={index + 1} 
                  fetchComments={fetchComments}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Comments
