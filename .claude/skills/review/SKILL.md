---
name: review
description: Review uncommitted changes and provide feedback
allowed-tools: Bash, Read, Grep, Glob, Task
---

# Review uncommitted changes

Review all my uncommitted changes (staged, unstaged, and untracked files). Your goal is to understand what I'm trying to achieve and give feedback on anything I may have overlooked or forgotten.

## Steps

1. Run `git diff HEAD` to see all committed vs working tree changes. Also run `git status` to identify any untracked files, and read those too.
2. Read any files that are relevant to understanding the full context of the changes (e.g. files that import/export changed symbols, related tests, schema definitions).
3. Infer the intent behind the changes — what feature, fix, or refactor am I working on?
4. Review the changes for:
   - **Missed spots**: places where a related change is needed but wasn't made (e.g. updated a type but not its usages, added a field but didn't handle it in the UI).
   - **Bugs and logic errors**: off-by-ones, null/undefined risks, race conditions, wrong operator, incorrect assumptions.
   - **Incomplete work**: TODO comments, placeholder values, half-finished implementations.
   - **Consistency**: does the new code follow the same patterns and conventions as the surrounding code?
   - **Edge cases**: inputs or states that could break the new code.
   - **Alternative approaches**: was there a simpler, more idiomatic, or otherwise better way to solve this? Only flag if the difference is meaningful, not just stylistic.

## Output format

Start with a one-line summary of what you think I'm working on.

Then list your findings as numbered points grouped by file. For each finding, be specific — reference the exact line or code snippet and explain why it matters. Skip generic advice; only flag things that are concretely actionable.

If everything looks good, say so briefly.
