var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var BOOKS_COLLECTION = "books";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  db = database;
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});


function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}


app.get("/books", function(req, res) {
	
	db.collection(BOOKS_COLLECTION).find({}).toArray(function(err, docs) {
	    if (err) {
	      handleError(res, err.message, "Failed to get books.");
	    } else {
	      res.status(200).json(docs);
	    }
	  });	
});

app.post("/books", function(req, res) {
	
	var newBook = req.body;
	  newBook.createDate = new Date();
	  
  	db.collection(BOOKS_COLLECTION).find({'ISBN':newBook['ISBN']}).toArray(function(err, docs) {
  	    if (err) {
  	      handleError(res, err.message, "Failed to get books.");
  	    } else {
			if(docs.length==0){
				
  	  		  db.collection(BOOKS_COLLECTION).insertOne(newBook, function(err, doc) {
  	  	  	    if (err) {
  	  	  	      handleError(res, err.message, "Failed to create new book.");
  	  	  	    } else {
  	  	  	      res.status(201).json(doc.ops[0]);
  	  	  	    }
				
			   });
				
			}
			else{
				handleError(res, "", "Book with ISBN entered already exists",409);				
			}
		}
  	  });	  	
});


app.get("/books/:id", function(req, res) {
	
	db.collection(BOOKS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
	    if (err) {
	      handleError(res, err.message, "Failed to get book");
	    } else {
	      res.status(200).json(doc);
	    }
	  });
	
});

app.put("/books/:id", function(req, res) {
	
	var updateDoc = req.body;
	  delete updateDoc._id;

	  db.collection(BOOKS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
	    if (err) {
	      handleError(res, err.message, "Failed to update book");
	    } else {
	      res.status(204).end();
	    }
	  });
	
});

app.delete("/books/:id", function(req, res) {
	
	db.collection(BOOKS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
	    if (err) {
	      handleError(res, err.message, "Failed to delete book");
	    } else {
	      res.status(204).end();
	    }
	  });
});
