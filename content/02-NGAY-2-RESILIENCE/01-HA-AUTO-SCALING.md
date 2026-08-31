# High Availability và Auto Scaling

## 1. Định nghĩa không được nhầm

| Thuộc tính | Câu hỏi | Ví dụ |
|---|---|---|
| High availability | Hệ thống giảm downtime thế nào? | Multi-AZ + automatic failover |
| Fault tolerance | Hỏng thành phần có tiếp tục chạy gần như không gián đoạn? | Redundant active components, multi-site |
| Scalability | Capacity có tăng để xử lý tải không? | Scale out EC2/read replicas |
| Elasticity | Có tự động tăng và thu hồi đúng lúc không? | ASG target tracking, Lambda |
| Durability | Dữ liệu có còn nguyên qua thời gian/lỗi không? | S3 replication across AZs, backups |

HA không đồng nghĩa zero downtime. Multi-AZ failover vẫn có thể làm connection bị reset hoặc cần retry.

## 2. Failure domains

```text
Resource/process
→ EC2 host
→ Availability Zone
→ Region
→ Account/credential plane
→ Global dependency
```

Mỗi requirement cần control phù hợp failure domain:

- Process crash: supervisor, health check, replace task.
- Instance failure: ASG replace instance.
- AZ failure: deploy across AZs.
- Region failure: multi-Region DR.
- Account compromise: cross-account logs/backups.
- Dependency failure: queue, timeout, circuit breaker, graceful degradation.

## 3. Multi-AZ web architecture

```text
Route 53 alias
  → internet-facing ALB ở public subnets AZ-A/AZ-B
    → ASG EC2 ở private app subnets AZ-A/AZ-B
      → RDS Multi-AZ/Aurora ở private DB subnets
```

Điều kiện để thật sự HA:

- Load balancer enable ít nhất hai AZ/subnets theo requirement.
- ASG có capacity phân bố nhiều AZ.
- Targets healthy ở nhiều AZ, không chỉ load balancer subnets.
- Database/data layer chịu lỗi tương ứng.
- App stateless hoặc state externalized.
- NAT/endpoints/DNS và dependencies không tạo single point of failure.

## 4. Elastic Load Balancing

ELB là managed service: AWS quản nodes, scaling infrastructure, health checks và HA của load balancer. Bạn vẫn quản listeners, target groups, certificates, rules và healthy targets.

### Target groups

- Register EC2 instances, IP addresses, Lambda hoặc ALB tùy LB type/feature.
- Health check tách khỏi client traffic.
- Deregistration delay cho in-flight requests hoàn tất.
- Slow start/warm-up nơi phù hợp giảm overload target mới.

### Health check layers

| Check | Phát hiện | Không phát hiện tốt |
|---|---|---|
| TCP | Port có accept connection | App logic/database dependency hỏng |
| HTTP `/health` | Web process trả response | Deep dependency nếu endpoint quá nông |
| Deep health | DB/cache/dependency chain | Có thể loại toàn fleet khi dependency chung hỏng |

Best practice: liveness check cho biết instance cần replace; readiness check cho biết có nên nhận traffic. Không làm health endpoint phụ thuộc quá nhiều shared services khiến mọi target cùng bị đánh unhealthy.

### Cross-zone load balancing

- Cho phép load balancer node phân phối tới targets ở AZ khác.
- Default/charge behavior khác theo load balancer type và có thể thay đổi; đề thường hỏi mục đích, không hỏi giá trị mặc định.
- Dù cross-zone, nên giữ đủ capacity mỗi AZ cho AZ failure và cost/performance.

## 5. Auto Scaling Group

ASG quản:

- desired/min/max capacity;
- launch template;
- health replacement;
- multi-AZ distribution;
- scaling policies;
- lifecycle hooks, warm pools và instance refresh.

### Launch template

Chứa AMI, instance type, SG, IAM instance profile, user data, storage và metadata options. Dùng versioning để rollout có kiểm soát.

### Health sources

- EC2 status checks.
- ELB target health nếu bật integration.
- Custom health thông qua API/workflow.

Một EC2 process vẫn chạy nhưng app trả 500: EC2 health có thể không phát hiện; ELB health có thể giúp ASG replace.

## 6. Scaling policies

| Policy | Cách hoạt động | Dùng khi |
|---|---|---|
| Target tracking | Giữ metric gần target | Lựa chọn mặc định cho CPU/request/backlog metric tỷ lệ thuận |
| Step scaling | Scale amount theo mức alarm | Cần phản ứng mạnh hơn khi metric vượt xa ngưỡng |
| Simple scaling | Một action + cooldown | Legacy/simple; thường kém linh hoạt hơn |
| Scheduled scaling | Capacity theo lịch | Tải biết trước: office hours, campaign |
| Predictive scaling | Forecast recurring pattern | Pattern lặp lại, cần scale trước |

