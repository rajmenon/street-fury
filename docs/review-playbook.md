# Playbook: review in a heavily AI-assisted team

Stacked PRs fix the *shape* of the review. They do not fix everything. Use this as the rest of the system.

## 1. Plan the stack before the agent writes code

The expensive mistake is generating 40 files and then asking review to impose structure.

- `/design` produces a PR Plan DAG. Each node is one independently reviewable layer.
- `/execute-plan` implements nodes in isolated worktrees, reviews each one, then assembles a GitHub or Graphite stack.
- Humans own the layer cuts. Agents own the typing.

If a layer needs a paragraph to explain, split it.

## 2. Separate mechanical review from judgment review

| Machine / agent | Human |
| --- | --- |
| Tests, types, lint, CodeQL | Does this match the design? |
| “This function is unused” | Is this the right state machine? |
| “Missing null check” | Did we just add a new game rule by accident? |
| Restack after a mid-stack fix | Approve the layer |

`/review --pr` is the first pass. A human still submits the GitHub review.

Do not auto-merge logic changes on agent approval alone.

## 3. Review bottom-up, in the layer’s language

1. **Model** — invariants, illegal states, names.
2. **Behavior** — combat, money, auth, anything that can hurt players or data.
3. **Presentation** — copy, layout, leaking global CSS.
4. **Wiring** — feature flags, the arcade path still works, keys do not collide.

A reviewer who starts at the HUD is guessing at rules that were decided below.

## 4. Hunt AI-specific failure modes

These show up constantly in agent diffs and almost never in the PR title:

- Hallucinated APIs, events, or CSS classes
- Tests that encode the implementation instead of the rule
- Deleted or skipped tests instead of a fix
- Happy-path-only error handling
- New dependencies that do not exist or are unmaintained
- Feature logic bolted into a shared file (`main.js`, a god store) instead of a module
- “Helpful” extra scope the prompt did not ask for

The dummy punish bug in this demo is the template: the code looks like a fighting-game AI and is wrong about *when* to act.

## 5. Keep the stack healthy

- Fix a comment on the branch that owns the code. Then `gh stack rebase` / `gh stack push`, or `/pr-babysit`.
- Do not pile a model fix onto the wiring PR “because it is on top.”
- Merge from the bottom, or merge the top to land the whole stack. Mid-stack merge lands everything below and retargets what remains.

## 6. Route review by risk, not by volume

Training HUD CSS does not need the same reviewer as dummy combat.

- Low risk (copy, docs, isolated CSS): one reviewer, agent first pass is enough.
- High risk (combat, money, auth, migrations): senior reviewer, tests required, no “looks good” on a 400-line dump.

Stacks make this possible because risk is per layer.

## 7. Measure the bottleneck you actually have

Track weekly:

- Median lines changed **per PR**, not per feature
- Time to first review
- Review comments that are mechanical vs judgment
- Change-fail rate on agent-authored PRs vs human-authored

If PRs are small and first review is still days, you have a staffing problem, not a stacking problem. If PRs are huge and comments are nits, you have a layering problem.

## 8. What stacking will not save

- A bad design, just sliced
- No tests
- No product owner for the feature
- Agents that rewrite unrelated files
- A culture that rubber-stamps anything that compiles

Put those in `CONTRIBUTING.md` and enforce them in CI and in `/review`. The stack is the delivery shape. The playbook is the quality system.
