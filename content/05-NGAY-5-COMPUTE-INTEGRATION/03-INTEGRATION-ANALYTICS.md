# Integration và analytics

## 1. Chọn đúng kiểu integration

| Nhu cầu | Dịch vụ chính |
|---|---|
| Buffer công việc, một message được một consumer xử lý | SQS |
| Fan-out cùng message cho nhiều subscriber | SNS |
| Định tuyến event theo nội dung/nguồn giữa AWS, SaaS, custom apps | EventBridge |
| Điều phối workflow nhiều bước, state, retry/catch/parallel | Step Functions |
| Thu nhận stream có shard, replay và nhiều consumer | Kinesis Data Streams |
| Chuyển stream đã buffer/biến đổi tới S3/Redshift/OpenSearch | Amazon Data Firehose |
| Managed Kafka | Amazon MSK |
| Managed ActiveMQ/RabbitMQ cho protocol/app tương thích | Amazon MQ |

Chi tiết SQS/SNS/EventBridge nằm ở [Ngày 2](../02-NGAY-2-RESILIENCE/04-DECOUPLING-MESSAGING.md). Bài này tập trung cách kết hợp và phân biệt với data streaming.

## 2. API Gateway

### API type

- **HTTP API**: đơn giản, latency/chi phí thấp, tính năng đủ cho nhiều proxy API.
- **REST API**: API management đầy đủ hơn như usage plan/API key, request validation, transformation và caching theo tính năng được hỗ trợ.
- **WebSocket API**: kết nối hai chiều, real-time.

### Endpoint type

| Type | Ý nghĩa |
|---|---|
| Edge-optimized | Client toàn cầu vào CloudFront distribution do API Gateway quản lý |
| Regional | Endpoint trong một Region; có thể đặt CloudFront của bạn phía trước |
| Private | Chỉ truy cập trong VPC qua interface endpoint/PrivateLink |

Backend có thể là Lambda, HTTP endpoint hoặc service private qua VPC Link. Auth có thể dùng IAM/SigV4, Cognito user pool/JWT authorizer hoặc Lambda authorizer.

API key/usage plan chủ yếu đo/throttle client, **không phải cơ chế authentication mạnh**. Dùng WAF, throttling và quota để bảo vệ API; cache GET response khi dữ liệu cho phép.

## 3. Kinesis Data Streams

- Producer ghi record; **partition key** quyết định shard.
- Thứ tự được bảo đảm trong một shard/partition key, không phải toàn stream.
- Consumer có thể đọc/replay trong retention period; nhiều consumer xử lý độc lập.
- Shard nóng xảy ra khi partition key lệch; chọn key phân bố đều hoặc tăng shard/on-demand mode.
- Enhanced fan-out cho mỗi registered consumer throughput riêng và push records với latency thấp hơn.
- Hợp clickstream, IoT telemetry, log, financial event cần gần real-time và replay.

### Kinesis vs SQS

| Kinesis Data Streams | SQS |
|---|---|
| Nhiều consumer đọc cùng record | Message thường được một consumer xử lý |
| Replay theo retention | Consume rồi delete; DLQ cho lỗi |
| Ordering theo shard | Standard best-effort; FIFO ordering theo message group |
| Shard/partition design | Queue đơn giản, auto scale lớn |

## 4. Amazon Data Firehose

- Fully managed delivery stream; buffer theo size/time rồi giao dữ liệu tới destination.
- Destination thường là S3, Redshift qua S3 staging, OpenSearch và HTTP endpoint được hỗ trợ.
- Có thể transform bằng Lambda và convert format.
- Không phải stream store để consumer tùy ý replay như Kinesis Data Streams.
- Chọn khi đề nói “near real-time delivery, minimal administration” tới data lake/search/warehouse.

## 5. Workflow và event bus

### Step Functions

- State machine thể hiện sequence, choice, parallel, map, wait, retry và catch.
- **Standard Workflow**: exactly-once workflow execution semantics, chạy lâu, audit history; hợp business workflow.
- **Express Workflow**: throughput cao, thời lượng ngắn; sync hoặc async theo loại; cần thiết kế idempotent theo semantics.
- Service integration có thể gọi Lambda/AWS SDK/ECS/Batch mà không tự viết poller.

### EventBridge

- Event bus nhận event từ AWS services, custom app hoặc SaaS partner; rule lọc JSON pattern rồi gửi target.
- Scheduler chạy one-time/recurring task; Pipes nối source → optional filter/enrichment → target.
- Archive/replay hỗ trợ phát lại event đã lưu.
- Schema registry giúp discovery schema, nhưng không biến event bus thành transactional database.

## 6. Data lake, ETL và query

### S3 data lake

S3 thường là tầng durable/low-cost. Thiết kế prefix/partition theo access pattern, nén và dùng columnar format như Parquet/ORC để giảm dữ liệu quét.

### AWS Glue

- Glue Data Catalog lưu metadata/schema dùng chung với Athena/EMR/Redshift Spectrum.
- Crawler khám phá schema; ETL job biến đổi dữ liệu; workflow/data quality phục vụ pipeline.
- Crawler không thay data governance và partition design.

### Athena

- Serverless interactive SQL trực tiếp trên dữ liệu S3/catalog; trả phí chủ yếu theo data scanned.
- Tối ưu bằng partition, compression, columnar format và chỉ select column cần thiết.
- Hợp ad-hoc query/log analysis; không phải OLTP database và không tối ưu cho transaction update liên tục.
- Federated query có thể truy vấn nguồn khác qua connector, nhưng vẫn cân nhắc latency/chi phí của source.

