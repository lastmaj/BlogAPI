var mongoose           = require("mongoose"),
    expressSanitizer   = require("express-sanitizer"),
    bodyParser         = require("body-parser"),
    app                = require("express")();

//connect to the db
mongoose.connect("mongodb://localhost:27017/rest_blog", {useNewUrlParser: true});

//mongoose Model config
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: {true: "Title is missing!"}
    },
    image: String,
    body: {
        type: String,
        required: {true: "Body is missing!"}
    },
    created: {type: Date, default: Date.now()},
    lastModified: {type: Date, default: Date.now()}
});

var Blog = mongoose.model("Blog", blogSchema);

//json formatting
app.set('json spaces', 2);

//sanitizer
app.use(expressSanitizer());

//body parser
app.use(bodyParser.json());

//ROUTES
app.get("/api/blogs", (req, res)=>{
    Blog.find({}, (err, blogs) => {
        if(err){
            res.end(err);
        }
        else {
            res.json(blogs);
        }
    });
});

app.get("/api/blogs/:id", (req, res) => {
   Blog.findById(req.params.id, (err, blog) => {
       if(err){
           res.json(err);
       } else{
           res.json(blog);
       }
   });
});

app.post("/api/blogs", (req, res) => {
    req.body.body = req.sanitize(req.body.body);
    Blog.create(req.body, (err, blog) => {
        if(err){
            res.json(err);
        } else {
            res.json({
                'id' : blog.id,
                'reference' : blog.title,
                'href' : "https://first-thelastmaj.c9users.io/blogs/"+blog.id,
                'errors' : err
            });
        }
    });
});

app.put("/api/blogs/:id", (req, res)=>{
    req.body.body = req.sanitize(req.body.body);
    req.body.lastModified = Date.now();
    
    Blog.findOneAndUpdate({ _id: req.params.id }, req.body, (err, blog) => {
        if (err){
            res.json(err);
        } else {
            res.json({
                'id' : blog.id,
                'href' : "https://first-thelastmaj.c9users.io/api/blogs/"+blog.id,
                'errors' : err
            });
        }
    });
});

app.delete("/api/blogs/:id", (req, res)=> {
   Blog.findByIdAndRemove(req.params.id, (err) => {
      if(err){
          res.json(err);
      } else {
          res.json({
              'status' : res.statusCode,
              
              //the api should be helpful : suggesting a new place to go to
              //assuring that we will keep a context for the delete request
              'container href' : "https://first-thelastmaj.c9users.io/api/blogs/"
          });
      }
   });
});



app.listen(process.env.PORT, process.env.IP);