# Generated by Django 2.1.7 on 2019-03-23 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0005_auto_20190323_2123'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='event_type',
            field=models.CharField(default='', max_length=50),
        ),
    ]