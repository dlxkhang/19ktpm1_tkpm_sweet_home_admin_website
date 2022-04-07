
class homeController {
    //[GET]  /
    home(req, res) {
        if(req.user){
            res.render('home',{admin:req.user});
        }
        else{
            res.redirect('/login');
        }
        res.render('home');
    }
}

module.exports = new homeController();