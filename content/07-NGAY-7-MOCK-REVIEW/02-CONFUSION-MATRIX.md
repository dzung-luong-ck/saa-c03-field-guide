# Confusion matrix — các cặp dễ nhầm nhất

Đọc cột “chốt chọn” trước; nếu chưa tự giải thích được, quay lại file ngày tương ứng.

## Security và identity

| Cặp/nhóm | Chốt chọn |
|---|---|
| IAM identity policy vs resource policy | Identity policy gắn principal; resource policy gắn resource và có thể cấp cross-account. Đánh giá còn phụ thuộc SCP, boundary, session policy và explicit deny. |
| Permissions boundary vs SCP | Boundary giới hạn maximum của IAM user/role trong account; SCP giới hạn maximum cho account/OU. Cả hai không tự cấp quyền. |
| IAM role vs IAM user | Role dùng temporary credentials/federation/workload/cross-account; user chỉ cho identity dài hạn đặc biệt, tránh access key lâu dài. |
| Cognito User Pool vs Identity Pool | User Pool xác thực user/token; Identity Pool đổi identity/token lấy temporary AWS credentials. |
| KMS vs CloudHSM | KMS managed key service, tích hợp rộng; CloudHSM single-tenant HSM và nhiều quyền kiểm soát/ops hơn. |
| Secrets Manager vs Parameter Store | Secrets Manager chuyên secret + rotation workflow; Parameter Store config/hierarchical parameters, SecureString, thường đơn giản/rẻ hơn. |
| WAF vs Shield vs Network Firewall | WAF lọc HTTP L7; Shield chống DDoS; Network Firewall lọc stateful/stateless network traffic trong VPC. |
| GuardDuty vs Inspector vs Macie | Threat detection; vulnerability management; sensitive data discovery trong S3. |
| Security Hub vs GuardDuty | Security Hub tổng hợp/chuẩn hóa findings và standards; GuardDuty tạo threat findings. |
| ACM vs Private CA | ACM cấp/quản public cert và cert tích hợp; Private CA tạo private PKI có chi phí CA. |

## Networking

| Cặp/nhóm | Chốt chọn |
|---|---|
| Security group vs NACL | SG stateful, allow-only, gắn ENI; NACL stateless, allow/deny theo rule number, gắn subnet. |
| Internet Gateway vs NAT Gateway | IGW cho public-routable traffic hai chiều theo route/security; NAT cho private IPv4 outbound, không nhận inbound unsolicited. |
| NAT Gateway vs egress-only IGW | NAT cho IPv4; egress-only IGW cho IPv6 outbound-only. |
| Gateway endpoint vs interface endpoint | Gateway endpoint chỉ S3/DynamoDB, route-table, không hourly endpoint fee; interface endpoint dùng ENI/PrivateLink cho nhiều service, SG + DNS. |
| VPC peering vs Transit Gateway | Peering point-to-point, non-transitive; TGW hub-and-spoke/transitive routing quy mô lớn. |
| PrivateLink vs peering | PrivateLink expose một service qua endpoint/NLB, không chia sẻ full network; peering cho IP connectivity hai VPC. |
| Site-to-Site VPN vs Direct Connect | VPN nhanh triển khai/encrypted qua Internet; DX private dedicated/predictable, không encrypted mặc định. |
| Route 53 Resolver inbound vs outbound | Inbound: on-prem hỏi private AWS DNS; outbound: VPC chuyển query tới on-prem DNS. |
| ALB vs NLB | ALB L7 HTTP routing/WAF; NLB L4 TCP/UDP/TLS, static IP/source IP/performance. |
| CloudFront vs Global Accelerator | CloudFront CDN/cache HTTP content; GA static Anycast IP, TCP/UDP và regional failover, không cache. |
| Route 53 latency vs geolocation | Latency chọn Region phản hồi tốt hơn; geolocation theo vị trí user cho content/compliance. |
| CNAME vs Alias | CNAME không ở zone apex; Route 53 Alias có thể ở apex và trỏ nhiều AWS resources. |

## Compute và containers

