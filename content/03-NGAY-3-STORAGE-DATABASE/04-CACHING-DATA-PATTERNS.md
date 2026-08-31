# Caching và Data Access Patterns

## 1. Cache layers

```text
Client/browser cache
→ CloudFront edge cache
→ API Gateway/application cache
→ ElastiCache/DAX
→ Database/storage
```

Cache gần user nhất giảm latency/network nhiều nhất, nhưng mỗi layer có invalidation/consistency trade-off.

## 2. Chọn cache service

| Cache | Data | Chọn khi |
|---|---|---|
| CloudFront | HTTP objects/responses | Global viewers, static/dynamic cacheable content |
| API Gateway cache | API responses | Repeated API requests theo cache key/stage |
| ElastiCache Redis/Valkey | Rich structures, session, query results | App/database cache, HA/replication needed |
| ElastiCache Memcached | Simple key-value ephemeral cache | Multi-threaded simple cache, app tolerates node loss |
| DAX | DynamoDB items/query results | Microsecond eventually consistent DynamoDB reads |
| Local in-process | Per-instance hot data | Tiny immutable/reference data; tolerate cold/loss |

## 3. Cache-aside

```text
Read:
app → cache
  hit → return
  miss → DB → write cache → return
```

Ưu điểm:

- chỉ cache data thực sự đọc;
- cache failure có thể fallback DB;
- simple.

Nhược điểm:

- first request miss;
- stale data;
- cache stampede;
- app code quản cache.

## 4. Write-through và write-behind

### Write-through

```text
app write → cache → database synchronously
```

- Cache luôn ấm hơn.
- Write latency/complexity cao hơn.
- Cần failure/transaction consistency design.

### Write-behind/write-back

```text
app write → cache/queue → async database
```

- Low write latency/batching.
- Nguy cơ data loss/ordering/consistency.
- Chỉ dùng khi platform/pattern đảm bảo durability và business chấp nhận.

## 5. TTL và invalidation

- TTL ngắn: fresh hơn, hit ratio thấp, origin load cao.
- TTL dài: hit ratio cao, stale risk.
- Explicit invalidation: nhanh nhưng cost/rate/complexity.
- Versioned object names (`app.abc123.js`): cache lâu, deploy tạo URL mới; pattern tốt cho static assets.
- Jitter TTL tránh hàng loạt keys expire cùng lúc.

## 6. Cache stampede

Khi popular key hết hạn, nhiều requests cùng query DB.

Mitigations:

- request coalescing/lock;
- stale-while-revalidate;
- pre-warm;
- TTL jitter;
- background refresh;
- rate limit/circuit breaker.

## 7. Redis/Valkey vs Memcached

| | Redis/Valkey-style | Memcached |
|---|---|---|
| Data structures | Rich | Simple key-value |
| Replication/HA | Có | Không cùng model |
| Persistence/backups | Có options | Không |
| Pub/sub/streams/sorted sets | Có | Không |
| Multi-thread | Engine/version dependent; Memcached nổi bật đơn giản multi-thread | Có |
| Use | Sessions, leaderboard, HA cache | Disposable simple cache |

## 8. DAX

- Client-side endpoint compatible với DynamoDB API subset/model.
- Write-through behavior updates cache while writing table.
- Eventually consistent reads được acceleration.
- Strongly consistent reads bypass cache path.
- DAX cluster/subnets/replicas cần HA design.

Không chọn DAX cho RDS hoặc generic Redis features.

## 9. CloudFront cache key

Cache key có thể gồm:

- path;
- selected query strings;
- selected headers;
- selected cookies.

Càng nhiều viewer-specific values trong cache key, cache hit ratio càng thấp. Tách:

- cache policy: cái gì vào cache key/TTL;
- origin request policy: cái gì forward tới origin mà không nhất thiết vào cache key.

## 10. Read/write scaling patterns

| Bottleneck | Pattern |
|---|---|
| Repeated reads | Cache |
| Relational read throughput | Read replicas + cache |
| Write spikes async | SQS/Kinesis buffer |
| Hot DynamoDB key | Redesign key/write sharding/cache read path |
| Reporting query | Replica/warehouse/data lake |
| Static objects | S3 + CloudFront |

## 11. CQRS/read model

```text
Transactional write store
→ event/CDC
→ optimized read model (OpenSearch/DynamoDB/cache)
```

Ưu điểm: read performance, independent scaling. Trade-off: eventual consistency, replay/rebuild, duplicate event handling.

## 12. Scenario reasoning

### A. Product images global

S3 + CloudFront, long TTL + versioned keys. Không cần ElastiCache.

### B. RDS product detail query lặp lại

ElastiCache cache-aside; invalidate/update khi product thay đổi; DB là source of truth.

### C. DynamoDB reads cần microsecond

DAX nếu eventually consistent path phù hợp. Nếu strong read bắt buộc, DAX không giải yêu cầu.

### D. Session cho autoscaled web fleet

Redis/Valkey-style ElastiCache Multi-AZ hoặc DynamoDB; không local memory/sticky session làm nguồn duy nhất.

## 13. Exam traps

- Cache không cải thiện write-heavy workload mặc định.
- Higher TTL không luôn tốt; freshness requirement thắng hit ratio.
- Memcached node loss phải được app chấp nhận.
- CloudFront cache key quá chi tiết làm miss nhiều.
- Read replica và cache giải hai lớp khác nhau; có thể dùng cùng nhau.
- DAX chỉ DynamoDB, chủ yếu eventual reads.

Tiếp theo: [Ngày 4 — Networking](../04-NGAY-4-NETWORKING/README.md).
