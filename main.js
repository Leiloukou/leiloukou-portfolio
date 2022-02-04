const express = require('express')
const mongoose = require('mongoose')
const Post = require('./post.js')
require('dotenv').config()
const dbUri = process.env.DB_URI;
mongoose.connect(dbUri).catch((err) => console.log("error: ", err));
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

app.get('/about', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, './public/about.html'))
})

app.get('/hire', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, './public/hire.html'))
})

app.get('/contact', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '/public/contact.html'))
})

app.get('/privacy/', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '/public/privacy-policy.html'))
})

app.get('/blog', async (req, res) => {
      try {
            var posts = await Post.find({})

            res.status(200).render('blog', {
                  posts
            })
      } catch (err) {
            console.log(err);
      }
})

app.get('/blog/contact', (req, res) => {
      res.status(200).sendFile(path.join(__dirname, '/public/blog-contact.html'))
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

app.post('/admin', async (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD && req.body.from === 'admin') {
            try {
                  const post = await Post.create({
                        author: req.body.author,
                        title: req.body.title,
                        body: req.body.body,
                  })
                  res.status(201).render("admin", {
                        get: false
                  });
            } catch (err) {
                  res.status(500).send(err)
            }





      } else if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            res.status(200).render('admin', {
                  get: true
            });
      } else {
            res.status(403).redirect('/admin')
      }
})

app.post('/admin/delete', async (req, res) => {
      if (
            req.body.title === process.env.ADMIN_USERNAME &&
            req.body.password === process.env.ADMIN_PASSWORD
      ) {
            res.status(200).render("admin", {
                  get: false
            });
            try {
                  await Post.findByIdAndDelete(
                        req.body.name,
                        function (err, result) {
                              if (err) {
                                    console.log(err);
                              } else {}
                        }
                  ).clone();
            } catch (err) {
                  console.log(err);
            }
      } else {
            res.status(403).redirect("/admin");
      }
})

app.put('/admin/', async (req, res) => {
      if (req.body.name === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
            try {
                  await Post.findByIdAndUpdate(
                        req.body.put_id, {
                              author: req.body.author,
                              title: req.body.title,
                              body: req.body.body
                        }
                  ).clone();
            } catch (err) {
                  console.log(err);
            }
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

app.listen(PORT);