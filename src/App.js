import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Map from './components/Map';
import Search from './components/Search';
import EventList from './components/EventList';
import Banner from './components/Banner';
import getYouTube from './utils/youtube.js';
import keys from './config/apikeys.js';
import $ from 'jquery';
import getloc from './utils/getloc';
import getdate from './utils/getdate';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: { id: { videoId: '' }, snippet: { title: '' } },
      events: [],
      currentEvent: 0,
      fail: false,
      startDate: getdate('yyyy-mm-dd'),
      endDate: getdate('yyyy-mm-dd'),
      lat: null,
      lng: null,
    };

    getloc((currlocation) => {
      this.getQuery(currlocation, this.state.startDate, this.state.endDate, 'music');
    });
  }

  getQuery(city, start, end, catStr) { //eslint-disable-line
    const formattedStart = start.split('-').join('');
    let dateRange = formattedStart + '00-'; //eslint-disable-line
    if (!end) {
      dateRange = dateRange + formattedStart + '00'; //eslint-disable-line
    } else {
      const formattedEnd = end.split('-').join('');
      dateRange = dateRange + formattedEnd + '00'; //eslint-disable-line
    }
    console.log('cats are : ', catStr);
    const options = {
      where: city,
      q: catStr,
      page_size: 20,
      sort_order: 'popularity',
      date: dateRange,
      within: 7,
      units: 'miles',
    };
    $.ajax({
      url: '/api/events/getList',
      type: 'GET',
      data: options,
      contentType: 'application/json',
      success: (data) => {
        this.setState({ fail: false });
        console.log('call to server successful');
        if (data) {
          // The following two lines of code are because when only a single event is returned,
          // it is returned as an object, not as an array with an object as its only element.
          let eventList = [];
          eventList = eventList.concat(data);
          // Use method to set the state -- will have side-effect of changing current event
          // And thereby fixing the map and video
          this.changeEvents( eventList );
        } else {
          this.setState({ fail: true });
        }
      },
      error: (data) => {
        console.error('server AJAX failed to GET');
        console.log('problem is ', JSON.parse(data.responseText));
        console.log(JSON.parse(data.responseText));
      },
    });
  }

  changeLatLng(lat, lng) {
    this.setState({
      lat,
      lng,
    });
  }

  changeCurrEvent(eventIdx) {
    const events = this.state.events;
    this.setState({
      currentEvent: eventIdx,
    });
    this.searchYouTube(events[eventIdx].title, this.changeVideo.bind(this));
    this.changeLatLng(events[eventIdx].latitude, events[eventIdx].longitude);
  }

  changeEvents(events) {
    this.setState({
      events,
    });
    // Reset the current event to the 0th whenever we get a new event list.
    this.changeCurrEvent(0);
  }

  changeVideo(video) {
    console.log("changevideo:", video);
    this.setState({
      video,
    });
  }

  searchYouTube(search, callback) {
    const options = {
      query: search,
      max: 1,
    };

    $.ajax({
      url: '/api/youtube',
      type: 'GET',
      data: options,
      contentType: 'application/json',
      success: (data) => {
        this.setState({ fail: false });
        console.log('call to youtube successful');
        console.log("from serverjs youtube", data);
        callback(data.items[0]);
      },
      error: (data) => {
        console.error('server youtube failed to GET');
        console.log('problem is ', JSON.parse(data.responseText));
        console.log(JSON.parse(data.responseText));
      },
    });
  }

  /*eslint-disable */
  render() {
    return (
      <container>
        <Banner />
        <div className="app">
          <a name="mainApp"/>
          <div className="col-xs-12">
            <Search getQuery={ this.getQuery.bind(this) } />
          </div>
          <br/>
          <br/>
          <div className="col-xs-12">
          <h4 className="mapError">{ this.state.fail ? 'There are no events for this time and place. Please try again' : ''}</h4>
            <Map parentState={ this.state } changeLatLng={ this.changeLatLng.bind(this) } changeCurrEvent={ this.changeCurrEvent.bind(this) }/>
            <EventList data={ this.state.events } video={ this.state.video } currentEvent={ this.state.currentEvent } changeCurrEvent={ this.changeCurrEvent.bind(this) }/>
          </div>
        </div>
      </container>
    );
  }
  /*eslint-enable */
}

ReactDOM.render(<App />, document.getElementById('app'));
