const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    avatar: String,
    email: String,
    username: String,
    password: String,
    facebookProvider: {
        type: {
            id: String,
            token: String
        }
    },
    googleProvider: {
        type: {
            id: String,
            token: String
        }
    }
});

schema.set('toJSON', { getters: true, virtuals: true });

schema.statics.upsertFbUser = function (accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'facebookProvider.id': profile.id
    }, function (err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                username: profile.displayName,
                email: profile.emails[0].value,
                facebookProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            console.log(newUser)

            newUser.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(err, user);
        }
    });
};

schema.statics.upsertGoogleUser = function (accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'googleProvider.id': profile.id
    }, function (err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newUser = new that({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newUser.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(err, user);
        }
    });
};

module.exports = mongoose.model('users', schema);