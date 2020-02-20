const express = require('express');
const cors = require('cors');
const app = express();
const port = 9000
const AWS = require('aws-sdk');
const _ = require('lodash');

AWS.config.update({region: 'us-east-1'});

const s3 = new AWS.S3();
const documentClient = new AWS.DynamoDB.DocumentClient();

const bucketName = 'songuploaderbucket2983902'

app.use(cors());

app.get('/', (req, res) => res.send('Fake Spotify Like App'));

app.get('/artists', (req, res) => {
  const dbParams = {
    TableName: 'MusicTable',
    AttributesToGet: [
      'ArtistName'
    ]
  };

  documentClient.scan(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      let artists = data.Items.map(item => item.ArtistName);
      res.status(200).send(_.uniq(artists));
    }
  });
});

// app.get('/albums', (req, res) => {
//   const { artist } = req.query;
//   const params = {
//     Bucket: bucketName,
//     Prefix: `Artists/${artist}`
//   };

//   s3.listObjects(params, (err, data) => {
//     if (err) console.log(err, err.stack);
//     else {
//       const itemList = data.Contents;

//       const artistAlbums = itemList.map(item => {
//         return item.Key.split('/')[2]
//       });
//       res.send(_.uniq(artistAlbums));
//     }
//   });
// });

// app.get('/songs', (req, res) => {
//   const { artist, album } = req.query;
//   const params = {
//     Bucket: bucketName,
//     Prefix: `Artists/${artist}/${album}`
//   };

//   s3.listObjects(params, (err, data) => {
//     if (err) {
//       console.log(err, err.stack);
//     } else {
//       const itemList = data.Contents;

//       const albumSongs = itemList.map(item => {
//         return item.Key.split('/')[3]
//       });
//       res.send(_.uniq(albumSongs));
//     }
//   });
// });

// app.get('/song', async (req, res) => {
//   const { songTitle, album, artist} = req.query;
//   console.log(req.query)
//   const params = {
//     Bucket: bucketName,
//     Key: `Artists/${artist}/${album}/${songTitle}`
//   }

//   try {
//     let url = await s3.getSignedUrlPromise('getObject', params);
//     res.send(url);
//   } catch(err) {
//     console.log(err, err.stack);
//   }
// });

app.get('/genres', (req, res) => {
  const dbParams = {
    TableName: 'MusicTable',
    AttributesToGet: [
      'Genre'
    ]
  };

  documentClient.scan(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      let genres = data.Items.map(item => item.Genre);
      res.status(200).send(_.uniq(genres));
    }
  });
});

app.get('/artists/for/genre', (req, res) => {
  const { genre } = req.query
  
  const dbParams = {
    TableName: 'MusicTable',
    IndexName: 'GenreArtistNamesIndex',
    KeyConditionExpression: 'Genre = :hkey',
    ExpressionAttributeValues: {
      ':hkey': genre
    }
  }
  
  documentClient.query(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      let artists = data.Items.map(item => item.ArtistName);
      res.status(200).send(_.uniq(artists));
    }
  });
});

app.get('/albums/for/artist', (req, res) => {
  const { artist } = req.query;

  const dbParams = {
    TableName: 'MusicTable',
    IndexName: 'ArtistNameAlbumTitlesIndex',
    KeyConditionExpression: 'ArtistName = :hkey',
    ExpressionAttributeValues: {
      ':hkey': artist
    }
  }

  documentClient.query(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      let albums = data.Items.map(item => item.AlbumTitle);
      res.status(200).send(_.uniq(albums));
    }
  });
});

app.get('/songs/for/album', (req, res) => {
  const { album } = req.query;

  const dbParams = {
    TableName: 'MusicTable',
    IndexName: 'AlbumTitleSongTitlesIndex',
    KeyConditionExpression: 'AlbumTitle = :hkey',
    ExpressionAttributeValues: {
      ':hkey': album
    }
  };

  documentClient.query(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      let songs = data.Items.map(item => item.SongTitle);
      res.status(200).send(songs);
    }
  });
})

app.listen(port, () => console.log(`Music server listening on port ${port}!`));
