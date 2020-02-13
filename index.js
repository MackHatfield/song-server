const express = require('express')
const app = express()
const port = 3000
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

const dynamodb = new AWS.DynamoDB();

app.get('/', (req, res) => res.send('Fake Spotify Like App'));

app.get('/artists', (req, res) => {
  const params = {
    ExpressionAttributeNames: {
      "#AN": "ArtistName"
    },
    ProjectionExpression: "#AN",
    TableName: "MusicTable"
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      res.send(data);
    }
  })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))