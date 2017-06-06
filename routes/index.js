var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
var bcrypt = require('bcrypt-nodejs');



var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.sql.host, user:config.sql.user, password: config.sql.password,
    database: config.sql.database
});

connection.connect();


/* GET home page. */
router.get('/', function(req, res, next) {

    // const apiKey = 'fec8b5ab27b292a68294261bb21b04a5';

    request.get(nowPlayingUrl, (error,response,movieData)=>{
        var movieData = JSON.parse(movieData);

        console.log(req.session);

        res.render('index', { movieData: movieData.results, imageBaseUrl: imageBaseUrl,
        titleHeader:'welcome', sessioninfo:req.session});
    });


});

router.get('/search', function (req, res) {
    res.send('the search page');
});

router.post('/search', function (req, res) {
    //.body is available dut to the body-parser module.  this was installed shen the express ap was created
    //req.body is where the post data is
    //res.json(req.body);
    var termUserSearchedFor = req.body.searchString;
    var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;


    request.get(searchUrl, (error,response,movieData)=>{
        var movieData = JSON.parse(movieData);
        res.render('index', { movieData: movieData.results, imageBaseUrl: imageBaseUrl,
        titleHeader:'search results'});
    });

    //res.send('the search page');
});

//colon indicates wild card which can be referred in req.params

router.get('/movie/:id', function (req,res) {
    var thisMovieId = req.params.id;
    var thisMovieUrl = apiBaseUrl + '/movie/'+ thisMovieId + '?api_key='+config.apiKey;
    var thisCreditsUrl = `${apiBaseUrl}/movie/${thisMovieId}/credits?api_key=${config.apiKey}`;




    request.get(thisMovieUrl, function (error, response, movieData) {
        request.get(thisCreditsUrl, function (error, response, castData) {

        var newMovieData = JSON.parse(movieData);
        var newCastData = JSON.parse(castData);

        //res.json(newMovieData);
        res.render('single-movie', {newMovieData:newMovieData, imageBaseUrl:imageBaseUrl, titleHeader:thisMovieId,
        newCastData:newCastData});

        });
    //res.send(req.params.id);
    });
});

router.get('/register', function (req, res) {

    var message = req.query.msg;

    if(message == 'badEmail'){
        message = 'This email is already registered'
    }

    res.render('register',{message:message});

});


router.post('/registerProcess', function (req,res) {

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var hash = bcrypt.hashSync(password);
    console.log(hash);

    var selectQuery = 'SELECT * FROM users WHERE email = ?';

    connection.query(selectQuery, [email], function (error,results) {

        if(results.length == 0){
            var insertQuery = 'INSERT INTO users (name, email, password) VALUES (?,?,?)';

            connection.query(insertQuery, [name, email, hash], function (error, results) {

                req.session.name = name;
                req.session.email = email;
                req.session.loggedIn = true;

                res.redirect('/?msg=registered');
            });
        }else{
            res.redirect('/register?msg=badEmail');
        }


    });



    //res.json(req.body);

});

router.get('/login', function (req, res) {


    res.render('login', {});
});

router.post('/processLogin', function (req, res) {
    //res.json(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var selectQuery = 'SELECT * FROM users WHERE email = ?';


    connection.query(selectQuery, [email], function (error, results) {
        if(results.length === 1){

            //check if pswd matches
            var match = bcrypt.compareSync(password, results[0].password);

            if(match){
                req.session.loggedIn = true;
                req.session.name = results.name;
                req.session.email = results.email;
                res.redirect('/?msg=loggedin')
            }else{
                res.redirect('/login?msg=badLogin')
            }


        }else{
            //no match
            res.redirect('/login?msg=badLogin')
        }
    })


});


module.exports = router;
