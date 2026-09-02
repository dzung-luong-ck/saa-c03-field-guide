# Task 2.1 — Design scalable and loosely coupled architectures

Task này hỏi cách để workload chịu tải tăng, các thành phần không kéo nhau sập và mỗi lớp có thể thay đổi hoặc scale độc lập.

## 1. Giải thích cho người mới

Trong hệ thống coupled, Service A gọi trực tiếp Service B và chờ. Nếu B chậm hoặc dừng, A cũng giữ connection, timeout và có thể cạn tài nguyên.

```text
Coupled:   A → B → C
           lỗi B làm cả chuỗi chậm

Decoupled: A → Queue → B
           queue giữ việc; A và B chạy ở tốc độ khác nhau
```

Loose coupling không có nghĩa mọi call phải async. Login hoặc lấy giá sản phẩm vẫn cần response đồng bộ. Hãy dùng queue/event cho công việc có thể xử lý sau, cần buffer spike hoặc cần nhiều consumer độc lập.

## 2. Stateless và stateful

- Stateless compute không giữ session/file bắt buộc trên một instance cụ thể.
- Externalize session vào DynamoDB/ElastiCache hoặc cookie phù hợp.
- Lưu upload vào S3/EFS thay vì root disk của EC2.
- Stateless targets dễ được ASG/Lambda/Fargate thêm, xóa và replace.

Sticky session giúp legacy tạm thời nhưng không loại single point of failure của local state.

## 3. Scaling strategy

| Kiểu | Ý nghĩa | Khi dùng |
|---|---|---|
| Vertical | Tăng CPU/RAM một node | Scale nhanh cho legacy, nhưng có trần và có thể downtime |
| Horizontal | Thêm nhiều node | Web stateless, workers, distributed workload |
| Target tracking | Giữ metric quanh target | CPU, request/target, backlog phù hợp |
| Scheduled | Scale trước giờ biết trước | Giờ làm việc, chiến dịch đã lên lịch |
| Predictive | Dự đoán pattern lặp | Baseline có chu kỳ, vẫn cần dynamic cho spike |

Metric phải phản ánh bottleneck. Worker đọc SQS nên scale theo backlog/age, không nhất thiết theo CPU.

## 4. Chọn integration service

| Requirement | Dịch vụ/pattern |
|---|---|
| Một hàng đợi, consumer xử lý độc lập | SQS |
| Một message gửi tới nhiều subscriber | SNS fan-out |
| Route event theo source/detail và SaaS | EventBridge |
| Record stream, replay/order theo shard | Kinesis Data Streams |
| Workflow nhiều bước, branch/retry/wait | Step Functions |
| API managed entry point | API Gateway |

### Delivery reality

Consumer phải idempotent vì retry/duplicate có thể xảy ra. Visibility timeout phải dài đủ cho xử lý hoặc được gia hạn. DLQ giữ message lỗi nhiều lần để điều tra, không tự sửa lỗi.

## 5. Multi-tier và microservices

Một architecture thường tách:

```text
Presentation/API tier
→ application/services tier
→ data tier
```

Mỗi tier có scaling và security boundary riêng. Microservices chỉ có ích khi boundary và ownership rõ; tách quá nhỏ làm tăng network call, tracing và operational complexity.

## 6. Compute, container và serverless

- EC2: cần OS control hoặc workload dài/đặc biệt.
- Lambda: event-driven, stateless, scale theo invocation.
- ECS: orchestration AWS-native cho containers.
- EKS: Kubernetes API/ecosystem là requirement.
- Fargate: chạy task/pod được hỗ trợ mà không quản worker nodes.

Đề hỏi “least operational overhead” thường nghiêng managed/serverless, nhưng requirement về runtime, duration, storage, networking và portability vẫn quyết định.

## 7. Cache và edge

- CloudFront cache content gần viewer và giảm load origin.
- ElastiCache cache data/query/session trong memory.
- API Gateway caching có thể giảm backend calls theo API pattern.
- Cache cần TTL, invalidation và behavior khi miss.

Không dùng cache như source of truth nếu mất cache làm sai dữ liệu.

## 8. Scenario điển hình

**Đề:** Upload ảnh tăng đột biến; resize mất 20 giây; API phải trả nhanh; không mất job nếu worker tạm dừng.

**Thiết kế:** API tạo upload vào S3; S3 event → SQS; Auto Scaling/Lambda workers đọc queue; DLQ cho lỗi; worker idempotent; output ghi prefix/bucket khác để tránh event loop.

**Vì sao:** request path không chờ resize; queue buffer spike; workers scale độc lập; message tồn tại khi worker lỗi.

## 9. Exam traps

- Load balancer phân phối request nhưng không phải durable queue.
- SNS không giữ backlog theo cách SQS queue làm cho consumer.
- Queue không tự bảo đảm business action exactly-once; cần idempotency.
- Vertical scaling không tạo HA.
- Read replica tăng read capacity nhưng application phải route read phù hợp.
- Container không tự động nghĩa serverless; ECS trên EC2 vẫn cần quản capacity.
- CloudFront không phải in-memory database cache.

## 10. Checklist làm được task

- [ ] Nhìn ra synchronous bottleneck và chỗ cần queue/event.
- [ ] Chọn SQS, SNS, EventBridge hoặc Kinesis theo delivery model.
- [ ] Thiết kế stateless compute.
- [ ] Chọn metric scaling theo bottleneck.
- [ ] Phân biệt EC2, Lambda, ECS/EKS và Fargate.
- [ ] Giải thích retry, visibility timeout, DLQ và idempotency.

Học sâu: [Decoupling và Messaging](../../02-NGAY-2-RESILIENCE/04-DECOUPLING-MESSAGING.md), [HA và Auto Scaling](../../02-NGAY-2-RESILIENCE/01-HA-AUTO-SCALING.md) và [Lambda/Containers](../../05-NGAY-5-COMPUTE-INTEGRATION/02-LAMBDA-CONTAINERS.md).

Tiếp theo: [Task 2.2 — HA and fault tolerance](TASK-2.2-HA-FAULT-TOLERANT.md).
