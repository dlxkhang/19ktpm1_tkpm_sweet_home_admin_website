const adminService = require('../services/adminService')
class authController {
    //[GET]  /login
    show(req, res) {
        const errorMsg = req.flash('errorMsg');
        res.render('login', { errorMsg, layout: false });
        // const wrongPassword = req.query['wrong-password'] !== undefined;
        // res.render('login',{layout:false, wrongPassword: wrongPassword});
    }

    
}

module.exports = new authController();