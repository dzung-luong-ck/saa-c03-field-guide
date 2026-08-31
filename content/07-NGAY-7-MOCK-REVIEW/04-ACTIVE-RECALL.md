# Active recall — 70 câu hỏi chốt kiến thức

Cách dùng: che phần sau dấu `→`, trả lời thành tiếng trong tối đa 20 giây. Câu nào không chắc, đánh dấu `?` và chỉ ôn lại đúng chủ đề đó.

## Security — 1 đến 14

1. Một explicit deny và một allow cùng áp dụng thì kết quả? → Deny.
2. SCP có cấp quyền cho IAM role không? → Không; SCP chỉ đặt trần quyền tối đa.
3. Cách tốt nhất để EC2 gọi S3? → IAM role qua instance profile, temporary credentials.
4. Cross-account role cần hai phía nào? → Trust policy ở role đích và caller có quyền `sts:AssumeRole`.
5. User authentication cho web/mobile dùng gì? → Cognito User Pool; cần AWS credentials thì thêm Identity Pool.
6. KMS data key dùng để làm gì? → Mã hóa data local; encrypted data key được lưu cạnh ciphertext theo envelope encryption.
7. Khi nào chọn customer managed KMS key? → Cần tự quản policy, rotation/import/multi-Region theo tính năng, audit/control chi tiết.
8. Secret cần rotation managed? → Secrets Manager.
9. S3 private qua CloudFront? → OAC + bucket policy + Block Public Access.
10. SQL injection/cross-site scripting? → AWS WAF.
11. Managed DDoS protection cơ bản? → Shield Standard; advanced protection/support/cost protection theo phạm vi → Shield Advanced.
12. Phát hiện compromised credential/anomalous API? → GuardDuty.
13. Tìm PII trong S3? → Macie.
14. Kiểm tra vulnerability EC2/ECR/Lambda? → Inspector.

## Networking — 15 đến 28

15. SG stateful nghĩa là gì? → Return traffic của flow được cho phép tự động, không cần inbound/outbound mirror rule.
16. NACL stateless nghĩa là gì? → Phải cho phép cả hai chiều, kể cả ephemeral ports; rule theo số từ thấp lên.
17. Public subnet được định nghĩa bởi gì? → Route table có route tới Internet Gateway; resource còn cần public IP và security cho Internet access.
18. Instance private ra IPv4 Internet? → NAT Gateway/instance theo thiết kế; đề thường chọn NAT Gateway.
19. IPv6 outbound-only? → Egress-only Internet Gateway.
20. S3/DynamoDB private access không NAT? → Gateway VPC endpoint.
21. Private access tới nhiều AWS services qua ENI? → Interface VPC endpoint/PrivateLink.
22. Kết nối 50 VPC transitive hub? → Transit Gateway.
23. Expose một private service cho nhiều customer VPC, kể cả overlapping CIDR? → PrivateLink + endpoint service/NLB.
24. On-prem DNS cần resolve private hosted zone? → Route 53 Resolver inbound endpoint.
25. VPC workload cần resolve on-prem zone? → Resolver outbound endpoint + forwarding rule.
26. HTTP path routing? → ALB.
27. TCP/UDP, static regional IP? → NLB.
28. Static Anycast IP, multi-Region failover, không cache? → Global Accelerator.

## Resilience và DR — 29 đến 38

29. Multi-AZ RDS giải gì? → HA/failover của writer, không phải read scaling.
30. Read replica giải gì? → Read scaling và có thể promote/DR tùy engine; replication thường async.
31. Aurora reader endpoint? → Load-balance read connections tới replicas.
32. RPO 5 phút nghĩa là gì? → Chấp nhận mất tối đa khoảng 5 phút dữ liệu.
33. RTO 30 phút nghĩa là gì? → Service phải phục hồi trong tối đa khoảng 30 phút.
34. DR rẻ nhất nhưng restore lâu? → Backup and restore.
35. Core data/service tối thiểu chạy ở DR Region? → Pilot light.
36. Bản scaled-down hoạt động ở DR Region? → Warm standby.
37. SQS bảo vệ availability như thế nào? → Decouple, buffer burst/failure, retry độc lập.
38. Vì sao consumer phải idempotent? → At-least-once/retry có thể giao event trùng.

