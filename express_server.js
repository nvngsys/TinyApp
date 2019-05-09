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


var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
    // Cookies that have not been signed
    // console.log('Cookies: ', req.cookies)

    // // Cookies that have been signed
    // console.log('Signed Cookies: ', req.signedCookies)
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
    //res.send("<html><body>Hello <b>World</b></body></html>\n");
    let templateVars = { greeting: 'Hello World!' };  //this will send as a input parm to .ejs
    res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
    let username = undefined;
    //let username = " ";
    if(req.cookies){
        username = req.cookies["username"];
    }
    
    let templateVars = { 
        urls: urlDatabase,
        username: username
    };  //jpb must pass object to render a object
    console.log(templateVars);
    //console.log("Body ", req.body);
    //console.log("Body ", res.body);
    //console.log("req Cookie", req.cookie);
    //console.log("res Cookie", res.cookie);
   
    // let templateVars = {
    //     username: req.cookies["username"],
    //     // ... any other vars
    // };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    console.log(urlDatabase[req.params.shortURL]);
    longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
    //console.log("POST CALL for update to /urls/:id");
    const shortID = req.params.id;
    //console.log("shortID = " + shortID);
    //console.log(req.body);
    //console.log(req.body.newURL);
    urlDatabase[shortID] = req.body.newURL;
    res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const urlid = req.params.shortURL;
    delete urlDatabase[urlid];
    res.redirect('/urls');
    //res.send('DELETE UNDER DEVELOPMENT');
});

app.post("/urls", (req, res) => {
    let randomString = generateRandomString();
    //console.log(randomString);       //keep for testing TBR
    urlDatabase[randomString] = req.body['longURL'];
    //console.log(urlDatabase);  //keep for testing TBR
    //console.log(req.body);  // Log the POST request body to the console keep for testing

    // instead of say ok I want to refirect to  
    // redirect to /urls/:shortURL, where shortURL is the random string we generated
    // shortURL will be randomString
    //res.send("Ok");         // Respond with 'Ok' (we will replace this)
    let templateVars = { shortURL: randomString, longURL: urlDatabase[randomString] };
    //res.render("urls_show", templateVars);  //this works but is not a redirect
    //res.redirect("urls_show", templateVars);
    //var redirect = `/urls/randomString`;
    res.redirect("/urls/" + randomString);

});

app.post("/login", (req, res) => {
    //console.log("TEsting cookie login");
    //console.log(req.body);
    res.cookie("username", req.body.username);
    //console.log(req.body);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
    console.log("TEsting cookie LOGOUT");
    //console.log(req.body);
    //res.cookie("username", req.body.username);
    //console.log(req.body);
    res.clearCookie('username');
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});