const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const ensureAuthenticated = passport.ensureAuthenticated;

// image

var storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, './uploads');
    },
    filename:(req,file,cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },

});
var upload = multer({
    storage: storage,
}).single('image');


router.get('/',ensureAuthenticated, async (req, res) => {
    try{
        const users = await User.find().exec();
        // console.log(users)
        res.render('index',{users: users, message:''});
    }catch(e){
        console.error(err);
        res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
});

router.get('/login', (req,res)=>{
    res.render('login');
})

router.get('/register', (req,res)=>{
    res.render('register');
});

router.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/register',upload, async (req, res) => {
    console.log(req.file)
    try {
        const username = req.body.username;
        const existingUser = await User.findOne({ username: username });

        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            phoneNumber: req.body.phone,
            email: req.body.email,
            password: hashedPassword,
            image: req.file.filename,
        });

        await newUser.save();

        passport.authenticate('local')(req, res, () => {
            res.redirect('/login');
        });
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
});
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
        res.redirect('/login'); // Redirection vers la page de connexion après la déconnexion
    });
});

router.get('/edit/:id', async(req, res)=>{
    try{
        let id = req.params.id;
        const user = await User.findById(id).exec();

        if(!user){
            return res.redirect('/');
        }
        res.render('edit',{
            user: user,
        });
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
});

router.post('/update/:id',upload,async(req, res)=>{
    try{
        const id = req.params.id;
        const updateData = {    
            username: req.body.username,
            phoneNumber: req.body.phone,
            email: req.body.email,
            image:req.file.filename
            

        };
        const updatedUser = await User.findByIdAndUpdate(id, updateData);
        if(!updatedUser){
            return 
        }
        req.session.message = {
            type: 'success',
            message: "Lecture Updated Successfully",
        };
        res.redirect('/');


    }catch(err){
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }

});
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(500).send('Record Not Found');
        
        }

        req.session.message = {
            type: 'success',
            message: 'Lecture Deleted successfully!'
        };
        res.redirect("/");
    } catch (err) {
        res.status(500).send('Erreur lors de suppression');
    }
});

router.get('/contact_us', (req, res) => {
    res.render('contact');
});
router.post('/contact', async(req, res) => {
    const {email,subject, message,} = req.body

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'grishcom23@gmail.com',
            pass: 'vnxm wzvn kwzu hhod'
        }

    });

    const mailOptions = {
        from: email, // Utilisation de l'e-mail fourni dans le formulaire comme expéditeur
        to: 'grishcom23@gmail.com', //
        subject: subject,
        text: `Email: ${email}\n\nMessage:\n${message}`
    };
    await transporter.sendMail(mailOptions);

    res.send('Message envoyé avec succès !');

})


module.exports = router;