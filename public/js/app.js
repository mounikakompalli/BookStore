
// Angular Module Creation
angular.module("BookStoreApp", ['ngRoute','ui.bootstrap'])
		.run(function($rootScope, $location, $anchorScroll, $routeParams) {
  		  	$rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    			
				if(oldRoute.loadedTemplateUrl == "templates/book-form.html")
				{
					$location.hash('book-from');
	    			$anchorScroll();
				}
				else
				{
					$location.hash('body-container');
	    			$anchorScroll();
				}
  		  	});
	})
    .config(function($routeProvider) {
        $routeProvider
            .when("/new/book", {
                controller: "NewBookController",
                templateUrl: "templates/book-form.html"
            })
            .when("/books/edit", {
                controller: "EditBookController",
                templateUrl: "templates/book-form.html"
            })
            .when("/book/return", {
                controller: "ReturnBookController",
                templateUrl: "templates/return-book.html"
            })
           .otherwise({
                redirectTo: "/",
			   	controller: "ListController"
            })
    })
// Books Service Creation
    .service("Books", function($http) {
        
		// Get all books
		this.getBooks = function() {
            return $http.get("/books").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding books.");
                });
        }
		
		// Variable to store selected book. Used to pass between controllers.
		this.selectedBook = ""
		
        // Create new book
		this.createBook = function(book) {
            return $http.post("/books", book).
                then(function(response) {
                    return response;
                }, function(response) {
                    return response;
                });
        }
		
		// Get particular book using id
        this.getBook = function(bookId) {
            var url = "/books/" + bookId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this book.");
                });
        }
		
		// Update Particular book
        this.editBook = function(book) {
            var url = "/books/" + book._id
            console.log(book._id);
            return $http.put(url, book).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this book.");
                    console.log(response);
                });
        }
		
		// Delete book
        this.deleteBook = function(bookId) {
            var url = "/books/" + bookId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
		
		
		
	})
	// Controller for new book creation
    .controller("NewBookController",function($scope,$rootScope, $location, Books,$anchorScroll) {
        
		$scope.editMode = false;
		
		$scope.back = function() {
            $location.path("#/");
        }
		
		$scope.today = function() {
		    $scope.publishedDate = new Date();
		};
		
		$scope.today();

		$scope.clear = function() {
		    $scope.publishedDate = null;
		};

		$scope.inlineOptions = {
		    customClass: getDayClass,
		    minDate: new Date(),
		    showWeeks: true
		};

		$scope.dateOptions = {
		    formatYear: 'yy',
		    maxDate: new Date(),
		    minDate: new Date(1900, 5, 22),
		    startingDay: 1
		};

		
		  $scope.toggleMin = function() {
		    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
		    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
		  };

		  $scope.toggleMin();
		 
		  $scope.open = function() {
		    $scope.popup.opened = true;
		  };

		  $scope.setDate = function(year, month, day) {
		    $scope.publishedDate = new Date(year, month, day);
		  };

		  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		  $scope.format = $scope.formats[0];
		  $scope.altInputFormats = ['M!/d!/yyyy'];
		 
		 
		  $scope.popup = {
		    opened: false
		  };

		  function getDayClass(data) {
		    var date = data.date,
		      mode = data.mode;
		    if (mode === 'day') {
		      var dayToCheck = new Date(date).setHours(0,0,0,0);

		      for (var i = 0; i < $scope.events.length; i++) {
		        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

		        if (dayToCheck === currentDay) {
		          return $scope.events[i].status;
		        }
		      }
		    }

		    return '';
		  };
        $scope.saveBook = function(book) {
			
			book["issueHistory"]=[];
			book["noOfBooksIssued"] = book["issueHistory"].length;
	            Books.createBook(book).then(function(doc) {
					
					if(doc.status != 409){
						$rootScope.$emit("reloadTable", {});
						$location.path("#/");
					}
					else if(doc.status == 409){
						alert(doc.data.error)
					}  
	            }, function(response) {
	                alert(response);
	            });		
        }		
    })
	// Controller for Editing Book
	.controller("EditBookController", function($scope, $routeParams, $location,Books,$anchorScroll,$rootScope) {
		
        $scope.editMode = true;
		Books.getBook(Books.selectedBook._id).then(function(doc) {
            $scope.book = doc.data;
			$scope.book.publishedDate = new Date($scope.book.publishedDate)
			
        }, function(response) {
            alert(response);
        });
		
	  $scope.setDate = function(year, month, day) {
	    $scope.publishedDate = new Date(year, month, day);
	  };

        $scope.saveBook = function(book) {
            
			Books.editBook(book);
			Books.getBooks().then(function(books){
				$scope.books = books.data;
			});
			$rootScope.$emit("reloadTable", {});
			$location.path("#/");
            $scope.editMode = false;
			$location.hash('body-container');
			$anchorScroll();
        }
		
		$scope.errorHandle = function(){
			
			if($scope.book.numberOfBooks < $scope.book.noOfBooksIssued)
				$scope.error = "Number of books should  be equal to or greater than number of books issued";
			else
			 	$scope.error ="";
		}

        
    })
	// Controller to display all Books
    .controller("ListController", function($scope,$rootScope,$location,Books,$route,$anchorScroll) {
        
		$scope.getBookData = function(){
			Books.getBooks().then(function(books){
				$scope.books = books.data;
			});
		}
		
		$scope.getBookData();
		
		$rootScope.$on("reloadTable",function(){
			$scope.getBookData();
		});

		$scope.setClickedRow = function(book){
			
			if($scope.selectedRow == book)
				$scope.selectedRow = null;
			else
				$scope.selectedRow = book;
			Books.selectedBook = $scope.selectedRow;
		}
		
        $scope.addBook = function() {
            $location.path("/new/book");
        }
		
        $scope.editBook = function() {
            $location.path("/books/edit");
        }
		
        $scope.deleteBook = function() {
			Books.deleteBook(Books.selectedBook._id);
			Books.getBooks().then(function(books){
				$scope.books = books.data;
			});
			$location.hash('body-container');
			$anchorScroll();
			
        }
		
		$scope.enableButton = function(book){
			
			if(!book)
				return true;
			else{
				
				if(book.noOfBooksIssued !=0 )
					return true;
				else
					return false;
			}
		}
		
		$scope.bookIssue = function(book){
			
			var bookTranscation ={};
			
			bookTranscation["bookId"] = book._id;
			bookTranscation["transactionId"] = book.issueHistory.length +1;
			bookTranscation["tractionType"] = "issue";
			bookTranscation["transactionDate"] = new Date().toString();
			book["noOfBooksIssued"] =  book["noOfBooksIssued"] + 1;
			book.issueHistory.push(bookTranscation);
			Books.editBook(book).then(function(doc){
				$route.reload();
			});
			
		}
		$scope.bookReturn = function(ev,book){
			
			//ev.stopPropagation();
			Books.selectedBook = book;
			if($location.path() == '/book/return')
				$rootScope.$emit("reloadTransactions", {});
			else
				$location.path("/book/return");
		}
    })
	// Controller for return books
    .controller("ReturnBookController", function($scope, $rootScope,$location, Books) {
		
		
		$scope.selectedBook = Books.selectedBook;
		//$location.path("/book/return");
		
		$rootScope.$on("reloadTransactions",function(){
			$scope.selectedBook = Books.selectedBook;
		});
		
		$scope.bookReturn = function(book, transactionId){
			
			
			angular.forEach(book.issueHistory,function(eachTransaction,key){
			
				if(transactionId == eachTransaction.transactionId){
					
					eachTransaction["tractionType"] = "closed";
					book["noOfBooksIssued"] = book["noOfBooksIssued"] - 1;;
					eachTransaction["transactionDate"] = new Date().toString();
					
				}
			})
			Books.editBook(book).then(function(doc){
				$route.reload();
			});
		}
    })