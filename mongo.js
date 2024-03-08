const mongoose = require('mongoose')
const config = require('./utils/config')
const url = process.env.TEST_MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
    title: 'another test title',
    author: 'another test author',
    url: 'thisisatestblog.org',
    likes: 25
})

blog.save().then(() => {
    console.log('blog saved!')
    mongoose.connection.close()
})

