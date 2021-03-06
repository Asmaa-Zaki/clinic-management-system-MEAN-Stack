const validationAppointment = require('../middleware/appointValidationMiddle');
const _ = require('lodash');
const bcrypt = require('bcrypt');
//apointment
const { appointment } = require('../models/appointment');
const { Doctor } = require('../../Doctor/models/doctor');
const { patient } = require('../../Patient/models/patient');
const auth = require('../../JWT/jwtMiddleware');
//express
const express = require('express');

//router
const router = express.Router()

//-------------------------------------------Get List
//read
//localhost:3000/appointment/
router.get('/', [auth.accessAll], async (req, res) => {
    const appoint = await appointment.find(req.appointment);
    if (appoint) return res.send(appoint);
    return res.status(400).send('Not Found Any Record');

});

//-----------------------------------------------Get By ID
router.get('/:id', [auth.checkReceptionest], async (req, res) => {

    const appoint = await appointment.findById(req.params.id);

    if (!appoint) return res.status(404).send('The genre with the given ID was not found.');

    res.send(appoint);

})

//-----------------------------------------------Add
//create
router.post('/', [auth.checkReceptionest], async (req, res) => {

    console.log("hamada");
    const { error } = validationAppointment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) return res.status(400).send('Invalid doctor Id');

    const pat = await patient.findById(req.body.patientId);
    if (!pat) return res.status(400).send('Invalid patient Id');
    let appoint = new appointment({
        _id: req.body._id,
        doctorId: {
            _id: doctor._id,
            doctorName: doctor.doctorName
        },
        patientId: {
            _id: pat._id,
            patientName: pat.patientName
        },
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        medicalSpecialty: req.body.medicalSpecialty
    });
    const check = await appointment.findById(req.body._id);
    if (check) return res.status(400).send('The ID already Registred!');

    appoint = await appoint.save();
    res.send(appoint);
})


//-----------------------------------------------Update
router.put('/:id', [auth.checkReceptionest], async (req, res) => {
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) return res.status(400).send('Invalid Id');
    //--------------Check Body Request
    const { error } = validationAppointment(req.body);
    if (error == true) return res.status(400).send(error.details[0].message);
    const pat = await patient.findById(req.body.patientId);
    if (!pat) return res.status(400).send('Invalid patient Id');
    let appoint = new appointment({
        _id: req.body._id,
        doctorId: {
            _id: doctor._id,
            doctorName: doctor.doctorName
        },
        patientId: {
            _id: pat._id,
            patientName: pat.patientName
        },
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        medicalSpecialty: req.body.medicalSpecialty
    })
    appointment.findByIdAndUpdate(req.params.id, { $set: appoint }, { new: true }, (err, doc) => {
        if (!err)
            res.send(doc)
        else
            console.log("Error in Appointment Update: " + JSON.stringify(err, undefined, 2))
    })
})


//-----------------------------------------------Delete
router.delete('/:id', [auth.checkReceptionest], async (req, res) => {
    const appoint = await appointment.findByIdAndRemove(req.params.id);

    if (!appoint) return res.status(400).send('The genre with the given ID was not found.');

    // console.log("delete");
    res.send({ "DELETE FROM DB\t": appoint });
})

module.exports = router