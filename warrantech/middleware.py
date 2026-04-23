from django.http import HttpResponseRedirect

class LocalhostRedirectMiddleware:
    """
    Redirects 127.0.0.1 to localhost to ensure consistent localStorage state.
    Browsers treat 127.0.0.1 and localhost as different origins, leading to
    different authentication states and outputs. This middleware forces
    everyone to localhost.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        if host.startswith('127.0.0.1'):
            new_url = request.build_absolute_uri().replace('127.0.0.1', 'localhost', 1)
            return HttpResponseRedirect(new_url)
        return self.get_response(request)
