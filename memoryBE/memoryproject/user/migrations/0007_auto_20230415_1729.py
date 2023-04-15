from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('user', '0006_remove_story_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='story',
            name='story_tags',
            field=models.TextField(default='[]'),
        ),
    ]

