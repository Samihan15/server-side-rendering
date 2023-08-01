const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const path = require('path');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'ejs');

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
    const { username, password } = req.body;

        if(!username || !password) {
            res.render('login', { error: 'Please enter your username and password' });
            return;
        }

    fs.readFile(path.join(__dirname, 'data','users.json'), (err, data) => {
        if(err){
            console.log(err);
            res.render('login', { error: 'Something went wrong. Please try again.' });
            return;
        }

        if(!data) {
            res.render('login', { error: 'Something went wrong. Please try again.' });
            return;
        }

        const users = JSON.parse(data);

        const user = users.find(user => user.username === username && user.password === password);
        if(!user) {
            res.render('login', { error: 'Invalid username or password' });
            return;
        }

        if(user) {
            req.session.username = username;
            res.redirect('/');
        }
    });
});


app.post('/signup', (req, res) => {
    const { username, password } = req.body;

        if(!username || !password) {
            res.render('signup', { error: 'Please enter your username and password' });
            return;
        }

    fs.readFile(path.join(__dirname, 'data','users.json'), (err, data) => {
        if(err){
            console.log(err);
            res.render('signup', { error: 'Something went wrong. Please try again.' });
            return;
        }

        if(!data) {
            res.render('signup', { error: 'Something went wrong. Please try again.' });
            return;
        }

        const users = JSON.parse(data);

        const user = users.find(user => user.username === username && user.password === password);
        if(!user) {
            fs.writeFile(path.join(__dirname, 'data','users.json'), JSON.stringify([...users, { username, password }]), (err) => {
                if(err) {
                    console.log(err);
                    res.render('signup', { error: 'Something went wrong. Please try again.' });
                    return;
                }

                req.session.username = username;
                res.redirect('/');
            }
            );
            return;
        }

        if(user) {
            res.render('signup', { error: 'User already exists' });
            res.redirect('/login');
            return;
        }
    });
});


app.get('/login',(req, res) => {
    res.render('login', { error: '' });
});

app.get('/signup',(req, res) => {
    res.render('signup', { error: '' });
});


app.get('/', (req, res) => {
    if(!req.session.username) {
        res.redirect('/login');
        return;
    }

    fs.readFile(path.join(__dirname, 'data','data.json'), (err, data) => {
        if(err){
            console.log(err);
            res.render('home', {username: req.session.username,data:null });
            return;
        }

        const dataObj = JSON.parse(data);
        res.render('home', {username: req.session.username,data:dataObj });
    });
});

app.get('/home', (req, res) => {
    if(!req.session.username) {
        res.redirect("/login");
        return;
    }
    res.redirect("/");
});

app.get('/about', (req, res) => {
    if(!req.session.username) {
        res.redirect("/login");
        return;
    }
    res.render('about', {username: req.session.username });
});

app.get('/contact', (req, res) => {
    if(!req.session.username) {
        res.redirect("/login");
        return;
    }
    res.render('contact', {username: req.session.username });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});