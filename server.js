const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const twilio = require('twilio');
const accountSid = 'AC0bb2ca40be130cb4ca0bc569eb2cdcf7';
const authToken = 'c57c50fe645b9dc00835290c44bcfc87';
const client = new twilio(accountSid, authToken);

let valid = /^(?:[1-9]|0[1-9]|10)$/

let MessageSchema = new mongoose.Schema({
    phoneNumber: String,
    productQual: String,
    custService: String
});

let Message = mongoose.model('Message', MessageSchema);



app.use(bodyParser.urlencoded({extended: false}));
mongoose.connect('mongodb://Julio:98765@ds235768.mlab.com:35768/sms').
  then(() => {
      console.log('DB connected.');
  })

app.get('/', (req, res) => {
    res.end();
})

app.post('/sms', (req, res) => {
    let from = req.body.From;
    let to = req.body.To;
    let body = req.body.Body;

    Message.find({phoneNumber: req.body.From}, (err, message) => {
        if (message.length !== 0) {
          if (!message[0].productQual && !message[0].custService) {
            if (valid.test(body)) {
                Message.findByIdAndUpdate(message[0]._id, {"$set": {"productQual": body}}, {"new": true, "upsert": true}, () => {
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'How would you rate the customer service on a scale of 1-10?'
                    })
    
                    res.end();
                })
            } else {
                client.messages.create({
                    to: `${from}`,
                    from: `${to}`,
                    body: 'Please submit a number between 1-10.'
                }).then(setTimeout(() => {}, 1500)).end();
                Message.findByIdAndUpdate(message[0]._id, {"$set": {"productQual": body}}, {"new": true, "upsert": true}, () => {
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'How would you rate the product quality on a scale of 1-10?'
                    })
                })
            }
            
          } else if (!message[0].custService) {
            if (valid.test(body)) {
            Message.findByIdAndUpdate(message[0]._id, {"$set": {"custService": body}}, {"new": true, "upsert": true}, () => {
                  client.messages.create({
                      to: `${from}`,
                      from: `${to}`,
                      body: 'Thank you for your time. We hope to see you soon!'
                  })
              })
          } else {
            client.messages.create({
                to: `${from}`,
                from: `${to}`,
                body: 'Please submit a number between 1-10.'
            }).then(setTimeout(() => {}, 1500)).end();
            Message.findByIdAndUpdate(message[0]._id, {"$set": {"custService": body}}, {"new": true, "upsert": true}, () => {
                client.messages.create({
                    to: `${from}`,
                    from: `${to}`,
                    body: 'How would you rate the customer service on a scale of 1-10?'
                })
            })
          }
        }
        } else {
            if (body === 'Survey' || 'survey') {
              let newMessage = new Message();
              newMessage.phoneNumber = from;
              newMessage.save(() => {
                client.messages.create({
                    to: `${from}`,
                    from: `${to}`,
                    body: 'Thanks for shopping at Julio\'s Electronics Hub! How would you rate the product quality on a scale of 1-10?'
                })

                res.end();
              })
            }
        }

        res.end();
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server connected.');
})