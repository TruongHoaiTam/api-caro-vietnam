const passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const md5 = require('md5');
const UserModel = require('../model/user');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    (email, password, cb) => {
        UserModel.findOne({ email })
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

module.exports = passport;