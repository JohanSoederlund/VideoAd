import React, { Component } from "react";
import './App.css';

import AdController from './ad/AdController';


class App extends Component {
  
  //TODO: playback error
  render() {
    let content = "https://media.w3.org/2010/05/sintel/trailer_hd.mp4";
    this.adController =  new AdController(content);
    return (
      <div className="App">
        
        <video className="video" poster="https://media.w3.org/2010/05/sintel/poster.png"
          onPlay={(e) => this.adController.playerEvent(e, this.adController)} 
          onEnded={(e) => this.adController.playerEvent(e, this.adController)} 
          onPause={(e) => this.adController.playerEvent(e, this.adController)}
          
          controls>

          <source 
          src={this.adController.setSource(content)}
          type="video/mp4" />
          Not supported
        </video>
        
      </div>
    );
  }
}

export default App;
