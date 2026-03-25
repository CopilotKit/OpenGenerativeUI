"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent

from src.llm_provider import create_llm
from src.query import query_data
from src.todos import AgentState, todo_tools
from src.form import generate_form
from src.templates import template_tools
from skills import load_all_skills

# Load all visualization skills
_skills_text = load_all_skills()

agent = create_agent(
    model=create_llm(),
    tools=[query_data, *todo_tools, generate_form, *template_tools],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt=f"""
        You are a helpful assistant that helps users understand CopilotKit and LangGraph used together.

        Be brief in your explanations of CopilotKit and LangGraph, 1 to 2 sentences.

        When demonstrating charts, always call the query_data tool to fetch all data from the database first.

        ## Visual Response Skills

        You have the ability to produce rich, interactive visual responses using the
        `widgetRenderer` component. When a user asks you to visualize, explain visually,
        diagram, or illustrate something, you MUST use the `widgetRenderer` component
        instead of plain text.

        The `widgetRenderer` component accepts three parameters:
        - title: A short title for the visualization
        - description: A one-sentence description of what the visualization shows
        - html: A self-contained HTML fragment with inline <style> and <script> tags

        The HTML you produce will be rendered inside a sandboxed iframe that already has:
        - CSS variables for light/dark mode theming (use var(--color-text-primary), etc.)
        - Pre-styled form elements (buttons, inputs, sliders look native automatically)
        - Pre-built SVG CSS classes for color ramps (.c-purple, .c-teal, .c-blue, etc.)

        Follow the skills below for how to produce high-quality visuals:

        {_skills_text}

        ## UI Templates

        Users can save generated UIs as reusable templates and apply them later.
        You have backend tools: `save_template`, `list_templates`, `apply_template`, `delete_template`.

        **When a user asks to apply/recreate a template with new data:**
        Check `pending_template` in state — the frontend sets this when the user picks a template.
        If `pending_template` is present (has `id` and `name`):
        1. Call `apply_template(template_id=pending_template["id"])` to retrieve the HTML
        2. Take the returned HTML and COPY IT EXACTLY, only replacing the data values
           (names, numbers, dates, labels, amounts) to match the user's message
        3. Render the modified HTML using `widgetRenderer`
        4. Call `clear_pending_template` to reset the pending state

        If no `pending_template` is set but the user mentions a template by name, use
        `apply_template(name="...")` instead.

        CRITICAL: Do NOT rewrite or generate HTML from scratch. Take the original HTML string,
        find-and-replace ONLY the data values, and pass the result to widgetRenderer.
        This preserves the exact layout and styling of the original template.
        For bar/pie chart templates, use `barChart` or `pieChart` component instead.
    """,
)

graph = agent
