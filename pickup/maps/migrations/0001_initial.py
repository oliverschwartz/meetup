# Generated by Django 2.2 on 2019-04-03 13:38

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_descr', models.CharField(default='', max_length=100)),
                ('event_name', models.CharField(default='', max_length=50)),
                ('event_type', models.CharField(choices=[('Party', 'Party'), ('Concert', 'Concert'), ('Study', 'Study'), ('Speech', 'Speech'), ('Meal', 'Meal')], max_length=50)),
                ('datetime', models.DateTimeField(null=True)),
                ('location', models.CharField(default='', max_length=50)),
                ('lng', models.FloatField(default=-1)),
                ('lat', models.FloatField(default=-1)),
                ('user', models.ForeignKey(default=-1, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
                ('users_going', models.ManyToManyField(related_name='upcoming_events', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
