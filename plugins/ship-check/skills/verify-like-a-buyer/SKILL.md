---
name: verify-like-a-buyer
description: Test a release from a clean state, the way the person receiving it will, instead of from the machine that built it. Use before publishing a package, a zip, a product, a CLI, an extension, or any artefact someone else will install; and when a user reports something the author's own tests pass.
tags: [release, packaging, qa, testing, publishing]
---

# Verify like a buyer, not like the author

Your tests check what you thought to check. **The recipient's first five minutes check
everything else.** Almost every embarrassing release bug lives in that gap, and the gap has a
shape: it is everything the build machine already had and the recipient does not.

The discipline is one rule. **Leave the machine that made it.** Copy the artefact to an empty
directory and use it from there, with nothing inherited.

## The clean-state checklist

Work through these before saying a release is ready. Each maps to a real class of failure.

**1. Extract into an empty directory and list what is actually inside.**
Not what the build script intended to include. What is in the file. Packaging rules — an
ignore file, a `files` field, a glob — routinely drop something essential or drag in something
private. Check both directions: is anything missing, and is anything in there that should
never have shipped?

**2. Follow your own instructions literally, from that directory.**
Do not skip a step because you know it works. If the README says two commands, run exactly
those two commands, in a shell that has none of your project's environment. Instructions that
reference a path, a global install or an environment variable the author happens to have are
the single most common first-run failure.

**3. Never publish an instruction you have not executed.**
A one-line install command for a package that is not published yet fails for every first-time
reader. If the command cannot work today, write the one that does and say plainly why the
convenient one is absent.

**4. Run the entry point with no arguments and with wrong ones.**
The author always passes the right arguments. Recipients do not. A tool that crashes on empty
input teaches people it is fragile, whatever it does when driven correctly.

**5. Check the defaults, not just the flags you use.**
Paginated APIs and CLIs are the classic trap: a listing that returns the first page by default
will silently under-report, and an audit built on it says "no problems found" while looking at
a fraction of the data. **A confident wrong answer is worse than no answer.** Whenever a
command reports a count, confirm the count is complete.

**6. Test on the platform you do not use.**
Line endings, path separators, console encodings and shell quoting differ. A script that prints
a non-ASCII character crashes on a Windows console set to a legacy code page. If continuous
integration can run the other platforms, let it — it is cheaper than a customer finding it.

**7. Run against the version matrix you claim to support.**
If the manifest says Node 18 and up, run it on Node 18. Syntax and CLI flags added in later
versions are invisible on the author's machine and fatal on half the installs.

## When you find something

Fix it before publishing, and record what class it belonged to. These bugs repeat, because the
gap that produces them is structural: the author's machine will always know things the
recipient's does not.

## What this is not

This is not a substitute for tests. Tests catch regressions in what you already understand;
this catches the assumptions you did not know you were making. Do both, and do this one last,
after the tests pass — because a release that passes its tests and fails on first install is
still a failed release.
