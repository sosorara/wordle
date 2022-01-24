from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
from game.models import UserInfo


def index(request):
    # title = UserInfo.objects.all()
    # return HttpResponse(title)

    user = UserInfo.objects.values()[0]
    return render(request, 'game/index.html', {'user': user})
