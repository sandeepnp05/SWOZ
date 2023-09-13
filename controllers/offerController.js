const Offer = require('../models/offerModel')

const loadOffer = async(req,res)=>{
    try {
        const offers = await Offer.find({})
        res.render('offer',{offers})
    } catch (error) {
        conlole.log(error)
    }
}
const addOffer = async (req, res) => {
    try {
        const { search, page } = req.query;
        const { startingDate, expiryDate, percentage } = req.body;
        console.log(startingDate, expiryDate, percentage);
        const name = req.body.name;
        console.log(name, ':name');
        const offerExist = await Offer.findOne({ name: name }); // Use a different variable name here
        if (offerExist) {
            // req.flash('err','Offer already exists!!!')
            res.redirect('/admin/offer');
        } else {
            const newOffer = new Offer({ // Use a different variable name here
                name: name,
                startingDate: startingDate,
                expiryDate: expiryDate,
                percentage: percentage,
                search: search,
                page: page
            }); 
            await newOffer.save();
            res.redirect('/admin/offer');
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadOffer,
    addOffer

}