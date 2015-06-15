/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, S. Chris Colbert
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
module example {

import IMessage = phosphor.core.IMessage;

import ResizeMessage = phosphor.widgets.ResizeMessage;
import Widget = phosphor.widgets.Widget;


interface ISize {
  rows: number;
  cols: number;
}


class TermWidget extends Widget {

  constructor(size: ISize, ws_url: string) {
    super();
    this.addClass('TermWidget');
    this._ws = new WebSocket(ws_url);
    this._term = new Terminal({
      cols: size.cols,
      rows: size.rows,
      screenKeys: true,
      useStyle: true
    });

    this._term.open(this.node);

    this._term.on('data', (data: string) => {
      this._ws.send(JSON.stringify(['stdin', data]));
    });

    this._term.on('title', function(title: string) {
      document.title = title;
    });

    this._ws.onopen = (event: MessageEvent) => {
      this._ws.send(JSON.stringify(["set_size", this._term.rows,
        this._term.cols, window.innerHeight, window.innerWidth]));
    };

    this._ws.onmessage = (event: MessageEvent) => {
      var json_msg = JSON.parse(event.data);
      switch (json_msg[0]) {
        case "stdout":
          this._term.write(json_msg[1]);
          break;
        case "disconnect":
          this._term.write("\r\n\r\n[Finished... Term Session]\r\n");
          break;
      }
    };
  }

  dispose(): void {
    this._ws = null;
    this._term = null;
    super.dispose();
  }

  protected onResize(msg: ResizeMessage): void {
    //this._editor.setSize(msg.width, msg.height);
  }

  private _ws: WebSocket;
  private _term: any;
}


function main(): void {

  var protocol = (window.location.protocol.indexOf("https") === 0) ? "wss" : "ws";
  var ws_url = protocol + "://" + window.location.host + "/websocket";

  var term = new TermWidget({rows: 40, cols: 80}, ws_url);

  term.attach(document.getElementById('main'));
  term.fit();

}

window.onload = main;

} // module example
