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
        const name = req.body.name;
        const offerExist = await Offer.findOne({ name: name });
        if (offerExist) {
         
            res.redirect('/admin/offer');
        } else {
            const newOffer = new Offer({ 
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