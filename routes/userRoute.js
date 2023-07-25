const express = require('express')
const user_route = express()
const userController = require('../controllers/userController')
const auth = require('../middleware/userAuth')
const nocache = require('nocache')


user_route.set('view engine' , 'ejs')
user_route.set('views' , './views/users')

user_route.use(nocache())

user_route.get('/' ,auth.isLogout, userController.loginLoad)
// user_route.get('/login' ,auth.isLogout, userController.loginLoad)
user_route.post('/login' , userController.verifyLogin)
user_route.get('/register' ,auth.isLogout, userController.loadRegister)
user_route.post('/register' , userController.insertUser)
user_route.get('/' , userController.redirectUser)
user_route.get('/home' ,auth.isLogin, userController.loadHome)
user_route.get('/logout' , userController.logout)
user_route.get('/index',userController.loadIndex)
user_route.get('/login',userController.loginLoad)
user_route.get('/contact',userController.loadContact)
user_route.get('/category',userController.loadCategory)
user_route.get('/otpLogin',userController.loadOtp)


module.exports =  user_route
