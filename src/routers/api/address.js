const router = require('express').Router();
const models = require('../../db/models').models;
const generator = require('../../utils/generator');
const cel = require('connect-ensure-login');
const Raven = require('raven');
const urlutils = require('../../utils/urlutils');
const { hasNull } = require('../../utils/nullCheck');

router.post('/', cel.ensureLoggedIn('/login'), function (req, res) {
    if(hasNull(req.body, ['label','first_name','last_name','number','email','pincode','street_address','landmark','city','stateId','countryId'])) {
        res.send(400);
    } else {
        models.Demographic.findCreateFind({
            where: {userId: req.user.id}
        }).then(([demographics, created]) => models.Address.create({
            label: req.body.label,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.number,
            email: req.body.email,
            pincode: req.body.pincode,
            street_address: req.body.street_address,
            landmark: req.body.landmark,
            city: req.body.city,
            stateId: req.body.stateId,
            countryId: req.body.countryId,
            demographicId: demographics.id,
            primary: false
        }))
            .then((address) => res.redirect('/address/' + address.id))
            .catch(err => {
                Raven.captureException(err)
                req.flash('error', 'Error inserting Address')
                res.redirect('/users/me')
            })
    }
});

router.post('/:id', cel.ensureLoggedIn('/login'), function (req, res) {
    if(hasNull(req.body, ['label','first_name','last_name','number','email','pincode','street_address','landmark','city','stateId','countryId'])) {
        return res.send(400);
    }
    let id = parseInt(req.params.id);
    if (req.body.primary === 'on') {
        models.Address.update({
            primary:false
        },{where: {userId:req.user.id}}).then( _ => {
            return models.Address.update({
                label: req.body.label,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                mobile_number: req.body.number,
                email: req.body.email,
                pincode: req.body.pincode,
                street_address: req.body.street_address,
                landmark: req.body.landmark,
                city: req.body.city,
                stateId: req.body.stateId,
                countryId: req.body.countryId,
                userId: req.user.id,
                primary: req.body.primary === 'on'
            }, {
                where: {id: id}
            });
        }).then(function (address) {
            res.redirect('/address/' + id)
        }).catch(function (error) {
            Raven.captureException(error)
        })
    } else {
        models.Address.update({
            label: req.body.label,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.number,
            email: req.body.email,
            pincode: req.body.pincode,
            street_address: req.body.street_address,
            landmark: req.body.landmark,
            city: req.body.city,
            stateId: req.body.stateId,
            countryId: req.body.countryId,
            userId: req.user.id,
            primary: req.body.primary === 'on'
        }, {
            where: {id: id}
        }).then(function (address) {
            res.redirect('/address/' + id)
        }).catch(function (error) {
            Raven.captureException(error)
        })
    }
});


module.exports = router

