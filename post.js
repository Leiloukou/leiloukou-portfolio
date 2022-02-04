const mongoose = require('mongoose')

const PostsSchema = new mongoose.Schema({
	author: String,
	title: String,
	body: String
});

module.exports = mongoose.model('Post', PostsSchema)