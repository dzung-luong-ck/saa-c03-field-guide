# Decoupling và Messaging

## 1. Vì sao decouple?

Synchronous chain:

```text
Client → Service A → Service B → Service C
```

Nếu C chậm, B giữ connection, A chậm và client timeout. Coupling lan lỗi ngược.

Asynchronous pattern:

```text
Producer → durable queue/event → consumers
```

Lợi ích:

- buffer spike;
- independent scaling;
- retry/replay;
- failure isolation;
- consumer maintenance không chặn producer.

Trade-off: eventual processing, duplicate handling, observability và workflow complexity.

## 2. Chọn primitive

| Primitive | AWS service | Đặc tính |
|---|---|---|
| Queue | SQS | Competing consumers, buffer, message delete after processing |
| Pub/sub | SNS | Push một message tới nhiều subscribers |
| Event bus | EventBridge | Rules, schema/content matching, SaaS/cross-account routing |
| Stream | Kinesis Data Streams/MSK | Ordered partitions, retention, replay, multiple consumers |
| Workflow | Step Functions | State, retries, branch, wait, callback, orchestration |
| Broker compatibility | Amazon MQ | ActiveMQ/RabbitMQ protocols/APIs, migration ít code change |

## 3. SQS message lifecycle

```text
Producer sends
→ message available in queue
→ consumer receives
→ message becomes invisible
→ consumer processes
→ consumer deletes
```

Nếu không delete trước visibility timeout, message visible lại và có thể được xử lý lần nữa.

### Visibility timeout

- Mặc định 30 giây; cấu hình tối đa theo service limits hiện hành.
- Đặt lớn hơn processing time thông thường.
- Consumer có thể extend bằng `ChangeMessageVisibility` heartbeat.
- Quá ngắn → duplicate concurrent processing.
- Quá dài → failed message chờ lâu trước retry.

### Retention

- Message retention mặc định 4 ngày, tối đa 14 ngày.
- Retention không phải long-term event archive; dùng S3/Kinesis/EventBridge archive theo requirement.

### Long polling

- Chờ message thay vì trả empty response ngay.
- Giảm empty receives và cost.
- Consumer timeout phải lớn hơn receive wait phù hợp.

### Delay queue vs visibility timeout

- Delay: message mới gửi chưa visible trong một khoảng.
- Visibility: message đã receive tạm ẩn trong lúc xử lý.

## 4. SQS Standard vs FIFO

| | Standard | FIFO |
|---|---|---|
| Delivery | At-least-once | Dedup/exactly-once processing semantics theo model |
| Order | Best effort | Strict order trong message group |
| Throughput | Rất cao | High throughput mode/partitioning; thấp hơn hoặc cần design groups |
| Naming | Bất kỳ | Kết thúc `.fifo` |

### FIFO concepts

- `MessageGroupId`: ordering boundary; messages cùng group xử lý tuần tự.
- Nhiều groups cho parallelism.
- Deduplication ID hoặc content-based deduplication chống duplicate sends trong dedup window.
- Một group duy nhất có thể giới hạn concurrency.

Không học thuộc throughput cũ trong slide; high-throughput FIFO và quotas thay đổi. Đề thường hỏi ordering/dedup, không hỏi con số.

## 5. Idempotent consumer

At-least-once systems có thể giao message nhiều lần do retry, timeout hoặc failure sau side effect trước delete.

Pattern:

```text
message id/business id
→ conditional write/idempotency table
→ nếu chưa xử lý: thực hiện action + record result
→ nếu đã xử lý: trả previous result/no-op
```

Công cụ:

- DynamoDB conditional write/transaction.
- Unique DB constraint.
- Idempotency token trong downstream API.
- Outbox/inbox pattern cho atomic event/database workflow.

## 6. Dead-letter queue

- Source queue redrive policy định nghĩa `maxReceiveCount`.
- Message vượt số lần receive chuyển DLQ.
- DLQ retention nên dài hơn source queue để đủ điều tra.
- Monitor DLQ depth/age.
- Sau khi sửa consumer/data, redrive có kiểm soát.

DLQ không tự sửa poison message; chỉ isolate để main queue tiếp tục.

## 7. SQS scaling

### Lambda consumer

- Event source mapping poll SQS.
- Batch size/window ảnh hưởng throughput/latency.
- Partial batch failure tránh retry toàn batch khi chỉ một message lỗi.
- Reserved concurrency bảo vệ downstream.
- Visibility timeout phải phù hợp Lambda timeout/retry behavior.

