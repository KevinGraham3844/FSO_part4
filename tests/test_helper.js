const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'test title',
        author: 'test author',
        url: 'thisisatestblog.com',
        likes: 30,
        user: '65eb148e77d15d4b41bd0ba8'
    },
    {
        title: 'another test title',
        author: 'another test author',
        url: 'thisisatestblog.org',
        likes: 25
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, usersInDb
}

