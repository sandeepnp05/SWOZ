const User = require('../models/userModel');
const bcrypt = require('bcrypt')

const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash

    } catch (err) {
        console.log(err.message)
    }
}

const loadRegister = async (req, res) => {
    try {

        res.render('register')

    } catch (err) {
        console.log(err.message);
    }
}

const insertUser = async (req, res) => {
    const existMail = await User.findOne({ email: req.body.email })
    if (existMail) {
        res.render('register', { message: 'Email already registered' })
    } else {
        try {
            const spassword = await securePassword(req.body.password)
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: spassword,
            })

            const userData = await user.save()
            console.log(userData);

            if (userData) {
                res.render('register', { message: 'Your registered successfully' })
            } else {
                res.render('register', { message: 'Your registration failed' })
            }

        } catch (err) {
            console.log(err.message);
        }
    }

}

const loginLoad = async (req, res) => {
    try {

        res.render('login')

    } catch (err) {
        console.log(err.message);
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({ email: email })

        if (userData) {
            const passMatch = await bcrypt.compare(password, userData.password)
            if (passMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: 'Please verify your mail' })
                } else {
                    req.session.user_id = userData._id
                    res.redirect('/home')
                }
            } else {
                res.render('login', { message: 'Email or Password Incorrect' })
            }
        } else {
            res.render('login', { message: 'Email or Password Incorrect' })
        }

    } catch (err) {
        console.log(err.message);
    }
}

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        res.render('home', { user: userData })
    } catch (err) {
        console.log(err.message);
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/home')
    } catch (err) {
        console.log(err.message);
    }
}

const redirectUser = async (req, res) => {
    try {
        res.render('login')
    } catch (err) {
        console.log(err.message);
    }
}
const loadIndex = async (req, res) => {
    try {
        res.render('index')
    } catch (err) {
        console.log(err.message);
    }
}
const loadContact = async (req, res) => {
    try {
        res.render('contact')
    } catch (err) {
        console.log(err.message);
    }
}
const loadCategory = async (req, res) => {
    try {
        res.render('category')
    } catch (err) {
        console.log(err.message);
    }
}
const loadOtp = async (req, res) => {
    try {
        res.render('otpLogin')
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    logout,
    redirectUser,
    loadIndex,
    loadContact,
    loadCategory,
    loadOtp
}