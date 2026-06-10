from langchain.tools import ToolRuntime, tool
from langchain.messages import ToolMessage
from langgraph.types import Command
from typing import Any, Optional, TypedDict
import uuid
from datetime import datetime


class UITemplate(TypedDict, total=False):
    id: str
    name: str
    description: str
    html: str
    data_description: str
    created_at: str
    version: int
    component_type: Optional[str]
    component_data: Optional[dict[str, Any]]


# Built-in seed templates — must stay in sync with apps/app/src/components/template-library/seed-templates.ts
# Only id, name, description, html, and data_description are needed for apply_template lookups.
SEED_TEMPLATES: list[UITemplate] = [
    {
        "id": "seed-weather-001",
        "name": "Weather",
        "description": "Current weather conditions card with temperature, humidity, wind, and UV index",
        "html": "",  # Populated at module load from _SEED_HTML below
        "data_description": "City name, date, temperature, condition, humidity, wind speed/direction, UV index",
        "version": 1,
    },
    {
        "id": "seed-invoice-001",
        "name": "Invoice Card",
        "description": "Compact invoice card with amount, client info, and action buttons",
        "html": "",
        "data_description": "Title, amount, description, client name, billing month, invoice number, due date",
        "version": 1,
    },
    {
        "id": "seed-dashboard-001",
        "name": "Dashboard",
        "description": "KPI dashboard with metrics cards and bar chart for quarterly performance",
        "html": "",
        "data_description": "Title, subtitle, KPI labels/values/changes, monthly bar chart data, legend items",
        "version": 1,
    },
]

# Load seed HTML from the frontend source so there's a single source of truth.
# If the file isn't available (e.g. in a standalone agent deploy), seeds will
# still be discoverable by name but with empty HTML — the agent can regenerate.
def _load_seed_html() -> None:
    from pathlib import Path

    seed_file = Path(__file__).resolve().parents[2] / "app" / "src" / "components" / "template-library" / "seed-templates.ts"
    if not seed_file.exists():
        return
    text = seed_file.read_text()
    # Map TS variable names to seed IDs
    mapping = {
        "weatherHtml": "seed-weather-001",
        "invoiceHtml": "seed-invoice-001",
        "dashboardHtml": "seed-dashboard-001",
    }
    for var_name, seed_id in mapping.items():
        # Extract template literal content between first ` and last `
        marker = f"const {var_name} = `"
        start = text.find(marker)
        if start == -1:
            continue
        start += len(marker)
        end = text.find("`;", start)
        if end == -1:
            continue
        html = text[start:end]
        for seed in SEED_TEMPLATES:
            if seed["id"] == seed_id:
                seed["html"] = html
                break

_load_seed_html()


# Appended to every apply_template payload: template HTML is a style
# reference saved as a single string, so it may bundle idioms that the
# canonical generateSandboxedUi contract splits across parameters.
TEMPLATE_USAGE_NOTE = (
    "This template HTML is a style reference only. When regenerating via "
    "generateSandboxedUi: move any <style> block content into the css parameter "
    "(the html parameter must not contain <style> blocks); put behavior in "
    "jsFunctions/jsExpressions; and send prompts through the sandbox bridge — "
    "await Websandbox.connection.remote.sendPrompt({ text }) — never a bare "
    "sendPrompt(...) call."
)


@tool
def save_template(
    name: str,
    description: str,
    html: str,
    data_description: str,
    runtime: ToolRuntime,
) -> Command:
    """
    Save a generated UI as a reusable template.
    Call this when the user wants to save a widget/visualization they liked for reuse later.

    Args:
        name: Short name for the template (e.g. "Invoice", "Dashboard")
        description: What the template displays or does
        html: The raw HTML string of the widget to save as a template
        data_description: Description of the data shape this template expects
    """
    templates = list(runtime.state.get("templates", []))

    template: UITemplate = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "html": html,
        "data_description": data_description,
        "created_at": datetime.now().isoformat(),
        "version": 1,
    }
    templates.append(template)

    return Command(update={
        "templates": templates,
        "messages": [
            ToolMessage(
                content=f"Template '{name}' saved successfully (id: {template['id']})",
                tool_call_id=runtime.tool_call_id,
            )
        ],
    })


