
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






function handelError(error,res){
  if(res)
    res.status(500).send('error,sorry');
}

app.listen(PORT,()=>{});
