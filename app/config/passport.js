const passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const md5 = require('md5');
const UserModel = require('../model/user');
var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;

passport.use(new LocalStrategy(
    (username, password, cb) => {
        UserModel.findOne({ username })
            .then(user => {
                if (user && user.password === md5(password)) {
                    return cb(null, user, { message: 'Đăng nhập thành công' });
                }
                return cb(null, false, { message: "Đăng nhập thất bại" });
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    (jwtPayload, cb) => {
        return UserModel.findOne({ _id: jwtPayload.user._id })
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use(new FacebookTokenStrategy({
    clientID: '421347415482137',
    clientSecret: 'bc3b8945b9ade2eee00b571a13677848'
},
    function (accessToken, refreshToken, profile, done) {
        UserModel.upsertFbUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));

passport.use(new GoogleTokenStrategy({
    clientID: '200927370909-647a3akd0kkorlmdm8i80fdcf5dpp8op.apps.googleusercontent.com',
    clientSecret: '0PyWgKuMZPTF943-RCuJCWfp'
},
    function (accessToken, refreshToken, profile, done) {
        UserModel.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));

module.exports = passport;