### Metric tốt phải “scale proportionally”

- CPU average có thể tốt cho CPU-bound app.
- ALB request count per target tốt cho request workload.
- SQS backlog per instance/age tốt cho workers.
- Network throughput tốt nếu công việc network-bound.
- Không dùng metric không đổi khi thêm instances.

### Cooldown, warm-up và flapping

- Instance warm-up tránh tính target mới trước khi sẵn sàng.
- Scale-in cooldown/behavior tránh tăng giảm liên tục.
- Scale-out thường phản ứng nhanh; scale-in thận trọng để không giảm quá mức.

## 7. Lifecycle hooks, warm pool, instance refresh

### Lifecycle hooks

Giữ instance ở pending/wait hoặc terminating/wait để:

- download config/model;
- register external system;
- drain jobs/logs;
- snapshot state cần thiết.

Hook cần timeout và failure handling; không để instance kẹt vô hạn.

### Warm pool

- Giữ pre-initialized instances ở stopped/hibernated/running state tùy support.
- Giảm launch latency cho workload boot chậm.
- Có cost; không cần cho stateless app boot nhanh.

### Instance refresh

- Rollout launch template/AMI mới theo batch.
- Set minimum healthy percentage và checkpoints.
- Kết hợp immutable infrastructure và rollback plan.

## 8. Stateless design

Local state làm scale/failover khó:

- User session trên một EC2.
- Uploaded files trên instance root disk.
- Scheduled job state trong memory.
- Cache bắt buộc để app correctness.

Externalize state:

| State | Store |
|---|---|
| Session | ElastiCache/DynamoDB, hoặc signed client cookie phù hợp |
| Files | S3/EFS/FSx theo access pattern |
| Relational data | RDS/Aurora |
| Job queue | SQS/Kinesis/EventBridge |
| Config/secret | Parameter Store/Secrets Manager |

Stickiness có thể hỗ trợ legacy session nhưng không thay việc thiết kế shared session store cho resilience.

## 9. Retry, timeout và idempotency

Distributed call phải có:

- connection timeout;
- request timeout;
- bounded retries;
- exponential backoff + jitter;
- circuit breaker/graceful fallback;
- idempotency cho mutating retry.

Không retry mọi lỗi. 4xx validation/auth thường không transient; 429/5xx/network có thể retry theo policy.

## 10. Placement groups và resilience

| Type | Performance/failure effect |
|---|---|
| Cluster | Low latency/high throughput trong một AZ; tăng correlated-failure risk |
| Spread | Instances trên distinct hardware; maximum host isolation, group nhỏ |
| Partition | Racks/partitions tách biệt; app phân dữ liệu/shards |

Cluster placement group không phải giải pháp HA multi-AZ. Spread/partition hỗ trợ hardware isolation nhưng application vẫn cần replication.

## 11. Scenario reasoning

### A. Traffic tăng theo giờ làm việc

- Scheduled scaling tăng baseline trước giờ mở cửa.
- Target tracking xử lý biến động trong giờ.
- ALB phân phối; stateless targets ở nhiều AZ.

### B. Video processing workers đọc SQS

- ASG metric theo backlog per instance hoặc age of oldest message.
- Spot có thể dùng nếu jobs retry/checkpoint được.
- Lifecycle hook drain/stop nhận jobs mới khi terminate.

### C. App boot 15 phút

- Bake dependencies vào AMI thay download lúc boot.
- Warm pool hoặc predictive/scheduled scaling.
- Health/readiness chỉ register khi app sẵn sàng.

### D. Mọi target unhealthy khi DB maintenance

Deep health endpoint phụ thuộc DB khiến ALB loại toàn fleet. Tách liveness khỏi dependency readiness; app có thể trả degraded/read-only/cached response nếu business cho phép.

## 12. Exam traps

- Multi-AZ ALB nhưng targets một AZ không tạo application HA.
- ASG min=max=1 trong một AZ không chịu AZ failure.
- Sticky session không phải failover-safe session storage.
- Scale vertically không cung cấp elasticity/HA như scale out.
- Cluster placement group ưu tiên performance, không resilience.
- Health check quá nông bỏ lỡ app failure; quá sâu có thể gây cascading outage.
- Predictive scaling không thay dynamic scaling cho spike bất thường.

Tiếp theo: [Database Resilience](02-DATABASE-RESILIENCE.md).
