# Task 3.5 — Determine high-performing data ingestion and transformation solutions

Task này hỏi dữ liệu đi vào AWS bằng đường nào, đến nhanh ra sao, được buffer/stream/batch thế nào, biến đổi ở đâu và phục vụ analytics/visualization bằng dịch vụ nào.

## 1. Giải thích cho người mới

Một data pipeline thường có năm bước:

```text
Source → Ingest/Transfer → Store → Transform/Catalog → Query/Visualize
```

Đề có thể chỉ hỏi một bước. Đừng chọn cả bộ dịch vụ khi requirement chỉ cần transfer file, và đừng chọn file transfer batch khi cần event trong vài giây.

## 2. Bắt đầu bằng sáu câu hỏi

1. Source ở on-prem, AWS service, database hay device?
2. Dữ liệu là file, record stream hay database changes?
3. Batch hay near real-time?
4. Tốc độ/kích thước và migration window?
5. Có cần ordering, replay hoặc multiple consumers?
6. Output là S3 data lake, warehouse, search hay application?

## 3. Transfer services

| Requirement | Hướng chọn |
|---|---|
| File/object transfer tự động, tăng tốc, verify | DataSync |
| SFTP/FTPS/FTP managed endpoint vào S3/EFS | Transfer Family |
| Hybrid file/volume/tape access | Storage Gateway |
| Database replication/CDC | Database Migration Service |
| Dữ liệu quá lớn hoặc network không đủ | Snow Family |
| Remote clients upload S3 qua edge | S3 Transfer Acceleration |

## 4. Streaming choices

### Kinesis Data Streams

Record stream có shards, ordering theo partition key và retention/replay trong window. Consumers có thể xử lý gần real time.

### Kinesis Data Firehose

Managed delivery stream đưa data theo buffer tới destinations được hỗ trợ, có transform tích hợp. Phù hợp khi mục tiêu là delivery với ít consumer control hơn Data Streams.

### Amazon MSK

Managed Apache Kafka khi protocol/ecosystem Kafka là requirement.

### SQS/EventBridge

SQS là work queue; EventBridge là event routing bus. Chúng không thay streaming log trong mọi use case.

## 5. Data lake và transformation

- S3 thường là durable data lake storage.
- Glue Data Catalog giữ schema/metadata.
- Glue ETL/serverless data integration biến đổi dữ liệu.
- Lake Formation hỗ trợ governance/access cho data lake.
- Athena query S3 bằng SQL; partitioning và Parquet/ORC giảm scanned bytes.
- EMR phù hợp big data frameworks và control/scale cần thiết.
- Redshift phù hợp analytical warehouse.
- Amazon Quick / Quick Sight biến dataset thành phân tích và dashboard theo requirement hiện hành.

CSV dễ trao đổi nhưng columnar Parquet/ORC thường hiệu quả hơn cho analytics chỉ đọc vài cột.

## 6. Performance levers

- Partition stream key đều để tránh hot shard.
- Chọn shard/capacity mode từ records/bytes và growth.
- Batch nhiều record để giảm per-request overhead, nhưng buffer tăng latency.
- Compress và dùng columnar format cho analytics.
- Partition S3 theo các cột filter phổ biến, tránh quá nhiều partition/file cực nhỏ.
- Decouple producer với queue/stream để consumer scale độc lập.
- Theo dõi lag, iterator age, delivery errors và throttling.

## 7. Secure ingestion

- TLS cho endpoint truyền dữ liệu.
- IAM role/resource policy đúng producer và destination.
- VPC endpoint/private connectivity khi yêu cầu không qua Internet.
- KMS encryption và key policy cho stream/destination.
- Không đặt credential tĩnh trong agent/code nếu role/federation dùng được.
- Data lake permission cần tách raw, curated và consumer zones.

## 8. Scenario điển hình

**Đề A:** Clickstream hàng triệu record/phút, nhiều consumer, cần replay và xử lý gần real time.

**Chọn:** Kinesis Data Streams với partition key/capacity phù hợp; consumers độc lập; Firehose có thể delivery xuống S3; Glue/Athena xử lý batch analytics sau đó.

**Đề B:** 500 TB file on-prem phải chuyển trong 10 ngày, đường truyền hiện tại không đủ dù chạy liên tục.

**Chọn:** tính transfer window rồi cân nhắc Snow Family hoặc tăng dedicated connectivity; DataSync giúp online transfer nhưng không vượt giới hạn vật lý của đường truyền.

## 9. Exam traps

- DataSync không phải database CDC; DMS không phải general file copier.
- Firehose delivery khác Data Streams consumer/replay model.
- SQS queue khác ordered replayable stream.
- Glue Data Catalog không tự lưu raw data; S3 lưu data.
- Athena không cần dựng database server nhưng cost/performance phụ thuộc bytes scan.
- Nhiều file rất nhỏ có thể làm analytics kém hiệu quả.
- Amazon Quick Sight trực quan hóa dữ liệu; nó không phải ETL engine chính.

## 10. Checklist làm được task

- [ ] Vẽ đủ source → ingest → store → transform → consume.
- [ ] Chọn batch, queue hay stream từ latency/delivery requirement.
- [ ] Chọn DataSync, Transfer Family, DMS hoặc Snow đúng data type.
- [ ] Phân biệt Data Streams, Firehose, MSK, SQS và EventBridge.
- [ ] Tối ưu S3 analytics bằng format, partition và file size.
- [ ] Thiết kế IAM/TLS/KMS cho ingestion path.

Học sâu: [Integration và Analytics](../../05-NGAY-5-COMPUTE-INTEGRATION/03-INTEGRATION-ANALYTICS.md) và [Migration/Data Transfer](../../06-NGAY-6-COST-MIGRATION-OPS/02-MIGRATION-TRANSFER.md).

Tiếp theo: [Domain 4 — Design Cost-Optimized Architectures](../DOMAIN-4-COST-OPTIMIZED/README.md).
