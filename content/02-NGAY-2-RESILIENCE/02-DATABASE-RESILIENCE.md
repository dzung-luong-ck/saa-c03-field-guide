# Database Resilience

## 1. Tách ba mục tiêu

| Mục tiêu | Cơ chế |
|---|---|
| High availability | Synchronous standby/replicas, failover, multi-AZ |
| Read performance | Read replicas/cache/read endpoint |
| Disaster recovery | Cross-Region replica/global database/backups |

Một feature có thể hỗ trợ nhiều mục tiêu, nhưng đề thường hỏi mục tiêu chính. Bẫy lớn nhất là dùng read replica như đáp án mặc định cho HA.

## 2. RDS Multi-AZ DB instance deployment

```text
Application → one DB endpoint → Primary AZ-A
                                ║ synchronous replication
                                Standby AZ-B
```

- Một primary writer + một standby.
- Synchronous replication cho HA/durability.
- Automatic failover bằng DNS endpoint; app reconnect/retry.
- Standby **không phục vụ read traffic**.
- Backup/maintenance có thể tận dụng standby theo engine/operation behavior.

Chọn khi: production relational DB cần HA với minimal administration.

Không chọn để: scale read query.

## 3. RDS Multi-AZ DB cluster deployment

```text
Writer AZ-A
Reader/standby AZ-B
Reader/standby AZ-C
```

- Writer và hai readable standbys ở ba AZ.
- Standbys hỗ trợ read traffic và failover.
- Fast failover/performance characteristics khác instance deployment.
- Engine/Region/instance support phải phù hợp.

Đề có thể nói “Multi-AZ cluster” rõ ràng. Không áp rule cũ “standby không read” cho loại cluster.

## 4. RDS Read Replicas

- Replication thường asynchronous.
- Scale read-heavy workloads.
- Có endpoint riêng; application phải route read.
- Có thể cross-AZ/cross-Region tùy engine.
- Có thể promote thành standalone DB cho DR/migration.
- Replication lag → đọc stale.

### Pattern kết hợp

```text
RDS Multi-AZ primary deployment
  ├─ HA standby
  └─ Read replica(s) cho reporting/read traffic
```

HA và read scale không loại trừ nhau; production lớn thường dùng cả hai.

## 5. Failover behavior

Trigger có thể gồm:

- instance/hardware failure;
- AZ/network issue;
- maintenance;
- manual reboot with failover;
- storage/OS condition theo service detection.

Application resilience:

- Dùng DNS endpoint, không cache IP lâu.
- Connection timeout ngắn hợp lý.
- Retry với backoff.
- Connection pool invalidation/reconnect.
- Transaction idempotency hoặc reconciliation nếu outcome không rõ.

RDS Proxy giúp pool connections và giảm connection storm/failover disruption cho supported use cases.

## 6. Aurora architecture

```text
Cluster volume across multiple AZs
  ├─ Writer instance → writer/cluster endpoint
  ├─ Reader instance → reader endpoint
  ├─ Reader instance
  └─ additional replicas
```

- Compute instances tách khỏi shared distributed cluster storage.
- Aurora Replicas share storage, giảm need replicate full storage per reader.
- Reader endpoint load-balance read connections; writer endpoint cho writes.
- Replica priority/failover tier quyết định promotion preference.
- Auto Scaling readers cho read workload.

### Aurora HA

- Deploy reader ở AZ khác làm failover target.
- Nếu không có reader, recovery/failover path chậm hơn vì cần create instance.
- App dùng cluster endpoint/driver/RDS Proxy phù hợp, không hard-code instance endpoint cho writer path.

### Aurora Global Database

- Primary cluster ở write Region.
- Secondary clusters ở Regions khác cho local reads và DR.
- Storage-based asynchronous cross-Region replication.
- Planned switchover có thể đạt no-data-loss khi synchronized; unplanned failover có non-zero RPO tùy lag.

Chọn khi: global relational reads, low cross-Region replication overhead, Regional DR với Aurora.

