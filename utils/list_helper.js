const _ = require('lodash')

const dummy = (blogs) => {
    return blogs.length === 0
        ? 1
        : 1
}

const totalLikes = (blogs) => {
    return blogs.length === undefined
        ? blogs.likes
        : blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === undefined) {
        return blogs
    }
    const favorite = blogs.reduce((currentFav, blog) => {
        return currentFav.likes > blog.likes ? currentFav : blog
    }, {})
    return favorite
}

const mostBlogs = (blogs) => {
    if (blogs.length === undefined) {
        return {
            author: blogs.author,
            blogs: 1
        }
    } else if (blogs.length < 1) {
        return 0
    }
    const authors = _.map(blogs, 'author')
    const totalBlogs = _.countBy(authors)
    const topAuthor = Object.entries(totalBlogs).sort((a, b) => {
        return b[1] - a[1]
    })[0]
    return {
        author: topAuthor[0],
        blogs: topAuthor[1]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length < 1) {
        return 0
    } else if (blogs.length === undefined) {
        return {
            author: blogs.author,
            likes: blogs.likes
        }
    }
    // citing stackoverflow for using lowdash to sum values of same key https://stackoverflow.com/questions/38774763/using-lodash-to-sum-values-by-key
    const remappedBlogs = 
        _(blogs)
            .groupBy('author')
            .map((blogEntries, key) => ({
                "author": key,
                "likes": _.sumBy(blogEntries, 'likes')
            }))
            .value()
    const sortedBlogs = _.sortBy(remappedBlogs, [function(o) { return o.author }])
    return sortedBlogs[0]
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}