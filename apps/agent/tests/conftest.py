"""Configure imports so tests can import from the agent src directory."""

import importlib
import sys
import types
from pathlib import Path

# The system has a `src` package installed globally that shadows our local
# `src/` directory. Remove it so that the agent's own `src` package is found.
agent_root = Path(__file__).resolve().parents[1]
src_dir = agent_root / "src"

# Remove any pre-existing `src` module from the cache
for key in list(sys.modules):
    if key == "src" or key.startswith("src."):
        del sys.modules[key]

# Ensure agent root is first on the path
if str(agent_root) not in sys.path:
    sys.path.insert(0, str(agent_root))

# Register our local src as a namespace package so submodule imports work
src_mod = types.ModuleType("src")
src_mod.__path__ = [str(src_dir)]
src_mod.__package__ = "src"
sys.modules["src"] = src_mod