Không chọn nếu: cần multi-Region multi-active writes với key-value access pattern; DynamoDB global tables thường phù hợp hơn.

## 7. Aurora Serverless

- Capacity tự scale theo workload trong supported engine/version model.
- Tốt cho variable/intermittent relational workloads và giảm capacity planning.
- Không mặc định là đáp án cho mọi production DB; xét minimum capacity, connection behavior, compatibility, latency và cost at steady load.
- Aurora Serverless không thay Global Database/Multi-AZ reasoning.

## 8. DynamoDB resilience

- Managed, serverless, dữ liệu được phân phối và replicated trong Region.
- Partition key design quyết định scalability và hot partitions.
- On-demand/provisioned capacity không thay durability model.

### Global tables

```text
Region A table replica ↔ Region B table replica ↔ Region C table replica
```

- Multi-Region, multi-active reads/writes.
- Local low-latency access.
- Replication/conflict/consistency behavior phải phù hợp application.
- Route 53/Global Accelerator/app routing đưa user tới local Region.

### Backup vs global table

- Global table bảo vệ Region availability và global latency.
- PITR/on-demand backup bảo vệ logical corruption/accidental delete.
- Cần cả replication và backup khi business yêu cầu.

## 9. ElastiCache resilience

### Redis/Valkey-style engine

- Primary/replica, Multi-AZ automatic failover theo configuration.
- Cluster mode cho sharding/write scale.
- Persistence/backup options theo engine/configuration.
- Dùng session, cache, leaderboard, pub/sub, rate limit.

### Memcached

- Simple distributed cache, multi-node partitioning.
- Không replication/failover/persistence như Redis-style engine.
- Node loss gây cache miss; application phải repopulate.

Cache phải được coi là disposable trừ khi service/architecture được chọn như durable database. Database vẫn là source of truth trong cache-aside pattern.

## 10. Backup/PITR/snapshot

| Cơ chế | Dùng cho |
|---|---|
| Automated backups/PITR | Restore về một thời điểm trong retention window |
| Manual snapshot | Giữ tới khi xóa; copy/share theo rules |
| Read replica | Read scale/DR, không phải immutable recovery point |
| AWS Backup | Central policy, lifecycle, cross-account/Region, Vault Lock |

Logical delete có thể replicate ngay; snapshot/PITR cho khả năng quay lại trước lỗi.

## 11. Scenario reasoning

### A. RDS read-heavy nhưng phải HA

- Multi-AZ cho writer HA.
- Read replicas cho reporting/read traffic.
- Cache nếu query lặp lại và chấp nhận staleness.

### B. Lambda burst làm DB hết connections

- RDS Proxy pool/share connections.
- Reserved concurrency có thể giới hạn Lambda pressure.
- SQS buffer nếu request xử lý async được.
- Scale DB chỉ là một phần, không giải connection storm tận gốc.

### C. Global shopping cart key-value

- DynamoDB global tables cho local multi-active access.
- Conditional writes/idempotency/conflict design.
- Không chọn Aurora Global chỉ vì có chữ global nếu write model cần multi-active key-value.

### D. Global relational reporting, write tập trung

- Aurora Global Database primary writer + secondary read Regions.
- Planned switchover/unplanned failover procedure và Route 53/app endpoint update.

## 12. Exam traps

- RDS Multi-AZ instance standby không đọc.
- RDS Multi-AZ cluster standbys có thể đọc; đọc kỹ loại deployment.
- Read replica async có lag; không dùng cho always-strong read requirement.
- Promote replica là operation; không phải same transparent failover semantics như Multi-AZ.
- Aurora reader endpoint không gửi writes.
- RDS Proxy không cache query results; nó quản DB connections.
- DynamoDB global tables không thay backup.
- ElastiCache không chữa inefficient write-heavy database design nếu cache hit thấp.

Tiếp theo: [Disaster Recovery](03-DISASTER-RECOVERY.md).
