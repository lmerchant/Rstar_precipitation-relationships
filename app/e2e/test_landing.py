"""Landing page: reach every category, see the dataset, jump to a subcategory."""
import re

from playwright.sync_api import Page, expect

CATEGORIES = ["People risk", "Data risk", "Dependent infrastructure resilience", "Repository resilience"]


def test_landing_links_to_all_four_categories(page: Page, console_errors):
    page.goto("/index.html")

    expect(page.get_by_role("heading", level=1, name="R* categorizations")).to_be_visible()
    for name in CATEGORIES:
        expect(page.get_by_role("link", name=f"Open {name} →")).to_be_visible()
    assert console_errors == []


def test_landing_shows_the_selected_dataset(page: Page):
    page.goto("/index.html?dataset=ghcn-daily")

    expect(page.get_by_role("heading", name="GHCN-D: Global Historical Climatology Network Daily")).to_be_visible()
    expect(page.get_by_role("combobox", name="Dataset")).to_have_value("ghcn-daily")


def test_category_link_opens_the_category_page(page: Page):
    page.goto("/index.html?dataset=ghcn-daily")

    page.get_by_role("link", name="Open Data risk →").click()

    expect(page).to_have_url(re.compile(r"/data-risk\.html\?dataset=ghcn-daily$"))
    expect(page.get_by_role("heading", level=1, name="D: Data Risk")).to_be_visible()


def test_subcategory_chip_opens_that_card(page: Page):
    page.goto("/index.html?dataset=ghcn-daily")

    page.get_by_role("link", name=re.compile(r"^P-3 \(\d+ evidence items")).click()

    expect(page).to_have_url(re.compile(r"/people-risk\.html\?dataset=ghcn-daily#P-3$"))
    expect(page.get_by_role("button", name="Hide categorization for P-3")).to_have_attribute("aria-expanded", "true")
    expect(page.get_by_role("region", name=re.compile(r"^P-3 Critical undocumented knowledge"))).to_be_visible()


def test_switching_dataset_updates_links_and_details(page: Page):
    page.goto("/index.html?dataset=ghcn-daily")

    page.get_by_role("combobox", name="Dataset").select_option("gpcp-daily")

    expect(page).to_have_url(re.compile(r"\?dataset=gpcp-daily$"))
    expect(page.get_by_text("This dataset has no categorization file yet.")).to_be_visible()
    nav = page.get_by_role("navigation", name="Categories")
    expect(nav.get_by_role("link", name="Data risk")).to_have_attribute("href", "data-risk.html?dataset=gpcp-daily")
