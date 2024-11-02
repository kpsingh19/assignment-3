/*********************************************************************************
* BTI325 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _______KARAN PREET SINGH_______________ Student ID: _____157055229_________ Date: _______2024-11-01_________
*
* Online (Vercel) Link: ________________________________________________________
*
********************************************************************************/
const express = require('express');
const blogData = require("./blog-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dhv6l2gho', 
    api_key: '595369625496874',      
    api_secret: '0JxEOhVspy4ix_vVzkBoSBij2K4', // replace with your API Secret
    secure: true
});

// Multer configuration for file uploads
const upload = multer(); // No disk storage since we are using Cloudinary

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.get('/', (req, res) => {
    res.redirect("/about");
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get('/blog', (req, res) => {
    blogData.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch(err => {
        res.json({ message: err });
    });
});

// Updated /posts route to support filtering
app.get('/posts', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        // Filter by category
        blogData.getPostsByCategory(category)
            .then((filteredPosts) => {
                res.json(filteredPosts);
            })
            .catch(err => {
                console.error(err);
                res.status(404).json({ message: err });
            });
    } else if (minDate) {
        // Filter by minimum date
        blogData.getPostsByMinDate(minDate)
            .then((filteredPosts) => {
                res.json(filteredPosts);
            })
            .catch(err => {
                console.error(err);
                res.status(404).json({ message: err });
            });
    } else {
        // Return all posts
        blogData.getAllPosts()
            .then((data) => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                res.status(404).json({ message: err });
            });
    }
});

// Get categories
app.get('/categories', (req, res) => {
    blogData.getCategories().then((data) => {
        res.json(data);
    }).catch(err => {
        res.json({ message: err });
    });
});

// Route to add a new post
app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// Handle post submission
app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;

        // Add post to the data store
        blogData.addPost(req.body).then(() => {
            res.redirect("/posts"); // Redirect to the posts page
        }).catch(err => {
            res.status(500).json({ message: err });
        });
    }).catch(err => {
        console.error("Error uploading image:", err);
        res.status(500).send("Error uploading image");
    });
});

// New route to get a single post by ID
app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;

    blogData.getPostById(postId)
        .then((post) => {
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.json(post);
        })
        .catch(err => {
            console.error(err);
            res.status(404).json({ message: err });
        });
});

// 404 page
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Initialize blog data and start server
blogData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('Server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
});
