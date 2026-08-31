# Lambda và containers

## 1. Compute decision tree

1. Code chạy theo event, thời lượng ngắn, scale tự động và không muốn quản lý server? → **Lambda**.
2. Ứng dụng đóng gói container, muốn AWS-native orchestration? → **ECS**.
3. Cần Kubernetes API/ecosystem/portability? → **EKS**.
4. Muốn container nhưng không quản lý worker node? → **Fargate** với ECS/EKS.
5. Batch job có queue/scheduling/dependency và dùng container? → **AWS Batch**.
6. Muốn PaaS deploy web app, ít điều khiển orchestration? → **Elastic Beanstalk**.

## 2. AWS Lambda

### Mô hình cơ bản

- Function là stateless compute; execution environment có thể được tái sử dụng nhưng không được dựa vào nó để giữ state bền vững.
- Tăng memory đồng thời tăng CPU/network tương ứng; thử nhiều mức memory để tối ưu cả latency và chi phí.
- Mỗi invocation tối đa 15 phút. Job lâu hơn: ECS/Fargate, Batch, EC2 hoặc chia workflow bằng Step Functions.
- `/tmp` là ephemeral storage của execution environment; S3/EFS/database giữ dữ liệu bền vững.
- Environment variable phù hợp cấu hình; secret nên lấy từ Secrets Manager/Parameter Store và mã hóa/kiểm soát IAM.

### Invocation model

| Loại | Ví dụ | Hành vi chính |
|---|---|---|
| Synchronous | API Gateway, ALB, SDK invoke | Caller chờ response và thường chịu trách nhiệm retry |
| Asynchronous | S3 event, EventBridge, SNS | Lambda queue nội bộ, tự retry; có DLQ/destination |
| Poll-based event source mapping | SQS, Kinesis, DynamoDB Streams, MSK | Lambda poll, batch record và quản lý checkpoint theo source |

Với SQS, message chỉ bị xóa khi batch xử lý thành công. Dùng partial batch response để tránh retry toàn batch khi chỉ vài record lỗi.

### Concurrency

- **Concurrency** = số invocation đang chạy đồng thời.
- **Reserved concurrency** vừa dành capacity cho function vừa đặt trần để nó không chiếm hết regional pool.
- **Provisioned concurrency** giữ execution environment sẵn sàng để giảm cold start; trả phí cho capacity được provision.
- Throttling xảy ra khi hết concurrency; client/event source retry tùy invocation model.
- Dùng SQS làm buffer khi downstream có giới hạn connection/throughput; kiểm soát maximum concurrency/batch size.

### Retry, DLQ và destination

- Code phải idempotent vì event có thể được giao lại.
- Async invocation retry theo service behavior; DLQ lưu event thất bại, destination có thể nhận record thành công/thất bại giàu context hơn.
- SQS event source dùng SQS redrive policy/DLQ; đừng nhầm với Lambda async DLQ.
- Visibility timeout phải đủ cho function timeout + retry margin.

### Networking và data access

- Lambda ngoài VPC vẫn truy cập Internet và public AWS endpoints theo mặc định.
- Lambda gắn VPC cần subnet và security group; để ra Internet từ private subnet cần route qua NAT. Gắn vào public subnet không tự cấp public IP.
- Ưu tiên VPC endpoints khi chỉ cần AWS services như S3/DynamoDB/Secrets Manager.
- Có thể mount EFS khi Lambda ở VPC; phù hợp shared POSIX files, không thay object store.
- **RDS Proxy** pool connection, hữu ích khi Lambda burst tạo quá nhiều database connection; không biến SQL query chậm thành nhanh.

### API và edge

- API Gateway cung cấp REST/HTTP/WebSocket API, auth, throttling, caching tùy loại API.
- Lambda@Edge/CloudFront Functions chạy logic gần edge; không dùng thay backend compute phức tạp.
- Function URL là HTTP endpoint đơn giản; API Gateway phù hợp khi cần API management đầy đủ.

### Version, alias, layer

- Version là snapshot bất biến; `$LATEST` thay đổi được.
- Alias trỏ version và có thể chia weighted traffic cho canary.
- Layer chia sẻ library/dependency, nhưng container image hoặc build pipeline có thể phù hợp hơn với dependency lớn.

## 3. Amazon ECS

### Khái niệm

- **Cluster**: phạm vi chạy service/task.
- **Task definition**: blueprint versioned gồm image, CPU/RAM, port, env, volume, role và log config.
- **Task**: một lần chạy task definition.
- **Service**: duy trì desired task count, tích hợp load balancer và deployment.

### Hai role rất hay nhầm

| Role | Ai dùng | Ví dụ quyền |
|---|---|---|
| Task execution role | ECS/Fargate agent để khởi động task | pull image ECR, ghi CloudWatch Logs, lấy secret lúc launch |
| Task role | Code bên trong container | đọc S3, ghi DynamoDB, publish SNS |