| Cặp/nhóm | Chốt chọn |
|---|---|
| EC2 vs Lambda | EC2 kiểm soát OS/job dài; Lambda event-driven, tối đa 15 phút, ít ops, scale theo invocation. |
| ECS vs EKS | ECS AWS-native đơn giản hơn; EKS khi cần Kubernetes API/ecosystem/portability. |
| EC2 launch type vs Fargate | EC2 quản worker/AMI/capacity, có thể tối ưu tải ổn định; Fargate không quản server. |
| ECS task role vs execution role | Task role cho app code gọi AWS; execution role cho agent pull image/log/secret khi start. |
| Reserved concurrency vs provisioned concurrency | Reserved dành và giới hạn concurrency; provisioned giữ warm environments giảm cold start. |
| Lambda async DLQ vs SQS DLQ | Async DLQ cho event invoke bất đồng bộ thất bại; SQS DLQ theo queue redrive khi message nhận quá nhiều lần. |
| Cluster vs spread vs partition placement | Cluster hiệu năng một AZ; spread hardware isolation ít instance; partition cho distributed system nhiều node. |
| AMI vs EBS snapshot | AMI là launch template gồm metadata/block mappings; EBS snapshot là backup block volume. |
| Elastic Beanstalk vs CloudFormation | Beanstalk PaaS app deployment; CloudFormation generic IaC cho tài nguyên AWS. |

## Storage

| Cặp/nhóm | Chốt chọn |
|---|---|
| S3 vs EBS vs EFS | Object regional API; block volume theo AZ; shared POSIX filesystem regional/multi-AZ. |
| EBS gp3 vs io2 | gp3 general purpose, tách IOPS/throughput; io2 cho critical high IOPS/low latency/durability. |
| EFS vs FSx for Windows | EFS NFS/Linux; FSx Windows SMB/AD/Windows features. |
| FSx for Lustre vs EFS | Lustre high-performance parallel/HPC và S3 integration; EFS general shared NFS elastic. |
| S3 Standard-IA vs One Zone-IA | Standard-IA multi-AZ; One Zone-IA một AZ cho recreatable/secondary data. |
| Glacier Instant vs Flexible vs Deep Archive | Instant millisecond; Flexible phút–giờ; Deep Archive giờ và rẻ nhất cho dài hạn. |
| S3 versioning vs replication | Versioning giữ versions trong bucket; replication copy async sang bucket khác và cần config/permissions. |
| SSE-S3 vs SSE-KMS vs SSE-C | AWS-owned key; KMS key/audit/control; customer gửi key mỗi request và tự quản key. |
| Presigned URL vs CloudFront signed URL | Presigned cấp quyền tạm trực tiếp S3 API; CloudFront signed kiểm soát private CDN content. |

## Database

| Cặp/nhóm | Chốt chọn |
|---|---|
| RDS Multi-AZ vs read replica | Multi-AZ HA/failover; read replica read scaling/DR và replication thường async. |
| Multi-AZ DB instance vs Multi-AZ DB cluster | DB instance có standby không phục vụ read; DB cluster có writer + readable standbys và failover nhanh hơn theo khả năng engine. |
| Aurora reader endpoint vs cluster endpoint | Reader endpoint cân bằng read replicas; cluster/writer endpoint tới writer. |
| Aurora Global Database vs cross-Region read replica | Global Database storage-based cross-Region, low-latency replication/managed switchover; ordinary replica engine-specific. |
| ElastiCache Redis/Valkey vs Memcached | Redis/Valkey có replication, persistence/features richer; Memcached simple multithreaded cache/sharding. |
| DynamoDB GSI vs LSI | GSI partition/sort key khác, tạo sau được, capacity riêng/on-demand; LSI cùng partition key, tạo cùng table, giới hạn collection. |
| DynamoDB on-demand vs provisioned | On-demand cho unpredictable; provisioned/auto scaling cho stable/predictable và kiểm soát capacity. |
| DAX vs ElastiCache | DAX API-compatible DynamoDB read cache; ElastiCache generic cache/session/database acceleration. |
| RDS vs Redshift | RDS OLTP relational; Redshift columnar MPP OLAP warehouse. |
| Neptune vs DocumentDB | Neptune graph relationships; DocumentDB document workload/API compatibility phạm vi cụ thể. |

