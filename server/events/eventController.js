var Event = require('./eventModel.js');
var Q = require('q');
var key = require('../keys/apikeys.js')
var eventful = require('eventful-node');
var eventful = new eventful.Client(process.env.EVENTFUL_API_KEY || key.eventful);

// This function is for optimization to allow auto-refreshing of event listings
// var updateEvent= Q.nbind(Event.update, Event);

module.exports = {
  // Queries DB for event document, if not found, queries eventful API
  getEvents: function(req, res, next) {
    req.query.where = req.query.where.toUpperCase();
    Event.findOne({
      dateAndPlace: req.query.date + req.query.where + req.query.q,
    })
    .then(function(doc){
      if (doc) {
        console.log("retrieving from database...");
        res.json(doc.eventList);
      } else {
        // calls eventful API
        eventful.searchEvents(req.query,
          function(err, data){
            if (err) {
              console.error("Error received in searchEvents:", err);
            } else {
              if (data) {
                console.log("data returned from eventful.searchEvents");
                // data received from eventful API, return data to map, then store in db
                  // uses $currentDate to pull date and sets value of lastModified column
                  // $currentDate: {
                  //   lastModified: true,
                  // },
                var eventList = data.search.events.event;
                if(!eventList) {
                  res.end();
                } else {
                  for(var i = 0; i < eventList.length; i++){
                    if(eventList[i].description) {
                      eventList[i].description = eventList[i].description.slice(0, 500) + '...';
                    }
                    var used = ['title',
                      'venue_name',
                      'start_time',
                      'stop_time',
                      'venue_address',
                      'city_name',
                      'region_abbr',
                      'url',
                      'latitude',
                      'longitude',
                      'description'];
                    for(var prop in eventList[i]) {
                      if(used.indexOf(prop) === -1){
                        delete eventList[i][prop];
                      }
                    }
                  }

                  Event.create({
                    dateAndPlace: req.query.date + req.query.where + req.query.q,
                    eventList: eventList,
                  }, function (err, list){
                    if (err){
                      console.log("ERROR: ", err);
                    } else {
                      console.log('List Added');
                    }
                  res.json(eventList);
                  });
                }
              }
            }
        });
      }
    });
  }
};
