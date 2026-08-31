# Cram sheet SAA-C03 — đọc trong 30–45 phút

## 1. Exam anchors

- 65 câu, 130 phút; 50 scored + 15 unscored; pass 720/1000.
- Domain: Security 30%, Resilience 26%, Performance 24%, Cost 20%.
- Đọc câu hỏi cuối; gạch hard constraints; loại đáp án vi phạm; ưu tiên managed/least ops khi mọi requirement ngang nhau.

## 2. Security

- IAM evaluation: explicit deny > allow; implicit deny mặc định.
- SCP/boundary/session policy đặt trần, không cấp quyền.
- Workload → role + temporary credentials; cross-account → AssumeRole + trust.
- Federation/Identity Center cho workforce; Cognito cho app users.
- KMS envelope encryption; key policy + IAM + grants; CloudHSM khi cần HSM single-tenant/control sâu.
- Secret rotation → Secrets Manager; config/secure parameter → Parameter Store.
- S3: Block Public Access + bucket policy least privilege + SSE-KMS nếu cần key control/audit.
- WAF = HTTP L7; Shield = DDoS; Network Firewall = VPC traffic inspection.
- GuardDuty threat; Inspector vulnerability; Macie S3 sensitive data; Security Hub aggregate.

## 3. Network

- SG stateful/allow/gắn ENI; NACL stateless/allow-deny/gắn subnet.
- Public subnet = route IGW; public resource còn cần public IP + security.
- Private IPv4 outbound = NAT; IPv6 outbound-only = egress-only IGW.
- S3/DynamoDB gateway endpoint; service khác thường interface endpoint/PrivateLink.
- Peering non-transitive; TGW hub/transitive; PrivateLink expose service, không full network.
- VPN encrypted/nhanh triển khai; DX dedicated/private/predictable, không encrypted mặc định.
- Resolver inbound: on-prem → AWS DNS; outbound: AWS → on-prem DNS.
- ALB HTTP/path/host/WAF; NLB TCP/UDP/static IP/source IP; GWLB appliance fleet.
- Route 53: weighted canary; latency performance; failover active-passive; geo content/compliance.
- Alias dùng apex; CNAME không apex.
- CloudFront cache/edge/OAC; Global Accelerator static Anycast TCP/UDP, không cache.

## 4. Compute

- EC2: OS control/job dài; Lambda: event-driven, ≤15 phút; ECS: AWS-native containers; EKS: Kubernetes; Fargate: no worker nodes.
- ASG min/desired/max, multi-AZ, health replacement. Scale queue workers theo backlog/age, không chỉ CPU.
- Cluster placement = low latency one AZ; spread = hardware isolation; partition = distributed fleet.
- Instance store ephemeral; EBS persists stop/start.
- Spot retryable; Savings Plans discount; Capacity Reservation keeps capacity; Dedicated Host BYOL/socket.
- Lambda reserved concurrency = reserve/cap; provisioned = warm.
- Lambda in VPC needs NAT for Internet; public subnet không tự cho public IP.
- ECS execution role pulls/logs; task role for app AWS API.

## 5. Storage

- S3 object/regional; EBS block/AZ; EFS NFS/regional; FSx specialized filesystem.
- gp3 general; io2 critical high IOPS/low latency; st1 throughput HDD; sc1 cold HDD.
- S3 Standard hot; IA infrequent; One Zone-IA recreatable; Intelligent-Tiering unknown; Glacier archive.
- Versioning recover overwrite/delete; lifecycle tier/expire; replication async cross bucket; Object Lock WORM.
- OAC protects S3 origin; presigned URL direct S3 temporary; CloudFront signed controls CDN content.
- EFS Linux/shared; FSx Windows SMB; Lustre HPC/S3; ONTAP multiprotocol/NetApp features; OpenZFS ZFS semantics.

## 6. Database/cache

- RDS Multi-AZ = HA; read replica = read scale/DR.
- Aurora writer/cluster endpoint; reader endpoint; Global DB multi-Region read/DR.
- RDS Proxy pools connections, especially Lambda; ElastiCache offloads reads/session.
- DynamoDB partition key must distribute; GSI new partition key/create later; LSI same partition/create with table.
- DynamoDB on-demand unpredictable; provisioned stable; DAX microsecond read cache; Streams change events; Global Tables multi-Region.
- Redshift OLAP; OpenSearch full-text/log; Neptune graph; Timestream time-series; QLDB ledger; DocumentDB document.

