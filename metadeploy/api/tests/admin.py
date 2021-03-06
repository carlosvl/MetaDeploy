import pytest
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory

from ..admin import AllowedListOrgAdmin, PlanAdmin, PlanMixin
from ..models import AllowedListOrg, Plan


class Dummy:
    pass


class TestPlanMixin:
    def test_plan_title(self):
        obj = Dummy()
        obj.plan = Dummy()
        obj.plan.title = "A Plan"
        mixin = PlanMixin()
        assert mixin.plan_title(obj) == obj.plan.title

    def test_product(self):
        obj = Dummy()
        obj.plan = Dummy()
        obj.plan.version = Dummy()
        obj.plan.version.product = "A Product"
        mixin = PlanMixin()
        assert mixin.product(obj) == obj.plan.version.product

    def test_version(self):
        obj = Dummy()
        obj.plan = Dummy()
        obj.plan.version = Dummy()
        obj.plan.version.label = "A Version"
        mixin = PlanMixin()
        assert mixin.version(obj) == obj.plan.version.label


@pytest.mark.django_db
class TestAllowedListOrgAdmin:
    def test_save_model(
        self, user_factory, allowed_list_factory, allowed_list_org_factory
    ):
        user = user_factory()
        site = AdminSite()
        allowed_list = allowed_list_factory()
        allowed_list_org = AllowedListOrg(
            allowed_list=allowed_list, org_id="00DABCDEFGHIJKL", description="An org"
        )

        admin = AllowedListOrgAdmin(AllowedListOrg, site)
        factory = RequestFactory()
        request = factory.get("/admin")
        request.user = user
        admin.save_model(request, allowed_list_org, admin.get_form(request), False)
        assert allowed_list_org.created_by == user


@pytest.mark.django_db
class TestPlanAdmin:
    def test_product_label(self):
        site = AdminSite()
        admin = PlanAdmin(Plan, site)
        obj = Dummy()
        obj.version = Dummy()
        obj.version.product = "A product"
        assert admin.product(obj) == obj.version.product

    def test_version_label(self):
        site = AdminSite()
        admin = PlanAdmin(Plan, site)
        obj = Dummy()
        obj.version = Dummy()
        obj.version.label = "A version"
        assert admin.version_label(obj) == obj.version.label
