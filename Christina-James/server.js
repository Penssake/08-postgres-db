'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();
//change user name and passcode for james
const conString = 'postgres://postgres:1234@localhost:5432';

const client = new pg.Client(conString);

client.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));

app.get('/new', function(request, response) {
  // Answer: The get is part 2, and this returns part 5, the response. This piece of server.js is not interacted with in article.js. It is just for navigation purposes right now. This is part of the READ.
  response.sendFile('new.html', {root: './public'});
});

app.get('/articles', function(request, response) {
  // Answer: This uses parts 2-5. It is interacted with by Article.fetchAll(). This just READs.
  client.query('SELECT * FROM articles')
  .then(function(result) {
    response.send(result.rows);
  })
  .catch(function(err) {
    console.error(err)
  })
});

app.post('/articles', function(request, response) {
  // ANSWER: This uses parts 2-5 of the diagram. This works with Article.prototype.insertRecord(). This performs the CREATE part of the CRUD.
  client.query(
    `INSERT INTO
    articles(title, author, authorUrl, category, publishedOn, body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
  .then(function() {
    response.send('insert complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.put('/articles/:id', function(request, response) {
  // ANSWER: This uses parts 2-5. This is used by Article.prototype.updateRecord(). It does the UPDATE part of the CRUD.
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, authorUrl=$3, category=$4, publishedOn=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
  .then(function() {
    response.send('update complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles/:id', function(request, response) {
  // ANSWER: This uses parts 2-5. This is used by Article.prototype.deleteRecord(). It does the DELETE part of the CRUD.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles', function(request, response) {
  // ANSWER: This uses parts 2-5. This is used by Article.prototype.deleteRecord(). It does the DELETE part of the CRUD, on the ENTIRE TABLE.
  client.query(
    'DELETE FROM articles;'
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

// ANSWER: As soon as loadDB() rubns, it creates a blank new table (if one doesn't exist yet) called articles. If articles has no rows (which it shouldn't), it then populates articles with all the stuff in hackerIpsum.json
loadDB();

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});

function loadArticles() {
  // ANSWER: This uses parts 3-4. It isn't used in article.js, and performs the CREATE part of the CRUD.
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(title, author, authorUrl, category, publishedOn, body)
            VALUES ($1, $2, $3, $4, $5, $6);
          `,
            [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
          )
        })
      })
    }
  })
}

function loadDB() {
  // ANSWER: This uses parts 3-4. It isn't used in article.js, and performs the CREATE part of the CRUD.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      authorUrl VARCHAR (255),
      category VARCHAR(20),
      publishedOn DATE,
      body TEXT NOT NULL);`
    )
    .then(function() {
      loadArticles();
    })
    .catch(function(err) {
      console.error(err);
    }
  );
}
