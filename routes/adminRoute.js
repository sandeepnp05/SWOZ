const express = require('express')
const admin_route = express()
const adminController = require('../controllers/adminController')
const nocache = require('nocache')
const auth = require('../middleware/adminAuth')


admin_route.set('view engine' , 'ejs')
admin_route.set('views' , './views/admin')

admin_route.use(nocache())

admin_route.get('/' , auth.isLogout , adminController.loadLogin)
admin_route.post('/login' ,  adminController.verifyLogin)
admin_route.get('/dashboard' , auth.isLogin,  adminController.loadDashboard)
admin_route.get('/logout' , auth.isLogin , adminController.logout)
admin_route.get('/new-user' , auth.isLogin , adminController.newUserLoad)
admin_route.post('/register' , adminController.addUser)
admin_route.get('/edit-user' , auth.isLogin , adminController.editUserLoad)
admin_route.post('/update' , adminController.updateUser)
admin_route.get('/delete-user', auth.isLogin , adminController.deleteUser)
admin_route.get('/logout' , adminController.logOut )


// admin_route.get('*' , (req , res) => {
//     res.redirect('/admin')
// })

module.exports = admin_route