# Troubleshooting ConfigFlow in Production

## Connection errors

If you see "connection refused": the agent isn't running. Check `systemctl status configflow`.

If you see "permission denied": your token lacks the right policy. Run `configflow token check <token>` to see what it can access.

If you see a TLS error: you have a certificate mismatch. Check that your CA cert matches on both client and server.

## Performance issues

Check in this order:

1. If p99 latency is above 200ms — your watch interval is too short. Set `watch_interval = "5s"` in config.
2. If CPU is normal but memory is climbing — you have a stale watcher leak. Restart the agent and file a bug.
3. If both are fine but it still feels slow — the bottleneck is network topology, not ConfigFlow.

## Next steps

When not to escalate: if the issue resolves after restart, it was likely a transient network partition.
If it recurs, open an issue with the output of `configflow debug bundle`.