## Storage/database — 39 đến 51

39. Block volume cho một EC2, low-latency? → EBS.
40. Shared Linux POSIX file system đa AZ? → EFS.
41. Shared Windows SMB/AD integration? → FSx for Windows File Server.
42. HPC parallel filesystem gắn S3? → FSx for Lustre.
43. S3 class cho unpredictable access? → Intelligent-Tiering.
44. Archive hiếm, chấp nhận restore nhiều giờ? → Glacier Deep Archive.
45. Bảo vệ khỏi xóa/ghi đè object? → Versioning; compliance WORM → Object Lock.
46. Copy S3 object sang Region/account khác? → CRR/SRR replication + versioning/permissions.
47. Relational transaction managed? → RDS/Aurora.
48. Key-value serverless millisecond? → DynamoDB.
49. GSI khác LSI ở điểm chốt nào? → GSI có partition key khác và tạo sau; LSI cùng partition key và tạo với table.
50. Cache API-compatible DynamoDB? → DAX.
51. Graph relationship traversal? → Neptune.

## Compute/integration/analytics — 52 đến 63

52. Function chạy tối đa bao lâu? → 15 phút.
53. Reserved concurrency làm gì? → Dành và cap concurrency cho function.
54. Provisioned concurrency làm gì? → Giữ environment warm để giảm cold start.
55. Lambda burst làm RDS cạn connection? → RDS Proxy, concurrency control và/hoặc queue.
56. ECS execution role vs task role? → Agent launch task vs application code gọi AWS.
57. Container không quản worker node? → Fargate.
58. Kubernetes API bắt buộc? → EKS.
59. Một message cho nhiều subscriber? → SNS; cần backlog riêng thì SNS → SQS.
60. Content-based event routing/SaaS event bus? → EventBridge.
61. Workflow branch/wait/retry/catch? → Step Functions.
62. Stream cần replay và nhiều consumer? → Kinesis Data Streams.
63. Managed delivery stream vào S3/OpenSearch/Redshift? → Firehose.

## Cost, migration và ops — 64 đến 70

64. Chiết khấu compute theo cam kết chi tiêu linh hoạt? → Savings Plans.
65. Capacity có thể bị thu hồi nhưng rẻ cho job retryable? → Spot.
66. Giữ chắc EC2 capacity trong AZ? → On-Demand Capacity Reservation.
67. Rehost server block replication? → Application Migration Service (MGN).
68. Database full load + CDC? → DMS; khác engine cần schema conversion.
69. File/object online sync vào S3/EFS/FSx? → DataSync.
70. Ai làm gì / health metric / config history? → CloudTrail / CloudWatch / AWS Config.

## Bonus scenario — không nhìn đáp án

### A. Private API

Yêu cầu: API chỉ từ VPC, Lambda gọi DynamoDB và Secrets Manager, không NAT.

→ Private API Gateway/interface endpoint; Lambda private subnets; DynamoDB gateway endpoint; Secrets Manager interface endpoint; SG/IAM/KMS least privilege.

### B. Global media

Yêu cầu: video S3 private, user toàn cầu, URL tạm thời.

→ CloudFront + OAC + signed URL/cookie + Route 53; S3 Block Public Access.

### C. Flash sale

Yêu cầu: đơn hàng burst, không làm DB sập, không mất request.

→ API/ingress → durable SQS → idempotent workers → database; scale theo backlog, DLQ, visibility timeout.

### D. On-prem database cutover

Yêu cầu: đổi engine, downtime vài phút.

→ Schema assessment/conversion + DMS full load/CDC + validation + quiesce/cutover/rollback plan.

### E. Multi-account audit

Yêu cầu: không cho workload admin xóa dấu vết.

→ Organization trail tới log archive account, bucket/KMS policy, log validation/retention, SCP guardrails, Config/Security Hub aggregation.

## Chấm nhanh

- 63–70 đúng: chỉ xem cram sheet và lỗi cá nhân.
- 55–62 đúng: ôn confusion matrix các câu sai.
- < 55 đúng: chọn 2 domain yếu nhất, học lại file chi tiết; không cố nhồi mọi thứ.
