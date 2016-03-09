/* @flow */

import express from 'express' ;
import bodyParser from 'body-parser';
import multer from 'multer';
import morgan from 'morgan';

var cors = require('cors');

// routes:
import nodes from './routes/nodes';

export default function(db) {

const app = express();
const upload = multer();

app.use(express.static(__dirname + '/../public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// nodes routes
app.use('/', nodes);

app.get('/hello', (req, res) => {
  res.send('Hello Earth!');
});

// app.get('/children/:id', (req, res) => {
//   res.redirect('/nodes/' + req.params.id + '/c');
// });



const server = app.listen(3000, function () {
  console.log('Express listening on port 3000');
});


};