## 7. Messaging/serverless/data

- SQS queue/buffer; Standard at-least-once best-effort order; FIFO order per message group/dedup; DLQ poison messages.
- SNS pub/sub; SNS→SQS durable fan-out.
- EventBridge content/event routing; Step Functions workflow state.
- Kinesis Streams shard/replay/multi-consumer/order per shard; Firehose managed buffered delivery.
- API Gateway private/regional/edge; API key không phải authentication.
- Athena serverless SQL on S3; Glue catalog/ETL; EMR Spark/Hadoop; Redshift warehouse; Amazon Quick Sight cho BI.
- S3 Parquet + compression + partition reduces Athena scan.

## 8. Resilience/DR

- Multi-AZ handles AZ failure only if every critical layer spans AZs.
- Stateless compute + external session + queue decoupling + idempotency.
- RPO = acceptable data loss; RTO = acceptable downtime.
- Backup/restore < pilot light < warm standby < active-active về readiness/cost.
- Backup cross-account/Region + restore test + IaC + DNS/failover runbook.
- Route 53 failover chịu TTL; GA nhanh hơn cho supported endpoints/protocol.

## 9. Migration

- MGN rehost server; DMS database full load/CDC; SCT/schema conversion khác engine.
- DataSync online file/object sync; Snow offline large data; Storage Gateway hybrid access/cache; Transfer Family SFTP/FTPS/FTP/AS2.
- Direct Connect long-term private link; VPN backup/bootstrap; S3 Transfer Acceleration online global S3.
- Cutover: test → validate → lower TTL → quiesce writes → lag zero → switch → monitor → rollback window.

## 10. Observability/governance

- CloudWatch metric/log/alarm; CloudTrail API actor/audit; Config resource config/compliance; X-Ray trace latency.
- SSM Session Manager không inbound SSH; Automation/Run Command/Patch/State Manager.
- CloudFormation IaC; change set preview; drift detect; StackSets multi-account/Region.
- Organizations/OUs; SCP max permissions; Control Tower landing zone; Service Catalog approved self-service; RAM resource sharing.
- Central log archive/security accounts; organization trail; Config/Security Hub aggregation.

## 11. Cost

- Remove idle → right-size/scale → pricing model → storage tier → reduce transfer → measure.
- Commitment cho baseline, Spot cho retryable burst, On-Demand cho unknown.
- S3 lifecycle/Intelligent-Tiering; abort multipart; expire noncurrent versions.
- CloudFront/cache/compression giảm transfer; S3 gateway endpoint tránh NAT path.
- Cost Explorer analyze; Budgets alert; CUR/Data Exports detail; Anomaly Detection unusual spend; Compute Optimizer right-size.
- Multi-AZ/replica/endpoint/NAT đều có cost; không hy sinh SLA chỉ để rẻ.

## 12. 20 câu tự hỏi trước khi nộp

1. Tôi có đọc chữ EXCEPT/NOT không?
2. Câu cần mấy đáp án?
3. Hard constraint là gì?
4. Failure scope: host/AZ/Region/account?
5. HA hay scaling?
6. RPO hay RTO?
7. Read scaling hay write scaling?
8. Synchronous hay asynchronous?
9. Queue, pub/sub, event bus hay workflow?
10. Object, block hay file?
11. Public hay private path?
12. At rest hay in transit encryption?
13. Authentication hay authorization?
14. DNS routing, CDN hay load balancer?
15. Server, container hay function?
16. Stream/replay hay delivery/buffer?
17. Managed option có đáp ứng không?
18. Phương án có yêu cầu manual work không cần thiết?
19. Cost option có còn giữ SLA không?
20. Tôi đổi đáp án vì bằng chứng hay vì lo lắng?

## Dừng học

Nếu đọc tới đây và giải thích được từng dòng, hãy dừng. Chuẩn bị kỳ thi và ngủ đủ có giá trị hơn nhồi thêm quota rời rạc.
