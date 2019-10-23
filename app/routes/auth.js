const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const passport = require('../../app/config/passport');
const UserModel = require('../model/user');

router.post('/register', async (req, res) => {
    await UserModel.findOne({ email: req.body.email })
        .then(async result => {
            if (result == null) {
                const user = { ...req.body };
                user.password = md5(user.password);
                res.status(200).json(user);
                return new UserModel(user).save();
            }
            return res.status(404).send('Đăng ký thất bại');
        })
});

router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Đăng nhập thất bại',
                user
            });
        }
        req.login(user, { session: false }, (error) => {
            if (error) {
                res.send(error);
            }
            const token = jwt.sign({ user }, 'your_jwt_secret');
            return res.status(200).json({ user, token });
        });
        return null;
    })(req, res);
});

module.exports = router;





