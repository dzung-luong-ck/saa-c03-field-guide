# Databases trên AWS

## 1. Purpose-built database principle

Chọn database theo data model và access pattern, không theo mức độ quen thuộc.

| Data model/use | Service chính |
|---|---|
| Relational OLTP | RDS/Aurora |
| Key-value/document at scale | DynamoDB |
| Document MongoDB-compatible | DocumentDB |
| Graph | Neptune |
| Wide-column Cassandra-compatible | Keyspaces |
| In-memory durable-compatible use | MemoryDB/ElastiCache theo requirement |
| Search/log analytics | OpenSearch Service |
| Data warehouse OLAP | Redshift |

## 2. RDS

Managed relational engines với:

- provisioning/patching infrastructure;
- automated backups/PITR;
- snapshots;
- Multi-AZ;
- read replicas;
- monitoring, parameter/option groups;
- encryption và network isolation.

Khách hàng vẫn quản:

- schema/index/query;
- DB users/permissions;
- application connection behavior;
- capacity class/storage choices;
- maintenance/backup windows và retention;
- data lifecycle/compliance.

### RDS storage/performance

- General purpose SSD cho most workloads.
- Provisioned IOPS cho sustained I/O-critical DB.
- Storage autoscaling tăng capacity, không tự giảm.
- Read replicas giảm read pressure; index/query tuning vẫn quan trọng.
- Enhanced Monitoring/Performance Insights/CloudWatch metrics chẩn đoán DB/OS/query load theo feature.

### Parameter group vs option group

- Parameter group: database engine configuration values.
- Option group: enable engine-specific features/options nơi áp dụng.
- Static parameter có thể cần reboot; dynamic apply nhanh hơn.

### Backup concepts

- Automated backup retention → PITR.
- Manual snapshot tồn tại tới khi xóa.
- Restoring tạo DB mới, không overwrite DB hiện tại.
- Copy snapshot cross-Region/account theo encryption/key constraints.

## 3. Aurora

Aurora MySQL/PostgreSQL-compatible với architecture tách compute khỏi distributed storage.

### Endpoints

| Endpoint | Dùng cho |
|---|---|
| Cluster/writer endpoint | Current writer; writes và strongly consistent writer reads |
| Reader endpoint | Load balance read-only connections tới Aurora Replicas |
| Instance endpoint | Một DB instance cụ thể; admin/troubleshooting/special routing |
| Custom endpoint | Nhóm instances cụ thể, ví dụ analytics readers |

### Features hay thi

- Aurora Replicas cho read scaling/HA.
- Auto Scaling reader fleet.
- Global Database cho multi-Region reads/DR.
- Serverless cho variable capacity.
- Backtrack (engine/region/version support) rewind cluster state nhanh nhưng không thay backup.
- Cloning copy-on-write cho dev/test nhanh, tiết kiệm storage ban đầu.

### Aurora vs RDS engine

Chọn Aurora khi:

- cần higher read scale/failover/distributed storage features;
- MySQL/PostgreSQL compatibility đủ;
- Global Database/serverless/cloning phù hợp.

Chọn RDS engine khi:

- cần SQL Server/Oracle/MariaDB hoặc exact engine features/licensing;
- migration compatibility quan trọng hơn Aurora-specific benefits.

## 4. RDS Proxy

```text
Lambda/ECS/EC2 clients
→ RDS Proxy connection pool
→ RDS/Aurora
```

- Reuse/pool DB connections.
- Giảm connection storm.
- Integrate Secrets Manager/IAM authentication patterns.
- Improve failover connection handling.
- Không cache query result.
- Không thay DB read replica hoặc database tuning.

## 5. DynamoDB data model

### Primary key

#### Simple key

```text
Partition key only → item unique theo key
```

#### Composite key

```text
Partition key + sort key
```

Items cùng partition key được sắp theo sort key, hỗ trợ range/prefix/time queries.

### Access-pattern-first design

Ví dụ orders:

```text
PK = CUSTOMER#123
SK = ORDER#2026-08-30#987
```

Query một customer theo date range hiệu quả hơn Scan toàn table.

## 6. DynamoDB partitioning

- Partition key hash phân data/capacity.
- Hot key gây throttling dù table còn tổng capacity.
- High-cardinality, evenly distributed keys tốt.
- Write sharding thêm suffix cho hot counter/time bucket nếu app aggregate được.
- Adaptive capacity hỗ trợ uneven access nhưng không cứu một key duy nhất vượt physical limits.

## 7. Capacity modes

| Mode | Chọn khi | Trade-off |
|---|---|---|
| On-demand | New, unpredictable, spiky | Pay per request, ít capacity planning |
| Provisioned + auto scaling | Stable/predictable, cost optimization | Cần capacity/target management |

Switching behavior/limits thay đổi theo service docs; đề thường hỏi access pattern, không hỏi số lần switch.

### Read/write units mental model

- WCU/WRU phụ thuộc item size và writes.
- RCU/RRU phụ thuộc item size và consistency.
- Transactions tốn capacity hơn non-transactional operations.
- Batch APIs không làm capacity “miễn phí”; vẫn consume theo items.

