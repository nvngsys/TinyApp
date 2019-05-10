var express = require("express");
var cookieSession = require('cookie-session');
var app = express();
var PORT = 8080; // default port 8080

//var cookieParser = require('cookie-parser')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(cookieSession({
    name: 'session',
    keys: ['123'],
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

function generateRandomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 6;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function checkUserLoggedIn(req, res) {
    let isUserLogIn = undefined;
    if (req.cookies) {
        isUserLogIn = req.session.user_id;
    }
    return isUserLogIn;
}

function checkForExistingEmailAddress(emailIn) {
    let emailExists = false;
    for (var key in users) {
        if (users[key]['email'] === emailIn) {
            emailExists = true;
            console.log("This email exists already: " + users[key]['email']);
            break;
        }
    }
    return emailExists;
}

function urlsForUser(id) {
    let urlSubObj = {};
    for (var key in urlDatabase) {
        if (urlDatabase[key]['userID'] === id) {
            urlSubObj[key] = urlDatabase[key];
        }
    }
    return urlSubObj;
}

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
    j4BoGr: { longURL: "https://www.google.ca", userID: "aJ50lW" }
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

/** GET Statements */
app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
    let templateVars = { greeting: 'Hello World!' };
    res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
    let user_id = req.session.user_id;
    let userURL = urlsForUser(user_id);
    let templateVars = {
        urls: userURL,
        user: users[user_id]
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    if (user_id) {
        let templateVars = {
            user: users[user_id]
        };
        res.render("urls_new", templateVars);
    } else {
        res.redirect('/login');
    }
});

app.get("/urls/:shortURL", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    let templateVars = {
        user: users[user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]['longURL']
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    console.log('get /u processing');
    const shortURL = req.params.shortURL;
    console.log(shortURL);
    for (var key in urlDatabase) {
        if (key === shortURL) {
            longURL = urlDatabase[key]['longURL'];
            console.log('Long url to return ' + longURL);
        }
    }
    res.redirect(longURL);
});

app.get("/register", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    let templateVars = {
        user_id: user_id,
        user: users[user_id]
    }
    res.render("register", templateVars);
});

app.get("/login", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    let templateVars = {
        user_id: user_id,
        user: users[user_id]
    }
    res.render("login", templateVars);
});

/**    ----  POST Functions -----  */

app.post("/urls/:id", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    if (user_id) {
        const shortID = req.params.id;
        for (var key in urlDatabase) {
            if (key === shortID) {
                if (urlDatabase[key]['userID'] === user_id) {
                    let newKey = req.body.newURL;
                    urlDatabase[newKey] = urlDatabase[key];
                    delete urlDatabase[key];
                }
            }
        }
    }
    res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    if (user_id) {
        const shortID = req.params.shortURL;
        for (var key in urlDatabase) {
            if (key === shortID) {
                if (urlDatabase[key]['userID'] === user_id) {
                    delete urlDatabase[key];
                }
            }
        }
        res.redirect('/urls');
    }
});

app.post("/urls", (req, res) => {
    let randomString = generateRandomString();
    let user_id = checkUserLoggedIn(req, res);
    urlDatabase[randomString] = { longURL: req.body['longURL'], userID: user_id };
    let templateVars = { shortURL: randomString, longURL: urlDatabase[randomString] };
    res.redirect("/urls/" + randomString);
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let userExists = false;
    for (var key in users) {
        console.log(`searching for email`);
        if (users[key]['email'] === email && bcrypt.compareSync(password, users[key]['password'])) {
            req.session.user_id = users[key]['id'];
            res.redirect('/urls');
        }
    }
    res.redirect('/register');

});


app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, saltRounds);

    //-- check form to ensure boh values entered.
    if (email && password) {
        var emailExists = checkForExistingEmailAddress(email);
        if (emailExists) {
            res.status(400).send('400 - Email exists in database!')
        }
    } else {
        res.status(400).send('400 - Both email and password require values!')
    }

    const currentUser = req.session.user_id;
    if (currentUser) {
        res.redirect('/urls');
    } else {
        if (!emailExists) {
            let randomString = generateRandomString();
            console.log("New password create with salt  " + password);
            let obj = { id: randomString, email: email, password: password };
            users[randomString] = obj;
            //res.cookie("user_id", randomString);
            req.session.user_id = randomString;

            console.log(users);
            res.redirect('/urls');
        }
    }
});

app.post("/logout", (req, res) => {
    req.session.user_id = null;
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});