### EMR

- Managed big-data platform cho Spark, Hadoop, Hive, Presto và framework tương tự.
- Chọn khi cần cluster/framework control, custom dependency, distributed processing phức tạp.
- EMR on EC2 cho kiểm soát; EMR Serverless/EKS giảm quản lý tùy workload.
- Spot phù hợp task nodes/retryable work; master/core cần cân nhắc durability.

## 7. Warehouse, search và BI

### Amazon Redshift

- Columnar MPP data warehouse cho OLAP/BI trên dữ liệu có cấu trúc quy mô lớn.
- RA3 tách compute và managed storage; Redshift Serverless giảm quản trị capacity.
- Spectrum query S3 data ngoài cluster; materialized view/caching tối ưu workload lặp lại.
- Không chọn Redshift cho transaction OLTP per-request.

### Amazon OpenSearch Service

- Full-text search, log analytics, observability dashboard.
- Index document để search/aggregation; không phải source of truth transactional mặc định.
- Ingest thường qua Firehose, Lambda, Logstash hoặc OpenSearch Ingestion.

### Amazon Quick

- Phần **Amazon Quick Sight** trong Amazon Quick cung cấp managed BI/dashboard, SPICE in-memory engine và data-source integration.
- Chọn khi đề cần dashboard nhanh, embedded analytics, không quản BI server.

### Lake Formation

- Xây và quản trị data lake tập trung: permission chi tiết trên catalog/table/column, chia sẻ cross-account.
- Kết hợp IAM; quyền Lake Formation không loại bỏ nhu cầu hiểu S3/KMS permissions.

## 8. Database/data service hay nhầm

| Nhu cầu | Chọn |
|---|---|
| OLTP relational | RDS/Aurora |
| Key-value single-digit millisecond | DynamoDB |
| Cache/in-memory | ElastiCache |
| Full-text/search logs | OpenSearch |
| OLAP warehouse | Redshift |
| Ad-hoc SQL trên S3 | Athena |
| Spark/Hadoop processing | EMR |
| Time-series | Timestream |
| Graph relationships | Neptune |
| Immutable ledger/cryptographic verification | QLDB |
| Document API/workload | DocumentDB hoặc DynamoDB theo access pattern |

## 9. ML service recognition

SAA-C03 thường kiểm tra nhận diện use case, không yêu cầu xây model:

- **SageMaker AI**: build/train/deploy ML model tùy chỉnh.
- **Rekognition**: phân tích ảnh/video, object/face/text/moderation.
- **Comprehend**: NLP, sentiment, entity/topic.
- **Textract**: trích text/form/table từ document scan.
- **Transcribe**: speech-to-text.
- **Polly**: text-to-speech.
- **Translate**: dịch ngôn ngữ.
- **Lex**: chatbot/conversational interface.
- **Kendra**: enterprise intelligent search trên nhiều nguồn nội dung.

## 10. Mẫu kiến trúc

### Streaming analytics

`Producers → Kinesis Data Streams → Lambda/analytics consumers`

Song song: `Kinesis → Firehose → S3 data lake → Glue Catalog → Athena/Amazon Quick`.

### Fan-out bền vững

`Publisher → SNS topic → nhiều SQS queue → consumer groups`

Mỗi consumer group có retry/backlog/DLQ riêng; một group hỏng không chặn group khác.

### Event-driven order workflow

`API Gateway → order service → EventBridge → targets`

Luồng business nhiều bước có compensation/retry: EventBridge khởi chạy Step Functions.

### Log analytics

`Sources → CloudWatch Logs/Firehose → OpenSearch` cho search nhanh; đồng thời archive S3 cho lưu dài hạn và Athena query.

## 11. Bẫy đề thi

- Firehose không cho nhiều consumer tùy ý replay như Kinesis Data Streams.
- SNS không giữ backlog cho subscriber offline theo kiểu queue; thêm SQS subscription khi cần durability.
- EventBridge rule filter event, Step Functions giữ workflow state.
- Athena query S3; Redshift là warehouse; OpenSearch là search.
- Glue Crawler phát hiện schema nhưng không làm sạch dữ liệu tự động.
- Ordering toàn stream không tồn tại nếu record nằm nhiều shard.
- API key không thay user authentication/authorization.
- SQS FIFO deduplication không miễn code khỏi idempotency ở mọi failure mode.

## 12. Tự kiểm tra

1. Nhiều app cần đọc/replay cùng telemetry? → Kinesis Data Streams.
2. Chỉ giao telemetry tối thiểu vận hành vào S3? → Firehose.
3. SQL ad-hoc trên Parquet S3? → Athena + Glue Catalog.
4. Petabyte BI warehouse? → Redshift.
5. Full-text product search? → OpenSearch.
6. Spark transformation phức tạp? → EMR/Glue tùy mức kiểm soát.
7. Fan-out với backlog độc lập? → SNS → nhiều SQS queues.
8. Workflow có wait, branch, retry/catch? → Step Functions.
9. Route event theo JSON content? → EventBridge.
10. Managed Kafka compatibility? → MSK.
11. Private REST endpoint chỉ trong VPC? → API Gateway private API + interface endpoint.
12. Dashboard managed? → Amazon Quick Sight trong Amazon Quick.

## Nguồn AWS

- [Amazon Kinesis Data Streams](https://docs.aws.amazon.com/streams/latest/dev/introduction.html)
- [Amazon Data Firehose](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html)
- [AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
- [Amazon EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- [Analytics on AWS](https://aws.amazon.com/big-data/datalakes-and-analytics/)
