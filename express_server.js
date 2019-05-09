var express = require("express");
var app = express();
//var cookieParser = require('cookie-parser')
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
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

function checkUserLoggedIn(req, res){
    let testUsername = undefined;
    if(req.cookies){
        testUsername = req.cookies["username"];
    }
    return testUsername;
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};



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
    //console.log(`Returned userame: ${testForUsername}`);
    // let username = undefined;
    // if(req.cookies){
    //     username = req.cookies["username"];
    // }
    let username = checkUserLoggedIn(req, res);
    let templateVars = { 
        urls: urlDatabase,
        username: username
    }; 
    //console.log(templateVars);
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    // let username = undefined;
    // if(req.cookies){
    //     username = req.cookies["username"];
    // }
    let username = checkUserLoggedIn(req, res);
    let templateVars = { 
        username: username,
    }; 
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    //let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    // let username = undefined;
    // if(req.cookies){
    //     username = req.cookies["username"];
    // }
    let username = checkUserLoggedIn(req, res);
    let templateVars = { 
        username: username,
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL]
    }; 
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    //console.log(urlDatabase[req.params.shortURL]);
    longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
    const shortID = req.params.id;
    urlDatabase[shortID] = req.body.newURL;
    res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const urlid = req.params.shortURL;
    delete urlDatabase[urlid];
    res.redirect('/urls');
});

app.post("/urls", (req, res) => {
    let randomString = generateRandomString();
    urlDatabase[randomString] = req.body['longURL'];
    let templateVars = { shortURL: randomString, longURL: urlDatabase[randomString] };
    res.redirect("/urls/" + randomString);

});

app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
    console.log("TEsting cookie LOGOUT");
    res.clearCookie('username');
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});