const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const passport = require('../../app/config/passport');
const UserModel = require('../model/user');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/register', upload.single('avatar'), async (req, res) => {
    await UserModel.findOne({ username: req.body.username })
        .then(async result => {
            if (result == null) {
                const user = {
                    ...req.body,
                    password: md5(req.body.password),
                    avatar: (req.file) ? req.file.path : "uploads\\no-avatar.jpg"
                };
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

router.post('/update', upload.single('avatar'), (req, res) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Update thất bại',
                user
            });
        }
        await UserModel.findOne({ username: req.body.username })
            .then(result => {
                if (result == null || (result != null && user.id == result.id)) {
                    let update = {
                        username: (req.body.username == undefined) ? user.username : req.body.username,
                        email: (req.body.email == undefined) ? user.email : req.body.email,
                        password: (req.body.password == undefined) ? user.password : md5(req.body.password),
                        avatar: (req.file) ? req.file.path : user.avatar
                    }
                    UserModel.updateOne({ _id: user.id }, update).then(() => {
                        return res.status(200).json(update);
                    })
                } else {
                    return res.status(400).json({
                        message: info ? info.message : 'Update thất bại',
                        user
                    });
                }
            })
    })(req, res);
});

router.post('/login/facebook', (req, res) => {
    passport.authenticate('facebook-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({ user }, 'bc3b8945b9ade2eee00b571a13677848');
        return res.status(200).json({ user, token });
    })(req, res);
});

router.post('/login/google', (req, res) => {
    passport.authenticate('google-token', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).send('User Not Authenticated');
        }
        const token = jwt.sign({ user }, 'rx-n9iou9gtjvCvqhRdtdgnp');
        return res.status(200).json({ user, token });
    })(req, res);
});

module.exports = router;