@tool
def list_templates(runtime: ToolRuntime):
    """
    List all saved UI templates, including built-in seed templates.
    Returns template summaries (id, name, description, data_description).
    """
    state_templates = runtime.state.get("templates", [])
    state_ids = {t["id"] for t in state_templates}
    templates = [*state_templates, *(s for s in SEED_TEMPLATES if s["id"] not in state_ids)]
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "data_description": t["data_description"],
            "version": t["version"],
        }
        for t in templates
    ]


@tool
def apply_template(runtime: ToolRuntime, name: str = "", template_id: str = ""):
    """
    Retrieve a saved template's HTML so you can adapt it with new data.
    After calling this, generate a NEW widget in the same style and render via generateSandboxedUi.

    This tool automatically checks for a pending_template in state (set by the
    frontend when the user picks a template from the library). If pending_template
    is present, it takes priority over name/template_id arguments.

    Also searches built-in seed templates, so users can apply them by name in chat
    even if the frontend hasn't pushed them into agent state yet.

    Args:
        name: The name of the template to apply (fallback if no pending_template)
        template_id: The ID of the template to apply (fallback if no pending_template)
    """
    state_templates = runtime.state.get("templates", [])
    state_ids = {t["id"] for t in state_templates}
    templates = [*state_templates, *(s for s in SEED_TEMPLATES if s["id"] not in state_ids)]

    # Check pending_template from frontend first — this is the most reliable source
    pending = runtime.state.get("pending_template")
    if pending and pending.get("id"):
        template_id = pending["id"]

    # Look up by ID first
    if template_id:
        for t in templates:
            if t["id"] == template_id:
                return {
                    "name": t["name"],
                    "description": t["description"],
                    "html": t["html"],
                    "data_description": t.get("data_description", ""),
                    "usage_note": TEMPLATE_USAGE_NOTE,
                }
        return {"error": f"Template with id '{template_id}' not found"}

    # Look up by name (most recent match)
    if name:
        matches = [t for t in templates if t["name"].lower() == name.lower()]
        if matches:
            t = max(matches, key=lambda x: x.get("created_at", ""))
            return {
                "name": t["name"],
                "description": t["description"],
                "html": t["html"],
                "data_description": t.get("data_description", ""),
                "usage_note": TEMPLATE_USAGE_NOTE,
            }
        return {"error": f"No template named '{name}' found"}

    return {"error": "Provide either a name or template_id"}


@tool
def delete_template(template_id: str, runtime: ToolRuntime) -> Command:
    """
    Delete a saved UI template.

    Args:
        template_id: The ID of the template to delete
    """
    templates = list(runtime.state.get("templates", []))
    original_len = len(templates)
    templates = [t for t in templates if t["id"] != template_id]

    if len(templates) == original_len:
        return Command(update={
            "messages": [
                ToolMessage(
                    content=f"Template with id '{template_id}' not found",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        })

    return Command(update={
        "templates": templates,
        "messages": [
            ToolMessage(
                content=f"Template deleted successfully",
                tool_call_id=runtime.tool_call_id,
            )
        ],
    })


@tool
def clear_pending_template(runtime: ToolRuntime) -> Command:
    """
    Clear the pending_template from state after applying it.
    Call this after you have finished applying a template.
    """
    return Command(update={
        "pending_template": None,
        "messages": [
            ToolMessage(
                content="Pending template cleared",
                tool_call_id=runtime.tool_call_id,
            )
        ],
    })


template_tools = [
    save_template,
    list_templates,
    apply_template,
    delete_template,
    clear_pending_template,
]
