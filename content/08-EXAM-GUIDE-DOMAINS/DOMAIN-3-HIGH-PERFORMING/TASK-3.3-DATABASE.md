# Task 3.3 — Determine high-performing database solutions

Task này hỏi cách chọn database type/engine, capacity, replica, cache và connection strategy dựa trên cách application thật sự đọc và ghi dữ liệu.

## 1. Giải thích cho người mới

Database tốt nhất không được chọn bằng số lượng tính năng. Hãy bắt đầu bằng **access pattern**:

- query bằng key hay join nhiều bảng?
- đọc nhiều hay ghi nhiều?
- cần transaction/constraint mạnh không?
- latency mục tiêu là millisecond hay có thể batch?
- dữ liệu và traffic tăng thế nào?

Sau đó mới chọn relational, key-value/document, in-memory, search, graph, time-series hoặc warehouse.

## 2. Relational và non-relational

| Requirement | Hướng chọn |
|---|---|
| SQL, join, transaction, schema quan hệ | RDS/Aurora |
| Key-value/document, scale lớn, access pattern biết trước | DynamoDB |
| Cache/session/leaderboard in-memory | ElastiCache |
| Search full-text/log search | OpenSearch |
| Analytics warehouse dạng cột | Redshift |

Purpose-built database nghĩa dùng engine theo workload, không cố nhét mọi dữ liệu vào một loại.

## 3. RDS và Aurora performance

- Chọn instance family/size theo CPU, memory, I/O và connections.
- Read replicas scale read; application phải gửi read traffic tới replica phù hợp.
- Multi-AZ giải availability/failover, không phải mặc định là read scaling.
- Aurora có storage/replica architecture riêng; reader endpoint phân phối read connections.
- Provisioned IOPS phù hợp workload cần I/O dự đoán được.
- Index tốt giảm scanned rows nhưng tăng write/storage overhead.

## 4. Connection management

Database có giới hạn connection và mỗi connection tốn tài nguyên. Lambda hoặc spike lớn có thể tạo connection storm.

- Connection pool tái sử dụng connection trong application.
- RDS Proxy quản pool và hỗ trợ failover/secret integration cho use case phù hợp.
- Proxy không sửa query thiếu index hoặc schema sai.
- Metric cần xem: active connections, query latency, locks, CPU, memory, IOPS, replication lag.

## 5. DynamoDB performance

- Partition key phân bố request và data; hot key tạo bottleneck.
- Sort key hỗ trợ range/query pattern trong một partition key.
- GSI cung cấp access pattern khác nhưng có capacity/storage và consistency trade-off.
- On-demand phù hợp traffic khó dự đoán; provisioned + auto scaling phù hợp workload/cost pattern dự đoán hơn.
- DAX là cache tương thích cho read-heavy DynamoDB use case phù hợp.

Không dùng Scan thường xuyên cho access pattern chính nếu có thể thiết kế Query/key/index.

## 6. Caching strategy

### Cache-aside

```text
App đọc cache
├─ hit  → trả dữ liệu
└─ miss → đọc DB → ghi cache → trả dữ liệu
```

Cache giảm database load và latency nhưng cần TTL/invalidation. Dữ liệu thay đổi nhanh hoặc yêu cầu strongly consistent có thể không phù hợp cache lâu.

ElastiCache for Redis/Valkey phù hợp data structure/session/ranking; Memcached đơn giản hơn cho distributed cache không cần các feature nâng cao tương ứng.

## 7. Read-heavy và write-heavy

- Read-heavy: read replica, cache, CDN cho content, denormalization phù hợp.
- Write-heavy: partition/shard tốt, batch writes, queue buffer, tránh hot key/index dư thừa.
- Mixed: tách read/write path, chọn consistency và replica lag chấp nhận được.

Replica chỉ giúp nếu bottleneck là read trên primary; nó không giảm write load chính và có thể tăng replication work.

## 8. Scenario điển hình

**Đề:** Product catalog đọc cực nhiều, cập nhật ít, database relational hiện có quá tải read nhưng write vẫn ổn; application chấp nhận dữ liệu cũ vài giây.

**Hướng:** thêm read replicas và route read; cache popular items với TTL; theo dõi replica lag. Không đổi toàn bộ sang DynamoDB nếu requirement không yêu cầu và migration overhead không hợp lý.

**Đề khác:** Shopping cart truy cập bằng user ID, traffic tăng đột biến, không cần join phức tạp.

**Hướng:** DynamoDB với partition key phân bố tốt, on-demand/auto scaling và conditional writes phù hợp.

## 9. Exam traps

- Multi-AZ khác read replica.
- Cache không phải source of truth mặc định.
- RDS Proxy không phải query cache.
- GSI không miễn phí và có consistency/capacity considerations.
- DynamoDB Scan không phải truy cập tối ưu cho key-known workload.
- Đổi engine không luôn cần thiết; đôi khi index, replica, proxy hoặc cache đã giải đúng bottleneck.

## 10. Checklist làm được task

- [ ] Viết access pattern trước khi chọn database.
- [ ] Phân biệt relational, DynamoDB, cache, search và warehouse.
- [ ] Chọn Multi-AZ hay read replica đúng mục tiêu.
- [ ] Tìm connection storm và chọn pooling/proxy.
- [ ] Thiết kế partition key tránh hot partition.
- [ ] Chọn cache TTL/consistency theo business.

Học sâu: [Databases trên AWS](../../03-NGAY-3-STORAGE-DATABASE/03-DATABASES.md), [Caching](../../03-NGAY-3-STORAGE-DATABASE/04-CACHING-DATA-PATTERNS.md) và [Database Resilience](../../02-NGAY-2-RESILIENCE/02-DATABASE-RESILIENCE.md).

Tiếp theo: [Task 3.4 — Network](TASK-3.4-NETWORK.md).
