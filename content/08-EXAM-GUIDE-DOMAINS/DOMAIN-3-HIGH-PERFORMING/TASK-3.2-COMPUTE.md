# Task 3.2 — Design high-performing and elastic compute solutions

Task này hỏi code nên chạy ở đâu, cần bao nhiêu capacity, scale theo tín hiệu nào và làm sao để từng thành phần tăng/giảm mà không gây nghẽn dây chuyền.

## 1. Giải thích cho người mới

Compute là CPU, memory, accelerator và runtime thực thi code. “Elastic” nghĩa hệ thống tự tăng capacity khi tải lên và giảm khi tải xuống. “High-performing” nghĩa đạt latency/throughput cần thiết, không nhất thiết dùng máy lớn nhất.

## 2. Chọn compute model

| Requirement | Hướng chọn |
|---|---|
| Toàn quyền OS, driver, networking, workload dài | EC2 |
| Event/request ngắn, stateless, scale nhanh | Lambda |
| Container với AWS-native orchestration | ECS |
| Kubernetes API/ecosystem bắt buộc | EKS |
| Container không muốn quản nodes | Fargate |
| Batch jobs có queue/scheduler và compute environments | AWS Batch |
| Big data framework như Spark/Hadoop | Amazon EMR |

Không chọn Kubernetes chỉ vì “container”; EKS thêm operational complexity và chỉ đáng khi requirement cần Kubernetes.

## 3. EC2 instance families

- General purpose: cân bằng CPU/memory/network.
- Compute optimized: CPU-intensive.
- Memory optimized: in-memory/large working set.
- Storage optimized: local high I/O/throughput.
- Accelerated computing: GPU/ML/HPC use case.

Size theo metric. CPU thấp nhưng memory cạn cần family/size khác; network throughput chạm trần không được giải chỉ bằng thêm RAM.

## 4. Auto Scaling đúng tín hiệu

ASG có min, desired, max và launch template. Target tracking phù hợp metric liên hệ gần tuyến tính với capacity.

| Workload | Metric gợi ý |
|---|---|
| Web targets sau ALB | Request count per target, CPU hoặc latency phù hợp |
| SQS workers | Backlog per instance, age of oldest message |
| Stream consumer | Iterator age/lag |
| Scheduled business traffic | Scheduled baseline + dynamic scaling |

Scale-out thường nhanh hơn scale-in; scale-in cần cooldown/stabilization và drain để tránh giết request/job đang chạy.

## 5. Lambda performance

- Memory setting thường ảnh hưởng cả CPU allocation; đo duration và cost cùng nhau.
- Cold start quan trọng với latency-sensitive synchronous path; provisioned concurrency khi requirement/cost phù hợp.
- Reserved concurrency giới hạn/bảo vệ capacity giữa functions.
- Async invocation, queue và stream event source có retry/batch behavior khác nhau.
- Function phải idempotent khi event có thể được giao lại.

Lambda không mặc định tốt cho mọi tác vụ dài, stateful, cần OS control hoặc network connection đặc biệt.

## 6. Containers và orchestration

ECS/EKS quyết định placement, health, service desired count và rollout. Capacity có thể là EC2 hoặc Fargate. Tách hai câu hỏi:

1. Ai orchestration container?
2. Ai quản compute capacity bên dưới?

Fargate giảm quản node nhưng task sizing, networking, logs và autoscaling vẫn cần thiết kế.

## 7. Decouple để scale độc lập

Nếu API vừa nhận request vừa chạy job 10 phút, web capacity bị giữ. Đưa job vào SQS/Step Functions giúp API trả sớm và worker scale theo backlog.

CloudFront/cache giảm lượng compute phải làm. Read replica/cache giảm compute time bị chờ database. Đôi khi cách tối ưu compute tốt nhất là loại công việc không cần thực hiện.

## 8. Scenario điển hình

**Đề:** Mỗi tối có hàng triệu file cần transcoding; job độc lập, retry được, thời gian hoàn thành trong vài giờ, traffic ban ngày thấp.

**Chọn:** S3 event/manifest → queue → AWS Batch hoặc container workers Auto Scaling; Spot cho phần fault-tolerant phù hợp; checkpoint/idempotency; metric theo backlog/deadline.

**Không chọn:** EC2 On-Demand lớn chạy 24/7; Lambda nếu job vượt execution/runtime constraints; scale theo web CPU không liên quan.

## 9. Exam traps

- Scale up không tự tạo HA.
- Average CPU có thể che một shard/partition/queue đang nghẽn.
- ECS không đồng nghĩa Fargate; EKS không đồng nghĩa EC2 duy nhất.
- Provisioned concurrency giảm cold start nhưng có cost.
- Spot có thể bị thu hồi; cần workload fault-tolerant.
- Placement group cluster tăng network performance trong một AZ, không phải multi-AZ HA.

## 10. Checklist làm được task

- [ ] Chọn compute theo runtime và operational requirement.
- [ ] Chọn instance family từ bottleneck.
- [ ] Chọn metric scaling phản ánh demand.
- [ ] Phân biệt orchestration và capacity provider.
- [ ] Biết lúc nào queue/batch tốt hơn synchronous compute.
- [ ] Giải thích cold start, concurrency và idempotency ở mức kiến trúc.

Học sâu: [EC2 và Auto Scaling](../../05-NGAY-5-COMPUTE-INTEGRATION/01-EC2-AUTO-SCALING.md) và [Lambda/Containers](../../05-NGAY-5-COMPUTE-INTEGRATION/02-LAMBDA-CONTAINERS.md).

Tiếp theo: [Task 3.3 — Database](TASK-3.3-DATABASE.md).
