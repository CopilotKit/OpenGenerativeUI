import uuid
from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage, AIMessage
from langgraph.types import Command


@tool
def write_document(document: str, runtime: ToolRuntime) -> Command:
    """
    Write or update a document. Use markdown formatting.
    Do not use italic or strike-through - reserved for diffs.
    Write the complete document, even when making small edits.
    Keep document changes minimal - don't rewrite everything.
    """
    return Command(update={
        "document": document,
        "messages": [
            ToolMessage(
                content="Document written.",
                tool_call_id=runtime.tool_call_id
            ),
            AIMessage(
                content="",
                tool_calls=[{
                    "id": str(uuid.uuid4()),
                    "name": "confirm_changes",
                    "args": {},
                }]
            ),
        ],
    })


document_tools = [write_document]
