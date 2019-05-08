var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
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
    let templateVars = { urls: urlDatabase };  //jpb must pass object to render a object
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



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});