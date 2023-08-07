const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/swoz_online')
.then(()=> console.log('connected'))
.catch((err)=> console.log(err.message))


const session = require('express-session')
const config = require('./config/config')
const localSession = require('./middleware/userAuth');
const express = require('express');
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(session({
    secret : config.sessionSecret,
    resave : false,
    saveUninitialized : true
}))
app.use(express.static(__dirname + "/public/user"));
app.use(express.static(__dirname + "/public/admin"));
app.use(express.static(__dirname + "/public"));

app.use(localSession.commonSection);

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)


const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)


app.listen(3000 , () => {
    console.log('server running http://localhost:3000/');
})