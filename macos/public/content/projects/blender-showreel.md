# Blender MCP showreel

Four GLB models of desk objects — MacBook, keyboard, mouse, divergence meter — animated procedurally through Blender via the Model Context Protocol.

## Pipeline

1. Agent picks a model + animation idea
2. Calls Blender over MCP to set keyframes and material drivers
3. Renders a preview viewport
4. Exports GLB with baked animation
5. Web shell loads the GLBs in a Three.js desk scene

## Why MCP

MCP means my animation tooling is portable. Same tool calls work from Claude Code, a custom agent, or a plain CLI. The Blender instance becomes a long-running service I can orchestrate.

## What it unlocked

Procedural product animations without hand-keyframing. One prompt → 30-second loopable showreel. Cheap iteration on lighting presets and camera paths.
