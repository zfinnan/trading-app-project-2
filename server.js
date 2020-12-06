require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const multer = require('multer');
const session = require('express-session');
const passport = require('./config/ppConfig');
const axios = require('axios'); 
const flash = require('connect-flash');
const SECRET_SESSION = process.env.SECRET_SESSION;
console.log(SECRET_SESSION);
const app = express();
const uploads = multer({ dest: './uploads'});
const cloudinary = require('cloudinary');
let db = require('./models')
const methodOverride = require('method-override')


// isLoggedIn middleware
const isLoggedIn = require('./middleware/isLoggedIn');
const post = require('./models/post');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'))

// secret: What we actually will be giving the user on our site as a session cookie
// resave: Save the session even if it's modified, make this false
// saveUninitialized: If we have a new session, we save it, therefore making that true

const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}

app.use(session(sessionObject));

// Initialize passport and run through middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
// Using flash throughout app to send temp messages to user
app.use(flash());

// Messages that will be accessible to every view
app.use((req, res, next) => {
  // Before every route, we will attach a user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', (req, res) => {
  console.log(res.locals.alerts);
  db.post.findAll()
  .then((posts) => {
    const postArray = posts.map(post => {
      return post.get();
    })
    console.log(postArray);    
    res.render('index', { posts: postArray });
  })
});

app.get('/newPost', (req, res) => {
  console.log(res.locals.alerts);
  res.render('newPost', { alerts: res.locals.alerts });
});

app.post('/newPost', isLoggedIn, uploads.single('inputFile'), (req, res) => {
  console.log('On POST route');
  console.log(req.body)

  // get an input from user
  let file = req.file.path;
  // console.log(file);

  
  cloudinary.uploader.upload(file, (result) => {
    // console.log(result);
    
        
    db.post.create({
        caption: req.body.caption,
        image_url: result.url,
        userId: req.body.id
  })
        
    // Render result page with image
  }).then((post) => res.redirect('index', { image: result.url }));
})

app.post('/', isLoggedIn, uploads.single('inputFile'), (req, res) => {
  console.log('On POST route');
  // console.log(req.body)
  // get an input from user
  let file = req.file.path;
  // console.log(file);

  
  cloudinary.uploader.upload(file, (result) => {
    // console.log(result);
        
    db.post.create({
        caption: req.body.caption,
        image_url: result.url,
        userId: req.body.id
  })
        
    // Render result page with image
  }).then((post) => res.render('index', { image: result.url }));
})

app.get('/profile', isLoggedIn, (req, res) => {
  console.log(res.locals.alerts);
  db.post.findAll()
  .then((posts) => {
    const postArray = posts.map(post => {
      return post.get();
    })
    // console.log(postArray);    
    res.render('profile', { posts: postArray });
  })
});

// router.get('/:id', (req, res) => {
//   db.post.findOne({
//     include: [db.post],
//     where: {id: req.params.id}
//   }).then((author) => {
//     res.render('authors/show', { author: author })
//   }).catch((error) => {
//     console.log(error)
//     res.status(400).render('main/404')
//   })
// })

app.get('/results', (req, res) => {
  const query = req.query.q;
  axios
    .get(`https://v6.exchangerate-api.com/v6/a66b8aae93f6e7abafe3aab5/latest/${query}`)
    .then(function (response) {
      const currencyPair = `Conversion Rates for ${query}`;
      console.log(response)
      res.render('results', {
        currencyPair,
        results: response.data,
      });
    })
});

app.delete('/:id', isLoggedIn, (req, res) => {
  const id = req.params.id
  db.post.findOne({
    where: { id }
  }).then((foundPost) => {
    foundPost.destroy().then(() => {
      res.redirect('/')
    })
  })
})


app.use('/auth', require('./routes/auth'));


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;