### EC2/ECS consumers

- Scale theo backlog per worker hoặc age of oldest message.
- Graceful shutdown: stop polling, hoàn tất/extend visibility, delete message, terminate.
- Spot phù hợp nếu jobs retry/idempotent.

## 8. SNS fan-out

```text
Publisher → SNS topic
             ├→ SQS queue Fraud
             ├→ SQS queue Shipping
             ├→ Lambda Notification
             └→ HTTPS endpoint
```

Vì sao SNS → SQS tốt:

- Mỗi consumer domain có durable queue riêng.
- Subscriber downtime không mất message đã vào queue.
- Scale/retry/DLQ độc lập.
- Thêm consumer mới không đổi publisher.

### SNS filtering

Subscription filter policy chỉ gửi message matching tới subscriber, giảm queue noise/cost.

### SNS FIFO

Kết hợp ordering/dedup với compatible FIFO targets. Không dùng Standard SNS nếu end-to-end ordering là hard requirement.

## 9. EventBridge

- Event bus nhận events từ AWS services, custom apps, SaaS và cross-account buses.
- Rules match event pattern/content và route tới targets.
- Scheduler/rules cho time-based tasks.
- Archive/replay theo configuration.
- Schema registry/discovery và Pipes hỗ trợ integration.

Chọn EventBridge khi:

- nhiều event sources/targets;
- content-based routing;
- AWS account/SaaS integration;
- event-driven domain events;
- không cần global strict ordering.

### EventBridge vs SNS

- SNS: direct pub/sub push, simple fan-out, mobile/SMS/email endpoints.
- EventBridge: event bus/rules, richer routing, SaaS/cross-account, archive/replay.

## 10. Step Functions resilience

- Retry với error matching/backoff.
- Catch và compensation path.
- Timeout/heartbeat.
- Parallel/Map.
- Wait/callback/task token cho external/human step.
- Execution history cho audit.

### Standard vs Express

| Standard | Express |
|---|---|
| Long-running, durable, auditable | High-volume, short workflows |
| Exactly-once workflow execution semantics | Async at-least-once; synchronous at-most-once semantics |
| Up to one year | Up to five minutes |
| Supports callback/`.sync` patterns | Không hỗ trợ các pattern này |

Workflow retry vẫn có thể làm task API được gọi lại nếu bạn cấu hình Retry; downstream mutations nên idempotent.

## 11. Stream vs queue

| Requirement | Queue | Stream |
|---|---|---|
| Message biến mất sau consume/delete | Có | Không, record giữ theo retention |
| Replay | Không tự nhiên sau delete | Có |
| Multiple consumers cùng record | Cần fan-out queues | Independent consumers đọc stream |
| Ordering | FIFO group | Partition/shard order |
| Backlog workers | Rất phù hợp | Phù hợp continuous event processing |

## 12. Scenario reasoning

### A. Order phải đi Fraud và Shipping, mỗi bên retry độc lập

SNS/EventBridge fan-out → hai SQS queues → consumers + DLQs. Không cho hai teams cạnh tranh trên cùng queue vì mỗi message chỉ một consumer path nhận.

### B. Image processing spike

S3 event → SQS → Lambda/ECS workers. Queue buffer; consumer idempotent; DLQ; scale theo backlog.

### C. Bank transaction order theo account

SQS FIFO với account ID làm MessageGroupId; nhiều accounts xử lý song song, trong một account giữ order.

### D. AWS API event cần route theo JSON tới nhiều accounts

CloudTrail/EventBridge event bus/rules/cross-account target. SNS đơn giản hơn nếu không cần content routing.

### E. Payment workflow có human approval 24 giờ

Step Functions Standard + callback/task token. Lambda chain không nên giữ invocation 24 giờ.

## 13. Exam traps

- Nhiều consumers trên cùng SQS queue là competing consumers, không fan-out.
- SNS không phải durable queue cho offline subscriber; SNS → SQS.
- Visibility timeout không xóa message.
- FIFO order chỉ trong message group; group design quyết định parallelism.
- DLQ không phải nơi process bình thường.
- EventBridge không đảm bảo global ordering như FIFO/partitioned stream.
- Step Functions orchestrates; EventBridge routes.
- Queue depth cao không nhất thiết scale theo CPU; dùng backlog/age metric.

Tiếp theo: [Ngày 3 — Storage và Database](../03-NGAY-3-STORAGE-DATABASE/README.md).
