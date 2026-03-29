# Replaces legacy MaterialRequest table (from 0002) with the full workflow schema.
# Safe when inventory_materialrequest has no rows (see migration plan).

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('production', '0001_initial'),
        ('inventory', '0002_materialrequest'),
    ]

    operations = [
        migrations.DeleteModel(name='MaterialRequest'),
        migrations.CreateModel(
            name='MaterialRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('request_id', models.CharField(max_length=20, unique=True, verbose_name='Request ID')),
                ('quantity', models.PositiveIntegerField()),
                ('status', models.CharField(
                    choices=[
                        ('Pending', 'Pending'),
                        ('Approved', 'Approved'),
                        ('Ordered', 'Ordered'),
                        ('Fulfilled', 'Fulfilled'),
                    ],
                    default='Pending',
                    max_length=20,
                )),
                ('notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('material', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='material_requests',
                    to='inventory.material',
                )),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='material_requests',
                    to='production.project',
                )),
                ('requester', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='material_requests',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Material Request',
                'verbose_name_plural': 'Material Requests',
                'ordering': ['-created_at', 'request_id'],
            },
        ),
    ]
