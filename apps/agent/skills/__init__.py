"""
Skill loader — reads .txt skill files from this directory
and exposes them for injection into the agent system prompt.
"""

from pathlib import Path


_SKILLS_DIR = Path(__file__).parent


def load_skill(name: str) -> str:
    """Load a single skill file by name (without extension)."""
    path = _SKILLS_DIR / f"{name}.txt"
    if not path.exists():
        raise FileNotFoundError(f"Skill file not found: {path}")
    return path.read_text()


def load_all_skills(exclude: list[str] | None = None) -> str:
    """Load and concatenate all .txt skill files in this directory.

    Args:
        exclude: Optional list of skill names (without extension) to skip.
    """
    skip = set(exclude or [])
    parts: list[str] = []
    for path in sorted(_SKILLS_DIR.glob("*.txt")):
        if path.stem in skip:
            continue
        parts.append(f"\n\n{'='*60}\n# SKILL: {path.stem}\n{'='*60}\n\n")
        parts.append(path.read_text())
    return "".join(parts)
