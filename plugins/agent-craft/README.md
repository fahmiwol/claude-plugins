# Agent Craft

**Four methods for building AI agent systems that hold up.**

Not prompts, not a framework. Four operating methods, each distilled from something that
went wrong in production and was then fixed properly. They install as skills, so Claude
reaches for them when the situation matches rather than when you remember to ask.

## Install

```
/plugin marketplace add fahmiwol/claude-plugins
/plugin install agent-craft@fahmiwol
```

Nothing to configure. No MCP server, no API key, no telemetry — these are methods, and
they work with whatever model and stack you already have.

## What is in it

### `backbone-agent-design`
**Make a small, cheap model behave like a much larger one** by moving intelligence out of
the weights and into the system around them. A quality formula, a catalogue of seventeen
facilities across seven layers, and a rollout ordered by impact rather than by ease.

Reach for it when a 4B or 7B model hallucinates, loses the thread, ignores instructions,
or simply feels dumber than the benchmark said it was — and when scaling the model is not
an option you can afford.

### `disciplined-execution`
**Eight gates every non-trivial change passes** before it counts as done: design, offline
test on real data, build, static check, careful deploy, live verification, iterate or roll
back, record.

It exists because of a specific class of failure: a change that "looked fine" and shipped
a regression, a default that silently reverted, a quick tweak that backfired, a fix
claimed without ever reproducing the failing input. If "it looked fine" is not proof in
your project, this is the loop.

### `local-gpu-bridge`
**Let an always-on CPU server borrow the GPU in your desk** over a reverse SSH tunnel. No
port forwarding, no rented GPU, and structured so the GPU can only ever add speed — never
lose work when the laptop closes.

Includes the failures that cost the original build a day: custom Docker bridge subnets,
firewall rules that block container-to-host, `GatewayPorts`, and the RAM-OOM that surfaces
as a plain 500.

### `repo-cartography-handoff`
**Hand a large repository to the next agent without losing the map.** A canonical tier
list, folder roles, the actual runtime flow, the places where two documents contradict
each other, and an honest coverage section that says what was *not* read.

For onboarding, for handing work between agents or people, and for the moment a codebase
has grown past what one context window can hold.

## Where these came from

Each is written up from real work on a self-hosted agent platform: a small owned model
that had to punch above its weight, deploys that had to stop breaking, a VPS with no GPU
and a gaming machine sitting idle, and a repository that outgrew any single reading of it.

The origin notes inside each skill name the specific failures, on purpose. A method with
no scar tissue behind it is just an opinion.

## Licence

MIT.

## Related

- **[ship-check](../ship-check)** — verify what you shipped is what people receive: three
  read-only tools plus the clean-state checklist.
- Tools and kits: [fahmiwolf.gumroad.com](https://fahmiwolf.gumroad.com)
