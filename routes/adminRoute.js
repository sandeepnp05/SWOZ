const express = require('express')
const admin_route = express()
const adminController = require('../controllers/adminController')
const nocache = require('nocache')
const auth = require('../middleware/adminAuth')


admin_route.set('view engine' , 'ejs')
admin_route.set('views' , './views/admin')

admin_route.use(nocache())


admin_route.get('/' ,auth.isLogout,adminController.adminLoad )
admin_route.get('/dashboard',auth.isLogin, adminController.dashboardLoad);
admin_route.post('/', adminController.adminVerifyLogin)
admin_route.get('/logout', adminController.logout)
admin_route.get('/userList', auth.isLogin,adminController.userList)
admin_route.get('/blockUser',adminController.blockUser)

admin_route.get('/categories', auth.isLogin, adminController.categories);
admin_route.post('/categories', auth.isLogin, adminController.addCategories);
admin_route.post('/editCategory',auth.isLogin, adminController.editCategories)




module.exports = admin_route