Không nhúng access key trong image. Mỗi task/service dùng least-privilege task role.

### EC2 launch type và Fargate

| ECS on EC2 | ECS on Fargate |
|---|---|
| Quản lý AMI, patch, ASG, bin-packing | Không quản lý server |
| Linh hoạt instance/GPU/host/storage | Task-level CPU/RAM options |
| Có thể tối ưu chi phí tải ổn định | Hợp tải biến động, đội nhỏ, isolation theo task |

ECS Service Auto Scaling scale số task. Nếu dùng EC2 launch type, còn phải scale cluster capacity; capacity provider phối hợp hai lớp.

## 4. Amazon EKS

- Managed Kubernetes control plane; worker chạy trên EC2 hoặc Fargate.
- Chọn khi tổ chức cần Kubernetes API, tooling, operator, workload portability hoặc đã có kỹ năng K8s.
- Đổi lại độ phức tạp vận hành cao hơn ECS.
- IAM Roles for Service Accounts/Pod Identity cấp quyền AWS theo workload, không dùng chung node role quá rộng.
- EKS không tự động là multi-Region; control plane regional và workload phải trải nhiều AZ.

## 5. ECR, App Runner, Beanstalk và Batch

- **ECR**: private/public container registry, image scanning, lifecycle policy, cross-Region/cross-account replication.
- **App Runner**: deploy web service từ source/image, tự build/deploy/scale; ít kiểm soát network/orchestration hơn ECS.
- **Elastic Beanstalk**: PaaS điều phối EC2, ASG, ELB và deployment; tài nguyên vẫn thuộc account và có thể tùy chỉnh.
- **AWS Batch**: xếp hàng/schedule batch job container trên EC2/Fargate, chọn compute và dependency; hợp job không cần server luôn bật.

### Beanstalk deployment

- All at once: nhanh/rẻ, có downtime.
- Rolling: thay theo batch, capacity giảm trong lúc deploy.
- Rolling with additional batch: giữ capacity, tốn thêm tạm thời.
- Immutable: tạo instance mới riêng, rollback an toàn hơn.
- Traffic splitting: canary theo phần trăm.

## 6. Container storage/networking

- EFS cho shared persistent POSIX storage giữa task ở nhiều AZ.
- EBS phù hợp block storage gắn theo điều kiện orchestration/availability zone.
- S3 là object store, không mount như filesystem chuẩn trừ giải pháp chuyên dụng.
- ECS `awsvpc` mode cấp ENI/security group cho task, dễ cô lập network.
- ALB hợp HTTP path/host routing tới nhiều ECS service; NLB cho TCP/UDP/static IP/PrivateLink.

## 7. Mẫu kiến trúc

### Serverless API

`Route 53 → CloudFront/WAF → API Gateway → Lambda → DynamoDB`

- Cognito/JWT authorizer cho user auth.
- SQS/EventBridge cho công việc bất đồng bộ.
- X-Ray/CloudWatch cho trace/log/metric.

### Container microservices

`ALB → ECS services on Fargate → Aurora/RDS Proxy + ElastiCache`

- Route theo path/host.
- Mỗi service một task role và scaling policy.
- Service discovery/Cloud Map khi service-to-service không qua public ALB.

### Batch processing

`S3 event/EventBridge → queue/workflow → AWS Batch → S3 results`

- Spot cho job retryable.
- Step Functions nếu có nhiều bước/nhánh/catch.

## 8. Bẫy đề thi

- Fargate là compute engine, không phải orchestrator độc lập: dùng với ECS hoặc EKS.
- ECS task execution role không cấp quyền S3 cho application nếu đó là task role cần dùng.
- Lambda trong public subnet không tự có Internet.
- Provisioned concurrency giảm cold start, không phải reserved concurrency.
- Lambda timeout 15 phút loại trừ job dài liên tục.
- EKS chỉ vì “container” thường là over-engineering nếu không có Kubernetes requirement.
- Container image không làm data trong writable layer trở nên bền vững.
- Beanstalk không phải serverless; phía dưới vẫn là AWS resources.

## 9. Tự kiểm tra

1. API event-driven, mỗi request 200 ms, không quản server? → Lambda.
2. Container HTTP, đội không có K8s, muốn ít ops? → ECS Fargate.
3. Bắt buộc dùng Helm/operator/Kubernetes APIs? → EKS.
4. Function burst làm RDS hết connection? → RDS Proxy + concurrency control.
5. Code container cần đọc S3? → task role.
6. ECS agent cần pull ECR? → task execution role.
7. Job 2 giờ, container, retry được? → Batch/ECS, không Lambda.
8. Lambda cần gọi S3 private, không NAT? → gateway VPC endpoint cho S3.
9. Canary serverless? → Lambda version + weighted alias/API Gateway canary.
10. Shared POSIX files cho tasks đa AZ? → EFS.

## Nguồn AWS

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Amazon ECS Developer Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html)
- [AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
