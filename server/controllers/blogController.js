import main from '../configs/gemini.js';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

export const addBlog = async (req, res) => {
    try {
        const {title, subTitle, description, category, isPublished} = req.body;
        const imageFile = req.file;

        console.log("Request body:", req.body);
        console.log("Uploaded file:", imageFile);

        if (!title || !subTitle || !description || !category || !imageFile) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                details: {
                    title: !title,
                    subTitle: !subTitle,
                    description: !description,
                    category: !category,
                    image: !imageFile
                }
            });
        }

        try {
            const fileBuffer = imageFile.buffer;

            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            });

            const optimisedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: "1280" }
                ]
            });

            const blog = await Blog.create({
                title,
                subTitle,
                description,
                category,
                image: optimisedImageUrl,
                isPublished: isPublished === 'true' || isPublished === true
            });

            res.json({
                success: true,
                message: "Blog added successfully",
                blog
            });
        } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            return res.status(500).json({
                success: false,
                message: "Failed to upload image",
                error: uploadError.message
            });
        }
    } catch (error) {
        console.error("Blog Adding Error:", error);
        res.status(500).json({
            success: false,
            message: "Blog Adding Unsuccessful",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getAllBlogs = async(req, res)=>{
    try{
        const blogs = await Blog.find({isPublished: true});
        res.json({
            success : true,
            blogs
        })
    }
    catch(error){
        res.json({
            success:false,
            message : error.message
        })
    }
}

export const getBlogById = async(req, res) => {
    try {
        const {blogId} = req.params;
        
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.json({
            success: true,
            blog
        });
    } catch(error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog. Please try again later."
        });
    }
}

export const deleteBlogById = async(req, res)=>{
    try{
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);

        // Delete all comments associated with this Blog

        await Comment.deleteMany({blog : id});

        res.json({
            success:true,
            message : "Blog deleted Succesfully"
        })
    }
    catch(error){
        res.json({
            success:false,
            message : error.message
        })
    }
}

export const togglePublish = async(req, res)=>{
    try{
        const { id } = req.body;
        const blog = await Blog.findById(id);

        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({
            success : true,
            message : "Blog Status Updated."
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success : false,
            message : error.message
        })
    }
}

export const addComment = async(req, res) => {
    try {
        const {blog, name, content} = req.body;

        if (!blog || !name || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if blog exists
        const blogExists = await Blog.findById(blog);
        if (!blogExists) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const comment = await Comment.create({
            blog,
            name: name.trim(),
            content: content.trim()
        });

        res.json({
            success: true,
            message: "Comment added for review",
            comment
        });
    } catch(error) {
        console.error("Error adding comment:", error);
        res.status(500).json({
            success: false,
            message: "Error adding comment",
            error: error.message
        });
    }
}

export const getBlogComments = async(req, res) => {
    try {
        const {blogId} = req.body;

        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required"
            });
        }

        const comments = await Comment.find({
            blog: blogId,
            isApproved: true
        })
        .sort({createdAt: -1})
        .populate('blog', 'title');

        res.json({
            success: true,
            comments
        });
    } catch(error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching comments",
            error: error.message
        });
    }
}

export const generateContent = async(req, res) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const {prompt} = req.body;
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    message: "Prompt is required"
                });
            }

            const content = await main(prompt + 'Generate a blog content for this topic in Simple Text Format');
            return res.json({
                success: true,
                content
            });
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            // Check if it's a 503 error
            if (error.message?.includes('503') || error.message?.includes('overloaded')) {
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${retryDelay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
                    await sleep(retryDelay);
                    continue;
                }
            }

            // If we've exhausted retries or it's a different error
            return res.status(error.message?.includes('503') ? 503 : 500).json({
                success: false,
                message: error.message || "Failed to generate content. Please try again later."
            });
        }
    }
}



