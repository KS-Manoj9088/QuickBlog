import React from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CommentTableItem = ({comment, fetchComments}) => {
    const {blog, createdAt, _id} = comment;
    const BlogDate = new Date(createdAt);
    const {axios} = useAppContext();

    const approveComment = async() => {
        try {
            const {data} = await axios.post('/api/admin/approve-comment', {id: _id});
            if(data.success) {
                toast.success(data.message);
                await fetchComments();
            } else {
                toast.error(data.message);
            }
        } catch(error) {
            console.error("Error approving comment:", error);
            toast.error(error.response?.data?.message || "Error approving comment");
        }
    }

    const deleteComment = async() => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this comment?');
            if(!confirm) return;

            const {data} = await axios.post('/api/admin/delete-comment', {id: _id});
            if(data.success) {
                toast.success(data.message);
                await fetchComments();
            } else {
                toast.error(data.message);
            }
        } catch(error) {
            console.error("Error deleting comment:", error);
            toast.error(error.response?.data?.message || "Error deleting comment");
        }
    }

    return (
        <tr className='border-y border-gray-300 hover:bg-gray-50'>
            <td className='px-6 py-4'>
                <div className="space-y-2">
                    <div>
                        <b className='font-medium text-gray-600'>Blog:</b> {blog.title}
                    </div>
                    <div>
                        <b className='font-medium text-gray-600'>Name:</b> {comment.name}
                    </div>
                    <div>
                        <b className='font-medium text-gray-600'>Comment:</b> {comment.content}
                    </div>
                </div>
            </td>

            <td className='px-6 py-4 max-sm:hidden'>
                {BlogDate.toLocaleDateString()}
            </td>

            <td className='px-6 py-4'>
                <div className='inline-flex items-center gap-4'>
                    {!comment.isApproved ? (
                        <button 
                            onClick={approveComment}
                            className="p-1 hover:bg-green-50 rounded-full transition-colors"
                            title="Approve comment"
                        >
                            <img 
                                src={assets.tick_icon} 
                                alt="approve" 
                                className='w-5 hover:scale-110 transition-all cursor-pointer'
                            />
                        </button>
                    ) : (
                        <p className='text-xs border border-green-600 bg-green-100 text-green-600 rounded-full px-3 py-1'>
                            Approved
                        </p>
                    )}

                    <button 
                        onClick={deleteComment}
                        className="p-1 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete comment"
                    >
                        <img 
                            src={assets.bin_icon} 
                            alt="delete" 
                            className='w-5 hover:scale-110 transition-all cursor-pointer'
                        />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default CommentTableItem
