# Steps to install on local computer
Go to repo on Github profile
fork and clone repo
Clone to local machine
git clone https://github.com/zfinnan/trading-app-project-2.git
cd into trading-app-project-2

# Technologies used and approaches taken

The project uses the express framework for node.js to create a back end server in which users can sign up/login to the website in order to see current prices for currencies and post ideas for trades. 

The project makes use of ejs pages for forms to submit to the database and it is deployed using heroku. 

The app also makes use of bootstrap and google fonts so it features a few external stylesheets. 

# Wireframe Logic and Database Design are in separate png files

Here are their links as well 

Wireframe: https://lucid.app/lucidchart/1dc66b18-97e2-4ce6-a392-fccb4352db51/edit?beaconFlowId=050A74446D425276&page=0_0#?folder_id=home&browser=icon

Database Design: https://app.dbdesigner.net/designer/schema/376556

# Routes Examples

```javascript
app.post('/', isLoggedIn, uploads.single('inputFile'), (req, res) => {
  console.log('On POST route');
  let file = req.file.path;
  cloudinary.uploader.upload(file, (result) => {      
    db.post.create({
        caption: req.body.caption,
        image_url: result.url,
        userId: req.body.id
  })
  }).then((post) => res.redirect('/', { image: result.url }));
})

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
```

# Ejs Examples 

```html
<h1 id="indexHeader">Recent Ideas</h1>
<br>
<div class="post">
    <% posts.forEach(function(post) { %>
        <div id="postCaption">
            <h1 class="postCaption" id="indexPostCaption"><%= post.caption %></h1>
            <a id="indexEdit" href="/update/<%= post.id %>">Edit</a>
        </div>
        <img class="images" width="700px" height="500px" src="<%= post.image_url %>" alt="uploaded image"> 
        <form action="/<%= post.id %>?_method=DELETE" method="POST">
            <input id="deleteButton" class="btn-danger" type="submit" value="Remove Idea" >
        </form>
        <br>
    <% }) %>
</div>

<br>
<div class="postSection">
    <form action="/" method="POST" enctype="multipart/form-data">
        <input type="text" name="caption" placeholder="Write a Caption:" id="postText">
        <input type="file" name="inputFile" id="inputFile"> 
        <input type="submit" class="btn btn-primary" id="postSubmit" value="Post">
    </form>
</div>

<h1 id="resultsHeader"><%= currencyPair %></h1>
<div class="container">
<ul>
    <div class="results">
        <div class="conversionRate">
        <% let val_JSON = JSON.stringify(results.conversion_rates) %> 
        <% const JSON2Str = jso => Object.entries(jso).reduce((s,[k,v],i)=>s + (i?',':'') + ` ${k}: ${v}`,'') %>
        <span id="rateText"><%= JSON2Str(results.conversion_rates) %></span><br> 
        </div>
    </div>
</ul> 
```
