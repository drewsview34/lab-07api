
'use strict';
const express=require('express');
const superagent=require('superagent');
const app=express();
const cors=require('cors');


const PORT=process.env.PORT||3000;
require('dotenv').config();

app.use(cors());


//api for location
app.get('/location',(request,response)=>{
  searchToatlong(request.query.data)
    .then(location=>response.send(location))
    .catch((error)=>handelError(error,response));
});

function Location(query,res){
  this.latitude=res.body.results[0].geometry.location.lat;
  this.longitude=res.body.results[0].geometry.location.lng;
  this.formatted_query=res.body.results[0].formatted_address;
  this.search_query=query;

}
function searchToatlong(query){

  const url=`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(res=>{
      return new Location(query,res);
    })
    .catch(error=>handelError(error));
}

app.get('/weather',getWeather);

function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();

}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        return new Weather(day); });

      response.send(weatherSummaries);
    })
    .catch(error=>handelError(error));

}


app.get('/yelp',getYelp);

function getYelp(request,response){

  const url= `https://api.yelp.com/v3/businesses/search?location=${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result=>{

      const yelpSummaries=result.body.businesses.map(item=>{

        return new Yelp(item);
      });
      response.send(yelpSummaries);

    })
    .catch(error=>handelError(error));
}

function Yelp(item){
  this.name=item.name;
  this.rating=item.rating;
  this.price=item.price;
  this.phone=item.phone;
  this.image_url=item.image_url;

}

app.get('/movies',getMovies);

function getMovies(request,response){

  const url= `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request.query.data.search_query}`;
  superagent.get(url)

    .then(resultupdate=>{

      const movieSummaries=resultupdate.body.results.map(item=>{

        return new Movie(item);
      });
      response.send(movieSummaries);

    })
    .catch(error=>handelError(error));
}

function Movie(item){
  this.title=item.title;
  this.overview=item.overview;
  this.average_votes=item.vote_average;
  this.total_votes=item.vote_count;
  this.poster_path=item.poster_path;
  this.release_date=item.release_date;
  this.popularity=item.popularity;
  this.released_on=item.release_data;

}

function handelError(error,res){
  if(res)
    res.status(500).send('error,sorry');
}

app.listen(PORT,()=>{});
