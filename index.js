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
});


app.get('/song', (req, res) => {
  const { song } = req.query;

  const dbParams = {
    TableName: 'MusicTable',
    KeyConditionExpression: 'SongTitle = :hkey',
    ExpressionAttributeValues: {
      ':hkey': song
    }
  };

  documentClient.query(dbParams, async (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (data.Items.length > 0) {
        let fields = data.Items[0];
        let { AlbumTitle, ArtistName, Genre, SongTitle } = fields;
  
        let bucketParams = {
          Bucket: bucketName,
          Key: `${Genre}/${ArtistName}/${AlbumTitle}/${SongTitle}`
        };
  
        try {
          let url = await s3.getSignedUrlPromise('getObject', bucketParams);
          res.status(200).send(url);
        } catch(err) {
          res.status(400).send(err);
        }
      } else {
        res.status(404).send('Not found')
      }
    }
  });
});

app.post('/save-user', (req, res) => {
  const { id, name, email } = req.query;

  const dbParams = {
    TableName: 'Users',
    Item: {
      ID: id,
      Name: name,
      Email: email
    }
  };

  documentClient.put(dbParams, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Music server listening on port ${port}!`));
