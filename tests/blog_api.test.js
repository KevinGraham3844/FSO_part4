
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

const helper = require('./test_helper')

const Blog = require('../models/blog')


describe('when there is an initialized database with blogs', () => {
    let token = ''
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)

        const response = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
        token = response.body.token

    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('the objects stored in the database contain an id property', async () => {
        const response = await api.get('/api/blogs')
        
        assert.strictEqual(true, Object.hasOwn(response.body[0], 'id'))
    })

    describe('creating a new blog', () => {

        test('a valid blog can be added', async () => {

            const newBlog = {
                title: 'this is being added for test',
                author: 'testwriter',
                url: 'getblogged.com',
                likes: 66
            }
        
            const response = await api.post('/api/login', { username: 'root', password: 'sekret' })
            console.log('trying to log in yields these results', response)

            await api
                .post('/api/blogs')
                .set({ Authorization: `Bearer ${token}` })
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        
            const titles = blogsAtEnd.map(b => b.title)
            assert(titles.includes('this is being added for test'))
        })
    
        test('a blog created with missing likes property contains likes: 0', async () => {
            const newBlog = {
                title: 'this is a test with no likes property',
                author: 'testwriter',
                url: 'getblogged.com'
            }
        
            await api
                .post('/api/blogs')
                .set({ Authorization: `Bearer ${token}` })
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            const blogsAtEnd = await helper.blogsInDb()
            const newLikes = blogsAtEnd.map(b => b.likes)
            assert.strictEqual(0, newLikes[newLikes.length - 1])
        })

        test('a blog missing a title returns 400 bad request and is not added', async () => {
            const newBlog = {
                author: 'no title above',
                url: 'getblogged.com',
                likes: 55
            }
        
            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
            
            const blogsAtEnd = await helper.blogsInDb()
        
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        
        test('a blog missing an author will return 400 bad request', async () => {
            const newBlog = {
                title: 'no author below',
                url: 'getblogged.com',
                likes: 55
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })
    
    describe('making changes to a blog', () => {
        test('delete a blog based on its id', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set({ Authorization: `Bearer ${token}` })
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

            const titles = blogsAtEnd.map(b => b.title)
            assert(!titles.includes(blogToDelete.title))
        })

        test('changing the likes on a blog', async () => {
            const blogsAtStart = await helper.blogsInDb()
            console.log('these are the blogs at the start', blogsAtStart)
            const blogToChange = blogsAtStart[0]
            console.log('this is the blog that we change', blogToChange)
            const updatedBlog = {
                title: blogToChange.title,
                author: blogToChange.author,
                url: blogToChange.url,
                likes: 100
            }

            await api
                .put(`/api/blogs/${blogToChange.id}`)
                .send(updatedBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAfterChange = await helper.blogsInDb()
            console.log('this is the blog after update', blogsAfterChange)
            assert.strictEqual(updatedBlog.likes, blogsAfterChange[0].likes)
        })

    
    })
})

after(async () => {
    await mongoose.connection.close()
})