const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js"); // Import books database
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User Registration
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "User already exists" });
    }

    users[username] = { password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get all books (Promise-based)
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/internal-books');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN (Promise-based)
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/internal-books/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// Get book details based on Author (Async-Await)
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author.toLowerCase();
        const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author);
        return res.status(200).json(filteredBooks.length > 0 ? filteredBooks : { message: "No books found for this author" });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on Title (Async-Await)
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();
        const response = await axios.get(`http://localhost:5000/internal-books/title/${title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
