const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const dbUri = process.env.DB_URI;

const webPush = require('web-push')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const path = require('node:path')
const cors = require('cors')
const {
      json
} = require('express/lib/response')
const {
      readFile,
      writeFile
} = require('fs')
const app = express()
const publicVapidKey = process.env.PUBLIC_VAPID_KEY
const privateVapidKey = process.env.PRIVATE_VAPID_KEY
const PORT = process.env.PORT || 5500

app.use(
      cors({
            origin: "*",
      })
);

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'public'))

let posts = [{
      author: 'Lil\' Wuth',
      title: 'Welcome to my new blog!',
      body: `Hello guys, and welcome to my new blog!
In this blog you will find some great content, and if you want to give me suggestions, go to https://Leiloukou.com/blog/contribute/`
}];

const transporter = nodemailer.createTransport({
      pool: true,
      port: 465,
      host: 'smtp.gmail.com',
      secure: true,
      auth: {
            user: 'jacobaleger12@gmail.com',
            pass: process.env.GMAIL_PASSWORD
      },
      tls: {
            rejectUnauthorized: false,
      }
})

webPush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey)

app.use(express.static(path.resolve(__dirname, './public')))

app.get('/', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, './public/index.html'))
})

app.get('/home', (req, res) => {
      res.status(200).redirect('/')
})

app.get('/sitemap.xml', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'public/sitemap.xml'))
})
app.get('/robots.txt', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, './robots.txt'))
})

app.get('/about/', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, './public/about.html'))
})

app.get('/blog', (req, res) => {
      res.status(200).render('blog', {
            posts
      })
})

app.get('/admin', (req, res) => {
      res.status(401).sendFile(path.join(__dirname, './public/admin-login.html'))
})

app.get('/submit', (req, res) => {
      res.status(404).redirect('/')
})

app.use(express.urlencoded({
      extended: false
}))

app.post('/admin/', (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            res.status(200).render('admin', {
                  get: true
            });
      } else {
            res.status(403).redirect('/admin')
      }
})

app.post('/admin/post', async (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            await posts.push({
                  author: req.body.author,
                  title: req.body.title,
                  body: req.body.body,
            });

            res.status(200).render("admin", {
                  get: false
            });
      } else {
            res.status(403).redirect("/admin");
      }
})

app.post('/admin/delete', async (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            let deletePostArray = [...posts]
            const index = deletePostArray.findIndex(post => post.title === req.body.title)
            if (index !== -1) {
                  deletePostArray.splice(index, 1)
                  posts = deletePostArray
            }
            res.status(200).render("admin", {
                  get: false
            });
      } else {
            res.status(403).redirect("/admin");
      }
})

app.post('/admin/edit', async (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            posts.forEach(post => {
                  if (post.title === req.body.title) {
                        if (req.body.new__title) {
                              post.title = req.body.new__title
                        }
                        if (req.body.body) {
                              post.body = req.body.body
                        }
                        if (req.body.author) {
                              post.body.author = req.body.author
                        }
                  }
            })
            res.status(200).render("admin", {
                  get: false
            });
      } else {
            res.status(403).redirect("/admin");
      }
})

app.post('/submit/contact', (req, res) => {
      const {
            name,
            email,
            subject,
            body
      } = req.body
      if (/</.test(name)) {
            res.status(451).send('<pre><code>You tried to perform a malicious attack, but i stopped you, you criminal!</code></pre>')
      } else {
            if (name && email && subject) {
                  res.status(201).send(`<h1>Thank you, ${name}, we will get to you as soon as we can.</h1>`)
                  const mailData = {
                        from: 'jacobalerger12@gmail.com',
                        to: 'jacobaleger12@gmail.com',
                        replyTo: email,
                        subject: `New email from leiloukou.com: ${subject}`,
                        html: `
<h1>${subject}</h1>
<h2>From: ${name}, at ${email}.</h2>
<p>${body}</p>
                  `
                  }

                  console.log(mailData)

                  transporter.sendMail(mailData, (err, info) => {
                        if (err) return console.log('Form submission error: \n', err)

                        console.log(info)
                  })
            } else {
                  res.status(401).send(`<pre><code>Form submission error... status code: 401</code></pre>`)
            }
      }
})

app.post('/subscribe', (req, res) => {
      const subscription = req.body

      res.status(201).json({})

      const payload = JSON.stringify({
            title: 'Push test...'
      })

      webPush.sendNotification(subscription, payload).catch(err => console.error(err))
})

app.all('*', (req, res) => {
      res.status(404).sendFile(path.resolve(__dirname, './public/404.html'))
})

mongoose
	.connect(dbUri)
	.then(app.listen(PORT))
	.catch((err) => console.log("error: ", err));