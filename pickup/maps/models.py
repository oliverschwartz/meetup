from django.db import models
from django import forms
from django.contrib.auth.models import User
from django.conf import settings

EVENT_CHOICES = (
    ("Party", "Party"),
    ("Concert", "Concert"),
)

class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.PROTECT, default=-1)
    event_descr = models.CharField(max_length=100, default='')
    event_name = models.CharField(max_length=50, default='')
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    number_going = models.IntegerField(default=0)
    location = models.CharField(max_length=50, default='')
    lng = models.FloatField(default=-1)
    lat = models.FloatField(default=-1)
    users_going = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="upcoming_events")