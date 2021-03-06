# Generated by Django 2.1.5 on 2019-02-04 21:10

import django.db.models.deletion
import sfdo_template_helpers.fields
from django.db import migrations, models


def forwards(apps, schema_editor):
    Plan = apps.get_model("api", "Plan")
    Step = apps.get_model("api", "Step")
    Version = apps.get_model("api", "Version")

    for plan in Plan.objects.all():
        plan.translations.create(
            language_code="en-us",
            title=plan.title,
            preflight_message=plan.preflight_message,
            post_install_message=plan.post_install_message,
        )

    for step in Step.objects.all():
        step.translations.create(
            language_code="en-us", name=step.name, description=step.description
        )

    for version in Version.objects.all():
        version.translations.create(
            language_code="en-us", description=version.description
        )


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [("api", "0048_add_translations")]

    operations = [
        migrations.CreateModel(
            name="PlanTranslation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language_code",
                    models.CharField(
                        db_index=True, max_length=15, verbose_name="Language"
                    ),
                ),
                ("title", models.CharField(max_length=128)),
                (
                    "preflight_message",
                    sfdo_template_helpers.fields.MarkdownField(
                        blank=True, property_suffix="_markdown"
                    ),
                ),
                (
                    "post_install_message",
                    sfdo_template_helpers.fields.MarkdownField(
                        blank=True, property_suffix="_markdown"
                    ),
                ),
            ],
            options={
                "verbose_name": "plan Translation",
                "db_table": "api_plan_translation",
                "db_tablespace": "",
                "managed": True,
                "default_permissions": (),
            },
        ),
        migrations.CreateModel(
            name="StepTranslation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language_code",
                    models.CharField(
                        db_index=True, max_length=15, verbose_name="Language"
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="Customer facing label", max_length=1024
                    ),
                ),
                ("description", models.TextField(blank=True)),
            ],
            options={
                "verbose_name": "step Translation",
                "db_table": "api_step_translation",
                "db_tablespace": "",
                "managed": True,
                "default_permissions": (),
            },
        ),
        migrations.CreateModel(
            name="VersionTranslation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language_code",
                    models.CharField(
                        db_index=True, max_length=15, verbose_name="Language"
                    ),
                ),
                ("description", models.TextField(blank=True)),
            ],
            options={
                "verbose_name": "version Translation",
                "db_table": "api_version_translation",
                "db_tablespace": "",
                "managed": True,
                "default_permissions": (),
            },
        ),
        migrations.AddField(
            model_name="versiontranslation",
            name="master",
            field=models.ForeignKey(
                editable=False,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="translations",
                to="api.Version",
            ),
        ),
        migrations.AddField(
            model_name="steptranslation",
            name="master",
            field=models.ForeignKey(
                editable=False,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="translations",
                to="api.Step",
            ),
        ),
        migrations.AddField(
            model_name="plantranslation",
            name="master",
            field=models.ForeignKey(
                editable=False,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="translations",
                to="api.Plan",
            ),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.RemoveField(model_name="plan", name="post_install_message"),
        migrations.RemoveField(model_name="plan", name="preflight_message"),
        migrations.RemoveField(model_name="plan", name="title"),
        migrations.RemoveField(model_name="step", name="description"),
        migrations.RemoveField(model_name="step", name="name"),
        migrations.RemoveField(model_name="version", name="description"),
        migrations.AlterUniqueTogether(
            name="versiontranslation", unique_together={("language_code", "master")}
        ),
        migrations.AlterUniqueTogether(
            name="steptranslation", unique_together={("language_code", "master")}
        ),
        migrations.AlterUniqueTogether(
            name="plantranslation", unique_together={("language_code", "master")}
        ),
    ]