## 8. Consistency

| Read type | Behavior | Cost/capacity |
|---|---|---|
| Eventually consistent | Có thể tạm stale | Ít read capacity hơn |
| Strongly consistent | Latest acknowledged write trong supported scope | Nhiều read capacity hơn |
| Transactional | ACID group operations | Higher capacity/latency |

- GSI reads eventually consistent.
- LSI có thể support strong reads.
- Global tables consistency mode và feature support phải kiểm tra theo current Region/table configuration.

## 9. Secondary indexes

| | GSI | LSI |
|---|---|---|
| Partition key | Có thể khác base | Giống base |
| Sort key | Tùy chọn/khác | Khác base |
| Create | Có thể sau table | Khi tạo table |
| Capacity | Riêng/on-demand behavior | Chia base table capacity |
| Consistency | Eventual | Eventual hoặc strong |
| Scale | Không cùng 10 GB item collection restriction như LSI | Item collection limit theo partition key |

Chỉ tạo index cho access pattern cần; mỗi GSI làm tăng write/storage cost.

## 10. DynamoDB features

### DAX

- In-memory read cache, API-compatible client.
- Microsecond eventually consistent reads.
- Không giúp writes hoặc strongly consistent read path.
- Phù hợp read-heavy repeated key access.

### Streams

- Change data capture theo item modifications.
- Trigger Lambda/materialized view/search replication/audit workflow.
- Ordered per item/partition semantics, retained for limited window.
- Consumer idempotent.

### TTL

- Expire items bằng timestamp attribute.
- Delete asynchronous, không đảm bảo đúng giây.
- Dùng cleanup, session expiration, event data; không dùng hard scheduler.

### PITR/on-demand backup

- Bảo vệ logical/data loss.
- Restore sang table mới.
- Global tables vẫn cần backup.

### Global tables

- Multi-Region replicas, multi-active.
- Local read/write.
- Replication/conflict model phải phù hợp business.

## 11. Redshift

- Columnar, massively parallel processing data warehouse.
- OLAP/BI, không phải OLTP transaction database.
- Distribution/sort keys và compression ảnh hưởng performance.
- Redshift Spectrum query data S3 mà không load toàn bộ vào cluster.
- Managed/serverless deployment models theo workload.
- Snapshots/cross-Region copy cho protection.

Chọn Athena cho ad-hoc/serverless query S3, Redshift cho repeated warehouse workloads, joins/BI với performance cần kiểm soát.

## 12. OpenSearch Service

- Full-text search, log analytics, near-real-time indexing.
- Common pattern: DynamoDB Streams/Lambda hoặc Kinesis/Firehose đưa data vào OpenSearch để search.
- Không thay source-of-truth transactional DB.
- Multi-AZ/data nodes/dedicated masters/storage sizing quyết định resilience/performance.

## 13. Purpose-built recognition

| Service | Nhận diện |
|---|---|
| DocumentDB | MongoDB-compatible document workloads; không phải exact MongoDB feature parity |
| Neptune | Graph: social, fraud relationships, knowledge graph |
| Keyspaces | Cassandra-compatible wide-column serverless |
| MemoryDB | Redis-compatible durable in-memory database use cases |
| QLDB | Ledger history/cryptographic verification; kiểm tra scope hiện hành trước khi ưu tiên |

## 14. Database migration

- DMS homogeneous/heterogeneous full load + CDC.
- Schema conversion cho different engines.
- Read replica có thể hỗ trợ homogeneous migration/cutover.
- Snapshot restore/backup for same-engine bulk move.
- Aurora clone cho dev/test trong cluster ecosystem.

Minimal downtime migration cần:

- initial full load;
- ongoing CDC;
- validation;
- short write freeze/cutover;
- DNS/connection update;
- rollback/reconciliation.

## 15. Scenario reasoning

### A. Shopping catalog với unpredictable millions requests

DynamoDB on-demand + good partition key; DAX chỉ nếu read pattern lặp và microsecond needed.

### B. SQL transactions và complex joins

RDS/Aurora, không force DynamoDB chỉ vì scale.

### C. Search product descriptions

Transactional source (RDS/DynamoDB) → CDC/event → OpenSearch index; OpenSearch phục vụ search.

### D. BI query years of sales

Redshift warehouse hoặc Athena nếu data ở S3/ad-hoc; không chạy analytics nặng trên production RDS writer.

### E. Fraud relationships nhiều hops

Neptune graph database.

## 16. Exam traps

- Aurora reader endpoint không write.
- DynamoDB Query khác Scan; Scan không tận dụng key access hiệu quả.
- GSI là eventual; LSI tạo cùng table.
- DAX không tăng write throughput.
- TTL không xóa real-time chính xác.
- Redshift là OLAP, RDS/Aurora là OLTP.
- OpenSearch là search/index, không transactional source of truth.
- DMS không tự chuyển mọi stored procedure/schema object.

Tiếp theo: [Caching và Data Patterns](04-CACHING-DATA-PATTERNS.md).
