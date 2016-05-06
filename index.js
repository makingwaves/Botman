'use strict';

// Quickstart example
// See https://wit.ai/l5t/Quickstart

// When not cloning the `node-wit` repo, replace the `require` like so:
// const Wit = require('node-wit').Wit;
const Wit = require('node-wit').Wit;
const yrf = require('yr.no-forecast');


const forecast = (location, outercb) => {
  return yrf.getWeather(location, function(err, result){
    if(!err){
     return outercb(null, result);
   }
   else {
    return outercb(err);
     
   }
  })
};

const token = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/weather.js <wit-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  say: (sessionId, context, message, cb) => {
    console.log(message);
    cb();
  },
  merge: (sessionId, context, entities, message, cb) => {
    // Retrieve the location entity and store it into a context field
    const loc = firstEntityValue(entities, 'location');
    if (loc) {
      context.loc = loc;
    }
    cb(context);
  },
  error: (sessionId, context, error) => {
    console.log(error.message);
  },
  'getWeather': (sessionId, context, cb) => {
    context.loc= {lat:61.1, lon:10.2};
    forecast(context.loc, function(err, location){
      if(!err){
        
         location.getCurrentSummary(function(err, result){
          context.forecast = result.temperature;
          cb()
        });
        //cb(context);
        return;
      }
    context.forecast = err;
    });
    
  },
};

const client = new Wit(token, actions);
client.interactive();
