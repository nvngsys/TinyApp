const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'bacon';
const someOtherPlaintextPassword = 'not_bacon';

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        // Store hash in your password DB.
    });
});


const hashed = bcrypt.hash(myPlaintextPassword, saltRounds);
console.log(myPlaintextPassword, hashed);


console.log(bcrypt.compare(myPlaintextPassword, hash));

// run with node



// Load hash from your password DB.
// bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
//     // res == false
// });