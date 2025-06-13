import 'dotenv/config'
import jwt from 'jsonwebtoken';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

const adminLogin = async(req, res) => {
    try {
        const {email, password} = req.body;
        if(email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const token = jwt.sign({email}, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            success: true,
            token
        })
    } catch(error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export default adminLogin;

export const getAllBlogsAdmin = async(req, res) => {
    try {
        const blogs = await Blog.find({}).sort({createdAt: -1});
        res.json({
            success: true,
            blogs
        })
    } catch(error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getAllComments = async(req, res) => {
    try {
        const comments = await Comment.find({})
            .populate({
                path: 'blog',
                select: 'title',
                options: { lean: true } // Use lean for better performance
            })
            .sort({createdAt: -1});

        // Filter out comments where blog reference is missing
        const validComments = comments.filter(comment => comment.blog !== null);

        res.json({
            success: true,
            comments: validComments
        })
    } catch(error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch comments. Please try again later."
        })
    }
}

export const getDashboard = async(req, res) => {
    try {
        const recentBlogs = await Blog.find({}).sort({createdAt: -1}).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments();
        const drafts = await Blog.countDocuments({isPublished: false});

        const dashboardData = {
            blogs,
            recentBlogs,
            comments,
            drafts
        }

        res.json({
            success: true,
            dashboardData
        })
    } catch(error) {
        console.error("Error fetching dashboard:", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteCommentById = async(req, res) => {
    try {
        const {id} = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Comment ID is required"
            });
        }

        const comment = await Comment.findByIdAndDelete(id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        res.json({
            success: true,
            message: "Comment deleted successfully"
        })
    } catch(error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const approveCommentById = async(req, res) => {
    try {
        const {id} = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Comment ID is required"
            });
        }

        const comment = await Comment.findByIdAndUpdate(
            id,
            {isApproved: true},
            {new: true}
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        res.json({
            success: true,
            message: "Comment approved successfully"
        })
    } catch(error) {
        console.error("Error approving comment:", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}