## Messaging và analytics

| Cặp/nhóm | Chốt chọn |
|---|---|
| SQS vs SNS | Queue/buffer competing consumers; pub/sub push fan-out. |
| SNS vs EventBridge | SNS topic fan-out đơn giản; EventBridge event bus routing theo content/source/SaaS + archive/schema. |
| EventBridge vs Step Functions | Event routing; workflow orchestration có state/branch/retry/wait. |
| SQS Standard vs FIFO | Standard throughput cao, at-least-once/best-effort ordering; FIFO ordering theo message group + dedup, giới hạn/throughput theo chế độ hiện hành. |
| Kinesis Data Streams vs Firehose | Stream store có shard/consumer/replay; managed delivery buffer tới destination. |
| Kinesis vs SQS | Nhiều consumer/replay/order per shard; queue task distribution/delete. |
| MSK vs Amazon MQ | Kafka ecosystem/streaming; ActiveMQ/RabbitMQ protocol compatibility. |
| Athena vs Redshift | Serverless SQL trên S3/data sources; managed/serverless warehouse cho BI OLAP. |
| Glue vs EMR | Serverless metadata/ETL; managed big-data frameworks/cluster control. |
| OpenSearch vs CloudWatch Logs Insights | Search/analytics platform và indexes lâu dài; ad-hoc query CloudWatch logs. |

## Resilience, migration và operations

| Cặp/nhóm | Chốt chọn |
|---|---|
| Backup/restore vs pilot light | Backup khôi phục từ data/IaC; pilot light giữ core services/data replication luôn chạy. |
| Pilot light vs warm standby | Pilot light core tối thiểu; warm standby có bản scaled-down hoạt động đầy đủ hơn. |
| RPO vs RTO | Mất bao nhiêu dữ liệu; mất bao lâu để service hoạt động lại. |
| AWS Backup vs Elastic Disaster Recovery | Policy/orchestrate backups; continuous block replication và server recovery. |
| MGN vs DMS | Server lift-and-shift; database data/schema migration. |
| DataSync vs Storage Gateway | Job transfer/sync; hybrid access/cache liên tục. |
| Snow Family vs Transfer Acceleration | Offline physical transfer; online S3 acceleration qua edge. |
| CloudWatch vs CloudTrail | Metrics/logs/alarms; API audit/activity. |
| CloudTrail vs Config | Ai làm gì; resource config/compliance/timeline. |
| CloudFormation vs StackSets | Một/một số stack target; rollout stack multi-account/Region. |
| AWS Health vs CloudWatch | AWS/account service events; workload telemetry/custom health. |

## Cost

| Cặp/nhóm | Chốt chọn |
|---|---|
| Savings Plans vs Reserved Instances | Spend commitment linh hoạt compute; reservation/discount theo service/attributes. |
| Discount vs Capacity Reservation | Giảm giá không luôn giữ capacity; OD Capacity Reservation giữ capacity nhưng không tự giảm giá. |
| Cost Explorer vs Budgets | Phân tích/forecast; threshold alert/action. |
| CUR/Data Exports vs Cost Explorer | Dữ liệu billing chi tiết để tự phân tích; giao diện khám phá managed. |
| Trusted Advisor vs Compute Optimizer | Best-practice checks rộng; right-size recommendations dựa utilization. |
| S3 lifecycle vs Intelligent-Tiering | Rule chuyển theo thời gian biết trước; tự tier theo observed access khi khó dự đoán. |

## Cách dùng 20 phút cuối

1. Che cột “chốt chọn”.
2. Với mỗi hàng, nói một scenario làm dịch vụ bên trái thắng và một scenario bên phải thắng.
3. Đánh dấu tối đa 10 hàng còn yếu.
4. Chỉ quay lại file chi tiết của 10 hàng đó; không đọc lại toàn bộ.
