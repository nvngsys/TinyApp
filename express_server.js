var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

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
        isUserLogIn = req.cookies["user_id"];
    }
    return isUserLogIn;
}

function checkForExistingEmailAddress(emailIn) {
    //Loop the user array and check for email
    //console.log(`Starting to check email addresses`);
    let emailExists = false;
    //var userOBJ = { };
    for (var key in users) {
        //    console.log(key)
        //    console.log(users[key]['email']);
        if (users[key]['email'] === emailIn) {
            emailExists = true;
            //userOBJ = {id: users[key]['id'], email: users[key]['email'], password: users[key]['password'] };
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
    let user_id = checkUserLoggedIn(req, res);
    let userURL = urlsForUser(user_id);
    let templateVars = {
        urls: userURL,
        // user_id: user_id,
        user: users[user_id]
    };
    // user_id: user_id,
    //console.log(templateVars);
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    if (user_id) {
        let templateVars = {
            //user_id: user_id,
            user: users[user_id]
        };
        res.render("urls_new", templateVars);
    } else {
        res.redirect('/login');
    }
});

app.get("/urls/:shortURL", (req, res) => {
    //let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    // let username = undefined;
    // if(req.cookies){
    //     username = req.cookies["username"];
    // }
    let user_id = checkUserLoggedIn(req, res);
    let templateVars = {
        //user_id: user_id,
        user: users[user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]['longURL']
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    console.log('get /u processing');
    //console.log(urlDatabase[req.params.shortURL]);
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
    console.log(`starting register page`)
    let user_id = checkUserLoggedIn(req, res);
    let templateVars = {
        user_id: user_id,
        user: users[user_id]
    }
    res.render("register", templateVars);
});

app.get("/login", (req, res) => {
    console.log(`starting login page`)
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
        //console.log("shortID  " + shortID)
        // console.log(urlDatabase[shortID]);
        // console.log(urlDatabase[shortID]['userID']);
        for (var key in urlDatabase) {
            //if (urlDatabase[shortID]['userID'] === user_id) {
            if (key === shortID) {
                //console.log("shortu url found");
                if (urlDatabase[key]['userID'] === user_id) {
                    //console.log(`userid on url  is the same as logged in user`)
                    let newKey = req.body.newURL;
                    urlDatabase[newKey] = urlDatabase[key];
                    //console.log(urlDatabase);
                    delete urlDatabase[key];
                }
            }
        }
    }
    //console.log(urlDatabase);
    res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
    let user_id = checkUserLoggedIn(req, res);
    if (user_id) {
        const shortID = req.params.shortURL;
        for (var key in urlDatabase) {
            //if (urlDatabase[shortID]['userID'] === user_id) {
            // delete urlDatabase[shortID];
            //}
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
    console.log("testing add url userid");
    console.log(users);
    res.redirect("/urls/" + randomString);
});

app.post("/login", (req, res) => {
    console.log(`starting login`);
    let tstFortUserName = req.body.user_id;
    console.log(req.body.user_id);

    const email = req.body.email;
    const password = req.body.password;


    bcrypt.compare(myPlaintextPassword, hash);
    // -------

    let loggedInUser = null;
    //console.log(`Is this person logged in form.username ${tstFortUserName}`);
    if (tstFortUserName) {
        //res.cookie("user_id", req.body.user_id); no need to do as it exists
        res.redirect('/urls');
    } else {
        var emailExists = checkForExistingEmailAddress(email);
        if (emailExists) {
            console.log(`Email exist we will create a cookie`);
            for (var key in users) {
                const user = users[key];
                
                // start here - make sure you have a value and make sure the user is a new user you 
                // have added - whose password was salted on register
                console.log(bcrypt.compare(password, users[key]['password']));
                //replace checking code below
                if (users[key]['email'] === email && users[key]['password'] === password) {
                    //console.log("get user id");
                    //console.log(users[key]['id']);

                    loggedInUser = user;   // this will represent the object with the users infor
                    console.log(loggedInUser);
                    //res.cookie("user_id", users[key]['id']);
                    res.cookie("user_id", loggedInUser['id']);
                    break;
                }
            }
            res.redirect('/urls');
        } else {
            res.status(403).send('403 - Invalid username!');
        }


    }

});

app.post("/logout", (req, res) => {
    console.log("TEsting cookie LOGOUT");
    res.clearCookie('user_id');
    res.redirect('/urls');
});

app.post("/register", (req, res) => {
    const email = req.body.email;
    //const password = req.body.password;
    const password = bcrypt.hash(req.body.password, saltRounds);

    //Next add the user to the users object
    users[randomlygenerated value] = { id: same asgenerated value, email: email, pasword: password }

    // this may all need to move down lower in your code that checks for email then creates new user



    if (email && password) {
        var emailExists = checkForExistingEmailAddress(email);

        if (emailExists) {
            res.status(400).send('400 - Email exists in database!')
        }
    } else {
        // jack NOTE this must also cause an error to stop processing
        res.status(400).send('400 - Both email and password require values!')
    }

    //--------------
    //is a current user logged in
    const currentUser = req.cookies["user_id"];   //works - current log in user
    //console.log(currentUser);


    if (currentUser) {
        console.log("You are logged in ")

    } else {
        if (!emailExists) {
            let randomString = generateRandomString();
            let obj = { id: randomString, email: email, password: password };
            users[randomString] = obj;
            res.cookie("user_id", randomString);
            console.log(users);
        }
    }
    res.redirect('/urls');
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});