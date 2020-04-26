# 2.0.0

- don't throw if context not provided in validator

# 1.2.0

- add onValidated - fired once after validation occurs.

- now using useEffect for event firing.

^-- this change should result in less calls to `onError` `onValidated`, `onInvalid` and `onValid`

# 1.1.0

- why are badges so difficult to get right? fixing it for real this time
- stop checking after first error encountered, return that

# 1.0.2

- Another hack at badges, more tooling
- Also minor potential edge case breaking things.

# 1.0.1

Muxed up the badges

# 1.0.0

Initial release
