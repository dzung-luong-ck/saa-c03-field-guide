# Ngày 3 — Storage và Databases

Ngày 3 thuộc cả Performance, Resilience và Cost. Hầu hết câu hỏi bắt đầu bằng access pattern: object/block/file, read/write ratio, consistency, latency, sharing, durability và lifecycle.

## Thứ tự học

1. [Amazon S3](01-S3.md) — 70 phút.
2. [EBS, EFS và FSx](02-EBS-EFS-FSX.md) — 60 phút.
3. [Databases](03-DATABASES.md) — 75 phút.
4. [Caching và Data Patterns](04-CACHING-DATA-PATTERNS.md) — 40 phút.
5. 50 practice questions — 90 phút.

## Checklist cuối ngày

- [ ] Chọn đúng object, block hoặc file storage.
- [ ] Phân biệt các S3 storage classes bằng access frequency, retrieval time, AZ và minimum duration.
- [ ] Hiểu versioning, lifecycle, replication, Object Lock và multipart upload.
- [ ] Chọn đúng `gp3`, `io2`, `st1`, `sc1` hoặc instance store.
- [ ] Phân biệt EFS và bốn loại FSx.
- [ ] Chọn RDS/Aurora, DynamoDB, Redshift, OpenSearch, Neptune hoặc DocumentDB.
- [ ] Hiểu partition key, GSI/LSI, capacity mode, consistency, TTL, Streams và global tables.
- [ ] Phân biệt CloudFront, ElastiCache và DAX.

## Liên hệ slide PDF

- EBS/instance store/EFS: trang 93–117.
- RDS/Aurora/ElastiCache: trang 160–192.
- S3 core/advanced/security: trang 267–334.
- Storage extras: trang 350–374.
- Databases/Data & Analytics: trang 513–559.

Tiếp theo: [Amazon S3](01-S3.md).
