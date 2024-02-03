const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username })
                .then(user => {
                    if (!user) {
                        return done(null, false);
                    }
                    bcrypt.compare(password, user.password, function(err, res) {
                        if (res === true) {
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    });
                })
                .catch(err => {
                    return done(err);
                });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Exemple de désérialisation de l'utilisateur avec Mongoose et Passport
    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });


    passport.ensureAuthenticated = function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        // req.flash('error', 'Please log in to access this page');
        res.redirect('/login');
    };
};
