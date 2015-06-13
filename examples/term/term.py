import webbrowser
import tornado.web

from terminado import TermSocket, SingleTermManager


class TerminalPageHandler(tornado.web.RequestHandler):
    def get(self):
        return self.render("index.html", static=self.static_url,
                           ws_url_path="/websocket")


def main(argv):
    term_manager = SingleTermManager(shell_command=['bash'])
    handlers = [
                (r"/websocket", TermSocket,
                     {'term_manager': term_manager}),
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
    main([])
