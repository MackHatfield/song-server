const express = require('express')
const app = express()
const port = 3000
const AWS = require('aws-sdk');
const _ = require('lodash');

AWS.config.update({region: 'us-east-1'});

// const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();

const bucketName = 'songuploaderbucket2983902'

app.get('/', (req, res) => res.send('Fake Spotify Like App'));

// app.get('/artists', (req, res) => {
//   const params = {
//     ExpressionAttributeNames: {
//       "#AN": "ArtistName"
//     },
//     ProjectionExpression: "#AN",
//     TableName: "MusicTable"
//   };

//   dynamodb.scan(params, (err, data) => {
//     if (err) {
//       console.log(err, err.stack);
//     } else {
//       res.send(data);
//     }
//   });
// });

// app.get('/genres', (req, res) => {
//   const params = {
//     ExpressionAttributeNames: {
//       "#G": "Genre"
//     },
//     ProjectionExpression: "#G",
//     TableName: "MusicTable"
//   };

//   dynamodb.scan(params, (err, data) => {
//     if (err) {
//       console.log(err, err.stack);
//     } else {
//       res.send(data);
//     }
//   });
// });

// app.get('/songs', (req, res) => {
//   const { song } = req.query
//   res.send(song);
// })

app.get('/artists', (req, res) => {
  const params = {
    Bucket: bucketName,
  };
  s3.listObjects(params, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      const itemList = data.Contents;
      let artists = itemList.map(item => {
        let artistName = item.Key.split('/')[1]
        return artistName;
      });
      
      const uniqueArtists = _.uniq(artists);
      res.send(uniqueArtists)
    }
  });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
