# Task 4.3 — Design cost-optimized database solutions

Task này hỏi cách chọn database type/engine, capacity, cache, replica, backup và migration sao cho workload đạt yêu cầu mà không trả cho tính năng/capacity không dùng.

## 1. Giải thích cho người mới

Database cost có nhiều phần:

- compute instance hoặc capacity units;
- storage và I/O;
- backup/snapshot retention;
- read replicas/Multi-AZ;
- data transfer;
- license/engine;
- thời gian đội ngũ vận hành;
- migration và application change.

Database rẻ theo giờ nhưng cần DBA vận hành 24/7 có thể có TCO cao hơn managed service.

## 2. Chọn đúng database type

| Access pattern | Hướng chọn |
|---|---|
| SQL/join/transaction quan hệ | RDS/Aurora |
| Key-value/document scale lớn, query theo key | DynamoDB |
| In-memory cache/session | ElastiCache |
| Time-series | Timestream hoặc purpose-built pattern phù hợp |
| Columnar analytics | Redshift/S3 + Athena theo workload |
| Full-text search | OpenSearch |

Đừng chọn relational chỉ vì quen thuộc nếu workload key-value đơn giản ở scale lớn. Cũng đừng chuyển sang NoSQL nếu application cần join/transaction và chi phí rewrite vượt lợi ích.

## 3. Capacity model

### RDS/Aurora

- Right-size instance theo CPU, memory, connections, I/O.
- Reserved pricing/commitment phù hợp baseline ổn định theo offering hiện hành.
- Serverless capacity phù hợp workload biến động/idle theo engine feature và min/max configuration.
- Stop non-production khi được hỗ trợ và phù hợp.

### DynamoDB

- On-demand cho traffic khó dự đoán/spiky.
- Provisioned + auto scaling cho traffic dự đoán được và có thể tối ưu capacity.
- Standard/IA table class theo storage/access profile.
- Poor partition key gây throttling và overprovisioning không giải triệt để hot key.

## 4. Replica, Multi-AZ và cache

- Chỉ thêm read replica khi read bottleneck/availability use case cần; mỗi replica có cost.
- Multi-AZ đáp ứng HA, không nên xóa chỉ để tiết kiệm nếu production SLA cần.
- Cache giảm repeated database work, nhưng thêm node/cost và invalidation complexity.
- RDS Proxy giảm connection overhead; nó không phải cache query.

Tối ưu đúng root cause: query thiếu index không nhất thiết cần replica; connection storm không nhất thiết cần instance lớn hơn.

## 5. Backup và retention

- Chọn backup frequency từ RPO.
- Chọn retention từ compliance/business.
- Xóa manual snapshots hết hạn và orphaned backups có kiểm soát.
- Cross-Region/account copy chỉ khi DR/security requirement cần.
- Archive/export dữ liệu lạnh sang S3 nếu application/query pattern cho phép.

Giữ mọi dữ liệu “phòng khi cần” là cost smell; nhưng xóa sớm có thể phá audit/restore requirement.

## 6. Engine và migration

- Homogeneous migration giữ engine, thường ít application change hơn.
- Heterogeneous migration đổi engine cần schema/code conversion và test.
- DMS hỗ trợ data movement/CDC; Schema Conversion Tool/approach tương ứng hỗ trợ schema conversion theo engine.
- License-heavy commercial engine có thể tạo động lực chuyển open-source compatible/managed option, nhưng migration risk và feature compatibility phải tính.

## 7. Cost tools và tagging

Tag database/snapshot theo owner, environment, application. Dùng Cost Explorer/CUR để phân tích service, usage type và xu hướng; Budgets để cảnh báo. Kết hợp database metrics để biết chi phí cao do nhu cầu thật hay idle/overprovision.

## 8. Scenario điển hình

**Đề:** Dev database dùng 8 giờ/ngày, idle ban đêm; production có baseline ổn định và cần Multi-AZ; reporting đọc nhiều làm primary chậm.

**Thiết kế:** schedule/ephemeral strategy cho dev theo support; right-size và commitment phù hợp production baseline nhưng giữ Multi-AZ; read replica hoặc analytics copy cho reporting; backup retention khác nhau theo environment.

**Không chọn:** bỏ Multi-AZ production chỉ để giảm bill; chạy dev 24/7; scale primary lớn mãi khi reporting là read workload tách được.

## 9. Exam traps

- Read replica và cache đều tốn tiền; chỉ thêm khi đúng bottleneck.
- Multi-AZ là cost của availability requirement, không phải lãng phí mặc định.
- RDS Proxy không cache query.
- DynamoDB on-demand không luôn rẻ nhất cho steady predictable traffic.
- Engine migration có development/testing cost.
- Backup retention ngắn nhất không đúng nếu compliance/RPO/RTO yêu cầu khác.

## 10. Checklist làm được task

- [ ] Chọn database type từ access pattern.
- [ ] Liệt kê compute, storage, I/O, backup, replica và license costs.
- [ ] Chọn on-demand/provisioned/serverless từ traffic pattern.
- [ ] Phân biệt solution cho query, read scale và connections.
- [ ] Thiết kế backup/retention theo environment.
- [ ] Tính migration effort trong TCO.

Học sâu: [Databases trên AWS](../../03-NGAY-3-STORAGE-DATABASE/03-DATABASES.md), [Caching](../../03-NGAY-3-STORAGE-DATABASE/04-CACHING-DATA-PATTERNS.md) và [Cost Optimization](../../06-NGAY-6-COST-MIGRATION-OPS/01-COST-OPTIMIZATION.md).

Tiếp theo: [Task 4.4 — Network cost](TASK-4.4-NETWORK-COST.md).
