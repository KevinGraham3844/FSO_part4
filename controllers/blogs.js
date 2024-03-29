const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    const body = request.body
    console.log('here is the token passed into the post function', request.token)
    /*
    const decodedToken = jwt.verify(request.token,
    process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }*/
    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })
    console.log(blog)
    const savedBlog = await blog.save()
    console.log("this is the id of the saved blog", savedBlog._id)
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    /*
    const decodedToken = jwt.verify(request.token,
    process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    */
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (blog.user._id.toString() === user.id.toString()) {
        await Blog.findByIdAndDelete(request.params.id)
        console.log('blog deleted!')
        response.status(204).end()
    } else {
        return response.status(401).json({ error: 'user not authorized to delete this blog' })
    } 

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter