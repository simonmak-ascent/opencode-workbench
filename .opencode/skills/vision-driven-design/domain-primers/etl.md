# ETL Domain Primer

Loaded during Phase 2 (Strategy) when the vision involves data pipelines, integration, transformation, or migration of data between systems.

## Research Patterns

### Source System Discovery
- What are the source systems? (databases, APIs, file systems, streaming platforms, third-party services)
- What are the data formats? (JSON, CSV, Parquet, Avro, Protobuf, XML)
- What are the extraction constraints? (rate limits, API quotas, read-only replicas, change data capture availability)
- What is the data volume? (records/day, GB/day, peak throughput)
- What is the data velocity? (batch hourly, batch daily, near-real-time, real-time streaming)
- What is the data variety? (structured, semi-structured, unstructured)

### Pipeline Architecture Assessment
- **Batch ETL**:
  - Orchestration: Airflow, Prefect, Dagster, Temporal
  - Processing: Spark, dbt, custom Python/Node scripts
  - Scheduling: cron, event-driven, dependency-based DAG
- **Streaming/Real-Time**:
  - Message bus: Kafka, Redpanda, AWS Kinesis, Google Pub/Sub
  - Stream processing: Flink, Kafka Streams, Spark Streaming, RisingWave
  - Change Data Capture (CDC): Debezium, Maxwell, built-in DB replication
- **ELT (Extract-Load-Transform)**:
  - Warehouse-first: Fivetran/Airbyte → Snowflake/BigQuery → dbt transforms
  - Lake-first: extract to data lake → transform with Spark/Trino
- **Reverse ETL**:
  - Warehouse → operational systems: Census, Hightouch, custom API integrations

### Data Quality Framework
- Schema validation: define expected schema, reject or quarantine mismatches
- Completeness: required fields present, no unexpected nulls
- Uniqueness: deduplication strategy (exact match, fuzzy match, entity resolution)
- Timeliness: data arrives within SLA window
- Consistency: cross-source referential integrity
- Accuracy: values within expected ranges, format validation

### Error Handling & Observability
- Dead letter queue (DLQ): where do failed records go? How are they retried?
- Alerting: what triggers an alert? (pipeline failure, data quality drop below threshold, latency spike)
- Lineage tracking: can you trace a dashboard value back to its source system and extraction time?
- Idempotency: can the same pipeline run twice without duplicating data?
- Backfilling: how do you reprocess historical data?

## Impact Verification

### Pipeline Health Metrics
- Pipeline success rate (% of runs that complete without errors)
- Pipeline latency (time from source event to target availability)
- Data freshness (max staleness of data in target system)
- Data quality score (weighted average of completeness, uniqueness, accuracy)
- DLQ growth rate (records entering dead letter queue per day)

### Business Impact Metrics
- Time saved vs manual data integration (hours/week)
- Decision latency reduction (time from data generation to data-driven action)
- Data coverage (% of source systems integrated)
- Error reduction vs previous pipeline (incidents/month, data anomalies detected)

### Impact-to-Vision Verification
For each vision goal that involves data pipelines:
- "Unifies data across the organization" → measured by: number of integrated source systems, cross-source query availability
- "Enables real-time insights" → measured by: pipeline latency at p95, freshness SLA compliance
- "Reduces manual data work" → measured by: hours/week of manual integration eliminated, automated pipeline coverage

## Domain-Specific Constraints

- **Data residency**: Where must data be processed and stored? (region-specific regulations)
- **PII handling**: Identify PII in pipelines — apply masking, tokenization, or encryption before landing
- **Schema evolution**: How are source schema changes handled? (backward-compatible, forward-compatible, breaking)
- **Idempotency**: Every pipeline step must be safe to re-run
- **Checkpointing**: Long-running pipelines must checkpoint progress to resume from failure point
- **Resource isolation**: Separate compute for dev/staging/prod pipelines
- **Cost optimization**: Spot instances for batch, reserved for streaming, auto-scaling thresholds
- **Retention policy**: How long is raw data retained? Transformed data? Pipeline run logs?

## Anti-Patterns Specific to ETL

- Building custom orchestration when proven tools exist (Airflow, Prefect, Dagster)
- Pulling full table every run when CDC or incremental extraction is available
- No schema enforcement — silent data corruption when source changes
- Silently dropping bad records instead of routing to DLQ
- Hardcoded credentials in pipeline code — use secrets manager
- No monitoring or alerting — discovering pipeline failures from users
- Pipeline code that can't be tested locally — no dry-run or sample data mode
- Writing transforms as one monolithic script — compose from testable, reusable steps
- Ignoring backpressure — downstream system overwhelmed because pipeline has no throttle
- No data contracts between producer and consumer teams
