const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {}; // Store users in-memory

// Function to check if the username is valid
const isValid = (username) => {
    return users.hasOwnProperty(username);
};

// Function to check if username and password match
const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    // Save session details
    req.session.user = { username, accessToken };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.session.user?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review (Task 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.user?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found to delete" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
