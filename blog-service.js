const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        (posts.length > 0) ? resolve(posts) : reject("no results returned");
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        (posts.length > 0) ? resolve(posts.filter(post => post.published)) : reject("no results returned");
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        (categories.length > 0) ? resolve(categories) : reject("no results returned");
    });
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.id = posts.length + 1; // Assign a new ID based on the current length
        posts.push(postData); // Add the new post

        fs.writeFile('./data/posts.json', JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        // Ensure category is a number if the posts' category is stored as a number
        const categoryNumber = parseInt(category, 10);

        const filteredPosts = posts.filter(post => post.category === categoryNumber);

        if (filteredPosts.length === 0) {
            reject("no results returned");
        } else {
            resolve(filteredPosts);
        }
    });
};


module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
        (filteredPosts.length > 0) ? resolve(filteredPosts) : reject("no results returned");
    });
}

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        const foundPost = posts.find(post => post.id === parseInt(id)); // Ensure id is an integer
        (foundPost) ? resolve(foundPost) : reject("no result returned");
    });
}
