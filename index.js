const express = require('express');
const cors = require('cors');
const app = express();
const port = 9000
const AWS = require('aws-sdk');
const _ = require('lodash');

AWS.config.update({region: 'us-east-1'});

const s3 = new AWS.S3();

const bucketName = 'songuploaderbucket2983902'

app.use(cors());

app.get('/', (req, res) => res.send('Fake Spotify Like App'));

app.get('/artists', (req, res) => {
  const params = {
    Bucket: bucketName
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
});

app.get('/albums', (req, res) => {
  const { artist } = req.query;
  const params = {
    Bucket: bucketName,
    Prefix: `Artists/${artist}`
  };

  s3.listObjects(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      const itemList = data.Contents;

      const artistAlbums = itemList.map(item => {
        return item.Key.split('/')[2]
      });
      res.send(_.uniq(artistAlbums));
    }
  });
});

app.get('/songs', (req, res) => {
  const { artist, album } = req.query;
  const params = {
    Bucket: bucketName,
    Prefix: `Artists/${artist}/${album}`
  };

  s3.listObjects(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      const itemList = data.Contents;

      const albumSongs = itemList.map(item => {
        return item.Key.split('/')[3]
      });
      res.send(_.uniq(albumSongs));
    }
  });
});

app.get('/song', async (req, res) => {
  const { songTitle, album, artist} = req.query;
  console.log(req.query)
  const params = {
    Bucket: bucketName,
    Key: `Artists/${artist}/${album}/${songTitle}`
  }

  try {
    let url = await s3.getSignedUrlPromise('getObject', params);
    res.send(url);
  } catch(err) {
    console.log(err, err.stack);
  }
});

app.listen(port, () => console.log(`Music server listening on port ${port}!`));
