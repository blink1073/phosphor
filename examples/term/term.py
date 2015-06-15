import webbrowser
import tornado.web

from terminado import TermSocket, SingleTermManager


class TerminalPageHandler(tornado.web.RequestHandler):

    def get(self):
        return self.render("index.html", static=self.static_url,
                           ws_url_path="/websocket")


def main(argv):
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
    else:
        cmd = 'bash'
    term_manager = SingleTermManager(shell_command=[cmd])

    handlers = [
        (r"/websocket", TermSocket,
         {'term_manager': term_manager}),
        (r"/dist/(.*)", tornado.web.StaticFileHandler,
         {'path': '../../dist'}),
        (r"/build/(.*)", tornado.web.StaticFileHandler,
         {'path': 'build'}),
        (r"/node_modules/(.*)", tornado.web.StaticFileHandler,
         {'path': '../../node_modules'}),
        (r"/", TerminalPageHandler),
    ]
    app = tornado.web.Application(handlers, static_path='build',
                                  template_path='.')

    app.listen(8765, 'localhost')
    url = "http://localhost:8765/"
    loop = tornado.ioloop.IOLoop.instance()
    loop.add_callback(webbrowser.open, url)
    try:
        loop.start()
    except KeyboardInterrupt:
        print(" Shutting down on SIGINT")
    finally:
        term_manager.shutdown()
        loop.close()

if __name__ == '__main__':
    import sys
    main(sys.argv)
