const _ = require('lodash');
const bcrypt = require('bcrypt');
const validationPrescription = require('../middleware/validationPrescript');
const { Prescription } = require('../model/prescriptModel');
const { Doctor } = require('../../Doctor/models/doctor');
const { patient } = require('../../Patient/models/patient');
const { medicine } = require('../../Medicine/models/medicine');
const auth = require('../../JWT/jwtMiddleware');
//express
const express = require('express');
const router = express.Router();

//---------------------------------------------get
router.get('/', [auth.accessAll], async (req, res) => {
    const prescript = await Prescription.find();
    if (!prescript) return res.status.apply(400).send('Not Found');
    res.send(prescript);
});//End GetList
//---------------------------------------------GetBy Id
router.get('/:id', [auth.accessAll], async (req, res) => {
    const prescript = await Prescription.findById(req.params.id);
    if (!prescript) return res.status.apply(400).send('Not Found');
    res.send(prescript);
})

//-----------------------------------------------------
router.post('/', [auth.checkDoctorOnly], async (req, res) => {
    const { error } = validationPrescription(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    console.log("haha");
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) return res.status(400).send('Invalid doctor Id');

    const pat = await patient.findById(req.body.patientId);
    if (!pat) return res.status(400).send('Invalid patient Id');

    const med = await medicine.findById(req.body.medicineId);
    if (!med) return res.status(400).send('Invalid medicine Id');

    let prescript = new Prescription({
        _id: req.body._id,
        doctorId: {
            _id: doctor._id,
            doctorName: doctor.doctorName
        },
        patientId: {
            _id: pat._id,
            patientName: pat.patientName
        },
        medicineId: {
            _id: med._id,
            medicineName: med.medicineName
        },
        numberOfDoses: req.body.numberOfDoses,
        dateOfPrescript: req.body.dateOfPrescript

    });
    prescript = await prescript.save();
    res.send(prescript);
});//End Post
//---------------------------------------------Update
router.put('/:id', [auth.checkDoctorOnly], async (req, res) => {
    const { error } = validationPrescription(req.body);
    if (error == true) return res.status(400).send(error.details[0].message);
    console.log("haha");
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) return res.status(400).send('Invalid doctor Id');
    const pat = await patient.findById(req.body.patientId);
    if (!pat) return res.status(400).send('Invalid patient Id');
    const med = await medicine.findById(req.body.medicineId);
    if (!med) return res.status(400).send('Invalid medicine Id');

    const prescript = await Prescription.findByIdAndUpdate(req.params.id,
        {
            _id: req.body._id,
            doctorId: {
                _id: doctor._id,
                doctorName: doctor.doctorName
            },
            patientId: {
                _id: pat._id,
                patientName: pat.patientName
            },
            medicineId: {
                _id: med._id,
                medicineName: med.medicineName
            },
            numberOfDoses: req.body.numberOfDoses,
            dateOfPrescript: req.body.dateOfPrescript
        },
        { new: true });
    if (!prescript) return res.status(400).send('Invalid Id');
    res.send('Updated\t' + prescript);
});// End Update
//---------------------------------------------Delete
router.delete('/:id', [auth.checkDoctorOnly], async (req, res) => {
    const prescript = await Prescription.findByIdAndRemove(req.params.id);
    if (!prescript) return res.status(400).send('Invalid Id');
    res.send({ 'Deleted\t': prescript });
});// End Deleted

module.exports = router;