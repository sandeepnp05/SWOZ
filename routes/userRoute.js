const express = require('express')
const user_route = express()
const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')

const auth = require('../middleware/userAuth')
const nocache = require('nocache')


user_route.set('view engine' , 'ejs')
user_route.set('views' , './views/users')
 
user_route.use(nocache())

user_route.get('/' ,auth.isLogout, userController.loginLoad)
// user_route.get('/login' ,auth.isLogout, userController.loginLoad)
user_route.post('/login' , userController.verifyLogin)
user_route.get('/register' ,auth.isLogout, userController.loadRegister)
user_route.post('/register',userController.insertUser)
// user_route.get('/' , userController.redirectUser)
user_route.get('/index' ,userController.loadHome)
user_route.get('/logout' , userController.logout)
user_route.get('/login',userController.loginLoad)
user_route.get('/contact',userController.loadContact)
user_route.get('/category',userController.loadCategory)
user_route.get('/otpLogin',userController.loadOtp)
user_route.post('/otpLogin',userController.verifyOtp)
user_route.get('/single-product',userController.loadProduct)
user_route.get('/forget',auth.isLogout,userController.loadForget)
user_route.get('/otpForget',auth.isLogout,userController.loadVerifyForget)
user_route.post('/otpForget',auth.isLogout,userController.verifyForgetEmail)
user_route.get('/resetPassword',auth.isLogout,userController.resetPassword)
user_route.post('/resetPassword',auth.isLogout,userController.verifyForgetOtp)
user_route.post('/forgetResetSuccess',auth.isLogout,userController.newPassword)
user_route.get('/forgetResetSuccess',auth.isLogout,userController.loadForgetResetSuccess)
user_route.get('/userProfile',auth.isLogin, userController.userProfile) 
user_route.get('/singleProduct',userController.loadSingleProduct) 

user_route.get('/addressForm',auth.isLogin,userController.addressForm)
user_route.post('/addAddress',auth.isLogin,userController.addAddress)
user_route.post('/updateProfile',auth.isLogin,userController.updateProfile)
user_route.put('/deleteAddress',auth.isLogin,userController.deleteAddress)
user_route.post('/updateAddress',auth.isLogin,userController.updateAddress)

user_route.get('/cart',cartController.loadCart)
user_route.post('/addToCart',cartController.addToCart)
user_route.patch('/updateCart/:productId',auth.isLogin,cartController.updateCart)
user_route.put('/deleteCart',auth.isLogin,cartController.deleteCart)

user_route.get('/checkout',orderController.loadCheckout) 

module.exports =  user_route