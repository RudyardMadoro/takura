# Observability and alert operations

The smaller deployment profile is OpenTelemetry Collector, Prometheus, Grafana, Loki and Tempo. Management and dashboard ports bind to loopback/private networks only. Application metrics use route templates, method, status, service, environment and release; raw URLs and record IDs are forbidden labels. Logs add correlation and trace IDs but never request bodies, contact text, tokens, cookies, presigned URLs or webhook bodies.

Demo retention is logs 14 days, traces 7 days and metrics 30 days. Production trace sampling starts at 10%; controlled tests may use 100%. Error counters and business audit are unsampled.

Alerts require an assigned operator route before launch: two consecutive synthetic submission failures, oldest notification over 15 minutes, oldest scan over 30 minutes, disk over 80%, backup age over 26 hours, and sustained API latency/error thresholds. Trigger each rule in staging and record whether the receiver actually acknowledged it. Configuration alone is not delivery evidence. Configure an off-host uptime check separately; do not place its credentials in this repository.
