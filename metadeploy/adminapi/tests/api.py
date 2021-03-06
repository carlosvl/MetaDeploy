import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestProductViewSet:
    def test_get__filter_by_repo_url(self, admin_api_client, product_factory):
        product = product_factory()

        url = "http://testserver/admin/rest"
        response = admin_api_client.get(
            f"{url}/products", params={"repo_url": product.repo_url}
        )

        assert response.status_code == 200
        assert response.json() == {
            "data": [
                {
                    "category": f"{url}/productcategory/{product.category.id}",
                    "click_through_agreement": "",
                    "color": "#FFFFFF",
                    "description": "This is a sample product.",
                    "icon_url": "",
                    "id": product.id,
                    "image": None,
                    "is_listed": True,
                    "order_key": 0,
                    "repo_url": "https://github.com/SFDO-Tooling/CumulusCI-Test",
                    "short_description": "",
                    "slds_icon_category": "",
                    "slds_icon_name": "",
                    "title": "Sample Product 0",
                    "url": f"{url}/products/{product.id}",
                    "visible_to": None,
                }
            ],
            "links": {"next": None, "previous": None},
            "meta": {"page": {"total": 1}},
        }


@pytest.mark.django_db
class TestPlanViewSet:
    def test_list(self, admin_api_client, plan_factory):
        plan = plan_factory()

        url = "http://testserver/admin/rest/plans"
        response = admin_api_client.get(url)

        assert response.status_code == 200
        version_url = f"http://testserver/admin/rest/versions/{plan.version.id}"
        assert response.json() == {
            "data": [
                {
                    "id": f"{plan.id}",
                    "is_listed": True,
                    "preflight_flow_name": "slow_steps_preflight_good",
                    "preflight_message_additional": "",
                    "plan_template": (
                        f"http://testserver/admin/rest/plantemplates/"
                        f"{plan.plan_template.id}"
                    ),
                    "post_install_message_additional": "",
                    "steps": [],
                    "tier": "primary",
                    "title": "Sample plan",
                    "url": f"http://testserver/admin/rest/plans/{plan.id}",
                    "version": version_url,
                    "visible_to": None,
                }
            ],
            "links": {"next": None, "previous": None},
            "meta": {"page": {"total": 1}},
        }

    def test_retrieve(self, admin_api_client, step_factory):
        step = step_factory()
        plan = step.plan
        url = f"http://testserver/admin/rest/plans/{plan.id}"
        response = admin_api_client.get(url)

        assert response.status_code == 200
        assert response.json() == {
            "id": str(plan.id),
            "is_listed": True,
            "preflight_flow_name": "slow_steps_preflight_good",
            "preflight_message_additional": "",
            "plan_template": (
                f"http://testserver/admin/rest/plantemplates/{plan.plan_template.id}"
            ),
            "post_install_message_additional": "",
            "steps": [
                {
                    "description": "",
                    "is_recommended": True,
                    "is_required": True,
                    "kind": "metadata",
                    "name": "Sample step",
                    "path": "main_task",
                    "step_num": "1.0",
                    "task_class": "cumulusci.core.tests.test_tasks._TaskHasResult",
                    "task_config": {},
                }
            ],
            "tier": "primary",
            "title": "Sample plan",
            "url": url,
            "version": f"http://testserver/admin/rest/versions/{plan.version.id}",
            "visible_to": None,
        }

    def test_create(self, admin_api_client, version_factory, plan_template_factory):
        plan_template = plan_template_factory()
        version = version_factory()
        url = "http://testserver/admin/rest/plans"
        response = admin_api_client.post(
            url,
            {
                "title": "Sample plan",
                "plan_template": (
                    f"http://testserver/admin/rest/plantemplates/{plan_template.id}"
                ),
                "preflight_message_additional": "",
                "post_install_message_additional": "",
                "steps": [
                    {
                        "path": "task1",
                        "name": "Task 1",
                        "step_num": "1.0",
                        "task_class": "cumulusci.core.tests.test_tasks._TaskHasResult",
                    },
                    {
                        "path": "task2",
                        "name": "Task 2",
                        "step_num": "1.3",
                        "task_class": "cumulusci.core.tests.test_tasks._TaskHasResult",
                    },
                ],
                "version": f"http://testserver/admin/rest/versions/{version.id}",
            },
            format="json",
        )

        assert response.status_code == 201, response.json()
        json = response.json()
        plan_id = json["id"]
        assert response.json() == {
            "id": plan_id,
            "is_listed": True,
            "preflight_flow_name": "",
            "preflight_message_additional": "",
            "plan_template": (
                f"http://testserver/admin/rest/plantemplates/{plan_template.id}"
            ),
            "post_install_message_additional": "",
            "steps": [
                {
                    "description": "",
                    "is_recommended": True,
                    "is_required": True,
                    "kind": "metadata",
                    "name": "Task 1",
                    "path": "task1",
                    "step_num": "1.0",
                    "task_class": "cumulusci.core.tests.test_tasks._TaskHasResult",
                    "task_config": {},
                },
                {
                    "description": "",
                    "is_recommended": True,
                    "is_required": True,
                    "kind": "metadata",
                    "name": "Task 2",
                    "path": "task2",
                    "step_num": "1.3",
                    "task_class": "cumulusci.core.tests.test_tasks._TaskHasResult",
                    "task_config": {},
                },
            ],
            "tier": "primary",
            "title": "Sample plan",
            "url": f"http://testserver/admin/rest/plans/{plan_id}",
            "version": f"http://testserver/admin/rest/versions/{version.id}",
            "visible_to": None,
        }

    def test_update(self, admin_api_client, plan_factory):
        plan = plan_factory()

        response = admin_api_client.put(
            f"http://testserver/admin/rest/plans/{plan.id}",
            {
                "title": "Sample plan",
                "version": f"http://testserver/admin/rest/versions/{plan.version.id}",
            },
            format="json",
        )
        assert response.status_code == 200, response.json()

        response = admin_api_client.put(
            f"http://testserver/admin/rest/plans/{plan.id}",
            {
                "title": "Sample plan",
                "steps": [],
                "version": f"http://testserver/admin/rest/versions/{plan.version.id}",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_ipaddress_restriction(self, user_factory, plan_factory):
        client = APIClient(REMOTE_ADDR="8.8.8.8")
        user = user_factory(is_staff=True)
        client.force_login(user)
        client.user = user

        plan = plan_factory()
        response = client.get(f"http://testserver/admin/rest/plans/{plan.id}")

        assert response.status_code == 400


@pytest.mark.django_db
class TestAllowedListOrgViewSet:
    def test_get(self, admin_api_client, allowed_list_org_factory):
        allowed_list_org_factory()

        url = "http://testserver/admin/rest/allowedlistorgs"
        response = admin_api_client.get(url)
        assert response.status_code == 200
        assert len(response.json()["data"]) == 1
