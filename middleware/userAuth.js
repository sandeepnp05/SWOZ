const isLogin = async(req , res , next) => {
    try {
        
        if(req.session.user_id) {
            next()
        }else{
            res.redirect('/')
        }
       
    } catch (err) {
        console.log(err.message);
    }
}

const isLogout = async(req , res , next) => {
    try {
        
        if(req.session.user_id) {
            res.redirect('/index')
        }else{
            next()
        }

    } catch (err) {
        console.log(err.message);
    }
}
const commonSection = async (req,res,next) => {
    try {
        res.locals.session = req.session
        res.locals.session.user_id = req.session.user_id;
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    commonSection
}