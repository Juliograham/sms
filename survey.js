

const client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: '7178586844', 
    from: '+13058943369',
    body: 'Wait until tomorrow to procrastinate.'
})
.then((message) => console.log(message.sid));