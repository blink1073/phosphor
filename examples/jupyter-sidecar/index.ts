/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, S. Chris Colbert
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
module example {

import clientViewportRect = phosphor.utility.clientViewportRect;

import BoxPanel = phosphor.widgets.BoxPanel;
import Direction = phosphor.widgets.Direction;
import Widget = phosphor.widgets.Widget;


//var jmp = require("jmp");
//var katex = require("katex");
//var marked = require("marked");

function formConnectionString(config, channel) {
  var portDelimiter = ":";
  if (config.transport !== "tcp") {
    portDelimiter = "-";
  }
  
  return config.transport + "://" + config.ip + portDelimiter + config[channel + "_port"]; 
}

/**
 * This callback handles jmp.Messages
 * @callback messageCallback
 * @param {jmp.Message} message
 */

/**
 * @class IOPubSession
 * @classdesc Keeps a session with an IOPub channel
 * @param {Object} connectionJSON Connection information provided by Jupyter
 * @param {messageCallback} messageCallback Callback that handles messages
 */
function IOPubSession(connectionJSON, cb) {
  	/**
     * Connection information provided by Jupyter
     * @member {Object}
     */
    this.connectionJSON = connectionJSON;
    
    /**
     * Handles messages from the IOPub channel
     * @member {messageCallback}
     */
    this.messageCallback = cb;
    
    /**
     * Jupyter IOPub channel
     * @member {module:jmp~Socket}
     */
    this.iopubSocket = new jmp.Socket(
         "sub",
          this.connectionJSON.signature_scheme.slice("hmac-".length),
          this.connectionJSON.key
    ); 
     
    /**
     * URL for zmq socket
     * @member {string}
     */
    this.iopubURL = formConnectionString(this.connectionJSON, "iopub");

    console.log('Connecting to ' + this.iopubURL);

    this.iopubSocket.connect(this.iopubURL);
    this.iopubSocket.subscribe('');
     
    this.iopubSocket.on("message", cb);
}

/**
 * @class RichDisplay
 * @classdesc Assists in choosing the most rich display of the data
 * @param {Object} data The data field of an IOPub message's content (msg.content.data), keys are mimetypes
 * 
 * MIME types supported (in display precedence):
 *   application/javascript
 *   text/html
 *   text/markdown
 *   text/latex
 *   image/svg+xml
 *   image/png
 *   image/jpeg
 *   application/json
 *   text/plain
 * 
 */
function RichDisplay(data){
  /**
   * Jupyter display data
   * @member {Object} 
   */
  this.data = data;
  
}

RichDisplay.prototype.render = function(webContents) {
  
    // JavaScript is our most rich display type
    if ("application/javascript" in this.data) {
      var code = this.data["application/javascript"];
      webContents.executeJavaScript(code);
      return;
    }
  
    var html = null;
    
    if("text/html" in this.data){
      html = this.data["text/html"];
    } else if ("text/markdown" in this.data) {
      html = marked(this.data['text/markdown']);
    } else if ("text/latex" in this.data) {
      html = katex.renderToString(this.data["text/latex"]);
    } else if ("image/svg+xml" in this.data) {
      html = "<img src='data:image/svg+xml;base64," + this.data["image/svg+xml"] + "'/>";
    } else if ("image/png" in this.data) {
      html = "<img src='data:image/png;base64," + this.data["image/png"] + "'/>";
    } else if ("image/jpeg" in this.data) {
      html = "<img src='data:image/jpeg;base64," + this.data["image/jpeg"] + "'/>";
    } else if ("application/json" in this.data) {
      html = "<pre>" + JSON.stringify(this.data["application/json"]) + "</pre>";
    } else if ("text/plain" in this.data) {
      html = this.data["text/plain"];
    } else {
      console.log(this.data);
    }
    
    webContents.send('display', html);
};


function main(): void {
  // Parse out a kernel-####.json argument
  var argv = require('minimist')(process.argv.slice(2));
  var connFile = argv._[0];
  var config = require(connFile);

  session = new IOPubSession(config, function(msg){
      // Get display data if available
      if("content" in msg && "data" in msg.content) {
        var richDisplay = new jupyter.RichDisplay(msg.content.data);
        richDisplay.render(sideCar.webContents);
    }

  });
}


window.onload = main;

} // module example


