const propertyService = require('../services/propertyService');
// --------------DEFAULT VALUE OF PAGINATION-----------------
const propertiesPerPage = 5;

class propertyController {
    //[GET]  /
    show(req, res) {
        if(req.user){
            res.render('property');
        }
        else{
            res.redirect('/login');
        }
    }

    async loadProperties(req, res) {
        const properties = await propertyService.loadProperties(propertiesPerPage, req.params.currentPage);
        res.send(properties);
    }

    async loadProperty(req, res) {
        console.log('req: ' + req.params.id);
        const property = await propertyService.loadProperty(req.params.id);
        res.send(property);
    }
}

module.exports = new propertyController();