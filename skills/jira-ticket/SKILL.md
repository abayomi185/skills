---
name: jira-ticket
description: Use when creating or refining Jira tickets, writing their acceptance criteria or test plans, or linking Jira work to a pull request. Apply Yomi's concise ticket format and link the ticket and PR in both directions.
---

# Jira tickets

Prefer a short, practical ticket that a tester can follow over an engineering report.

## Workflow

1. Read the current ticket before editing. Preserve the user's refinements and existing test results. For a new ticket, infer the project from repository history or related tickets. Resolve project and issue type from Jira rather than assuming one project applies to every repository.
2. Write the description in the format below. Keep the opening to one or two sentences, acceptance criteria numbered, and testing to a few straightforward bullets. Include concrete thresholds when needed to tell whether the change works.
3. Create or update the ticket through the available Jira tools. Keep the test plan in the ticket description unless the user requests a separate issue.
4. If a related PR exists, add its link to the ticket and add a visible `[KEY-123](ticket-url)` link to the PR description. Preserve the rest of the PR description. Do this even when the ticket was created after the PR; neither direction alone completes the task. If no PR exists, report that fact without creating one unless requested.
5. Verify the saved ticket and, when applicable, the PR link. Finish with the ticket link and a brief confirmation.

## Description format

```markdown
One or two sentences describing the user-visible change.

[PR #123](actual-pr-url)

## Acceptance criteria

Brief context if needed.

1. Observable expected behavior.
2. Observable expected behavior.

## Test plan

- Open the relevant scenario or screen and edit the affected inputs.
- Trigger the changed behavior and check the expected result.
- Return to a normal value or state and check that the result clears or resets, where applicable.

| **Test** | **Status** |
| --- | --- |
| AC1 | Dev Staging |
| AC2 | Dev Staging |
```

Adapt the test steps to the actual feature rather than copying input-validation wording into unrelated work. Add one table row per numbered acceptance criterion. `Dev Staging` names the environments to track, not a claim that either passed. Preserve recorded results on edits; mark success only from actual evidence or user-reported results.

For validation changes, the default test plan is simply to open the relevant scenario, enter values that trigger validation, check the warnings or errors, then return to normal values and check they clear. Do not expand it into a boundary matrix unless requested.

Keep implementation details, local commands, smoke-test counts, dependency diagnostics and exhaustive regression cases out of the default ticket. Put engineering evidence in the PR. Mention a blocker in the ticket only when it affects the user's acceptance decision, and keep it short.
