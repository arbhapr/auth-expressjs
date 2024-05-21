const User = require('./models/users');
const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://127.0.0.1/auth_demo')
    .then((result) => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.log(err)
    });

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'normally',
    resave: false,
    saveUninitialized: false
}))

const auth = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next()
}

app.get('/', auth, (req, res) => {
    res.send('Homepage');
})

app.get('/admin', auth, (req, res) => {
    res.render('admin');
})

app.get('/profile/settings', auth, (req, res) => {
    res.send('Profile Settings: ' + req.session.user_id)
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const user = new User({ username, password })
    await user.save()
    req.session.user_id = user._id
    res.redirect('/')
});

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    // const user = await User.findOne({ username })
    const user = await User.findByCredentials(username, password)
    if (user) {
        req.session.user_id = user._id
        res.redirect('/admin')
    } else {
        res.redirect('/login')
    }
});

app.post('/logout', auth, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    })
})

app.listen(3000, () => {
    console.log('App listening on http://localhost:3000')
})