var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';



/* GET home page. */
router.get('/', function(req, res, next) {

    // const apiKey = 'fec8b5ab27b292a68294261bb21b04a5';

    request.get(nowPlayingUrl, (error,response,movieData)=>{
        var movieData = JSON.parse(movieData);
        res.render('index', { movieData: movieData.results, imageBaseUrl: imageBaseUrl,
        titleHeader:'welcome'});
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

module.exports = router;
