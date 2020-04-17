const functions = require('firebase-functions');
const express =  require('express');
const md5 = require('md5');
var uniqid = require('uniqid');
var admin = require("firebase-admin");
const cors = require('cors');

var serviceAccount = require("./shopserver-firebase-adminsdk-pztmr-5a1ba53d94.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shopserver.firebaseio.com"
  });

  var db = admin.firestore();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions


const app = express()

app.use(cors({ origin: true }));

app.post('/register', async (req, res) => {
    const {email, password, first_name = '', second_name = '', phone = ''} = req.body;

    try{
        db.collection('users').doc(email)
        .set({
            email, first_name, second_name, phone, password: md5(password)
        }, {merge: true});


        res.send({email, first_name, second_name, phone})
    } catch(err){
        console.log('err', err)
        res.status(400).send({message: err})
    }
})

app.post('/login', async(req, res) => {
    const {email, password} = req.body;

    try{
        const snapshot = await db.collection('users')
        .where('email', '==', email)
        .where('password', '==', md5(password))
        .get()

          const users = []
          snapshot.forEach(doc => {
            users.push(doc.data());
          });

        if(users.length){
            res.send(users[0])
        } else {
            res.status(400).send({message: 'User not exist'})
        }
        
    } catch(err){
        console.log('err', err)
        res.status(400).send({message: err})
    }
})

app.get('/get-products', async(req, res) => {
    try{
        const snapshot = await db.collection('products').get()
          const products = []
          snapshot.forEach(doc => {
            products.push(doc.data());
          });
       //  const products = await Products.findAll()

        res.send({products})        
    } catch(err){
        console.log('err', err)
        res.status(400).send({message: err})
    }
})

app.post('/add-product', async(req, res) => {
    const { code , name = '', price = 0, count = 0, image = ''} = req.body;

    try{
        const id = code ? code : uniqid()
        db.collection('products').doc(id)
        .set({
            id, name, price, count, image
        }, {merge: true});


        res.send({id , name, price, count, image})
    } catch(err){
        console.log('err', err)
        res.status(400).send({message: err.toString()})
    }
})

exports.app = functions.https.onRequest(app);
