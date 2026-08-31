# Architecture recipes — mẫu ghép dịch vụ

Đây không phải đáp án cố định. Mỗi recipe cho biết thành phần nào xử lý yêu cầu nào; khi đề đổi constraint, thay đúng thành phần.

## 1. Web application ba tầng, đa AZ

```text
Route 53
   ↓
CloudFront + WAF
   ↓
ALB (public subnets, ≥2 AZ)
   ↓
EC2 ASG / ECS (private app subnets)
   ↓
Aurora/RDS Multi-AZ (private DB subnets)
```

- S3 private + OAC cho static assets.
- ElastiCache/DynamoDB cho session/cache để app stateless.
- Secrets Manager cho DB credentials; KMS encryption.
- NAT Gateway theo AZ hoặc VPC endpoints cho outbound AWS services.
- CloudWatch, CloudTrail và AWS Config cho telemetry/audit/config.

Biến thể: global read-heavy → CloudFront + Aurora Global Database/read locality; active-active write cần xét database conflict/consistency, không chỉ DNS.

## 2. Serverless REST API

```text
Route 53 → CloudFront/WAF → API Gateway → Lambda → DynamoDB
                                      ↘ SQS/EventBridge
```

- Cognito/JWT/IAM authorizer tùy caller.
- DynamoDB partition key phân bố đều; GSI theo access patterns.
- SQS hấp thụ burst và bảo vệ downstream; DLQ + idempotency.
- Step Functions nếu có workflow dài/branch/retry/catch.
- Reserved concurrency bảo vệ shared limits; provisioned concurrency nếu latency cold start là hard requirement.

## 3. Fan-out processing đáng tin cậy

```text
Publisher → SNS topic
              ├→ SQS queue A → consumers A
              ├→ SQS queue B → consumers B
              └→ Lambda/subscriber C
```

- Mỗi queue có backlog, retry và DLQ riêng.
- SNS filter policy giảm message không cần.
- Consumer idempotent; visibility timeout đúng processing time.
- Nếu cần content-based event routing từ nhiều source/SaaS, thay hoặc bổ sung EventBridge.

## 4. Streaming data lake

```text
Producers → Kinesis Data Streams → realtime consumers
                      ↓
                  Firehose → S3 raw/curated
                               ↓
                     Glue Catalog/ETL
                               ↓
                 Athena / Redshift / Amazon Quick
```

- Partition key tránh hot shard.
- S3 partition + Parquet/compression giảm Athena scan.
- Lake Formation cho quyền table/column/cross-account.
- OpenSearch branch nếu cần full-text/log search.

## 5. Hybrid private connectivity

```text
On-prem routers
   ├→ Direct Connect → DX gateway/TGW → VPCs
   └→ Site-to-Site VPN backup → TGW

On-prem DNS ↔ Route 53 Resolver inbound/outbound endpoints ↔ VPC DNS
```

- DX không encrypted mặc định; thêm MACsec/VPN/application TLS theo requirement.
- TGW cho hub-and-spoke; route tables phân đoạn prod/dev/shared.
- VPC endpoints giữ AWS service traffic private.
- Hai DX location/connection nếu SLA yêu cầu; một DX + VPN chỉ là mức redundancy nhất định.

## 6. Cross-account private service

```text
Consumer VPC → Interface Endpoint (PrivateLink)
                   ↓
Provider Endpoint Service → NLB → service targets
```

- Chỉ expose service, không chia sẻ toàn network/CIDR.
- Hợp SaaS/many consumers/overlapping CIDR.
- Provider kiểm soát endpoint acceptance/permissions.
- Không dùng VPC peering mesh nếu consumer chỉ cần một service.

## 7. Database migration downtime thấp

```text
Source DB → schema assessment/conversion → target schema
     └→ DMS full load + CDC → RDS/Aurora target
                                  ↓
                         validation/test/cutover
```

- Hạ DNS TTL/chuẩn bị connection string.
- Quiesce write ở cutover; chờ lag và validate.
- Backout plan, monitoring và giữ source theo retention window.
- Nếu migrate toàn server không đổi app, MGN có thể là recipe khác.

## 8. Multi-Region disaster recovery

### Pilot light

```text
Primary: full production
Secondary: data replication + minimal core services + IaC
Failover: restore/scale compute → switch Route 53/GA
```

### Warm standby

```text
Primary: full production
Secondary: scaled-down but functional stack + replicated data
Failover: scale up → redirect traffic
```

- Backup cross-account/cross-Region, KMS key/permissions và restore test.
- Route 53/Global Accelerator health/failover theo protocol và RTO.
- Runbook phải gồm dependency ngoài AWS, secret, certificate, quota.
- DR chỉ có giá trị khi game day xác minh RPO/RTO.

## 9. Secure multi-account landing zone

```text
AWS Organizations / Control Tower
   ├→ Security account
   ├→ Log archive account
   ├→ Shared services/network account
   ├→ Prod accounts
   └→ Non-prod accounts
```

- IAM Identity Center/federated roles + MFA.
- SCP guardrails; không dùng management account cho workload.
- Organization CloudTrail, Config aggregator, Security Hub/GuardDuty delegated admin.
- StackSets triển khai baseline; central backup/logging theo policy.
- TGW/Route 53 Resolver/shared endpoints tùy network operating model.

## 10. Cost-optimized batch

```text
S3 input → EventBridge/SQS → AWS Batch / EC2 Spot ASG → S3 output
```

- Job checkpoint/retry, nhiều instance types/AZ capacity pools.
- Queue depth điều khiển scaling.
- Lifecycle input/output cũ; metrics theo job age/failure.
- Baseline không gián đoạn có thể On-Demand; burst dùng Spot.

## 11. Private static/download content

```text
User → Route 53 → CloudFront + WAF → S3 private origin
                                      ↑ OAC
```

- Block Public Access.
- Signed URL một object/client; signed cookie nhiều object.
- Versioned filenames thay invalidation thường xuyên.
- KMS/bucket policy phải cho đúng CloudFront path và quản lý access.

## 12. Highly available queue workers

```text
Producers → SQS → workers in ASG/ECS across AZs → durable target
              ↘ DLQ
```

- Long polling, batching để giảm cost.
- Visibility timeout > expected processing; extend nếu job dài.
- Idempotency key/dedup ở target.
- Scale theo backlog per worker/message age.
- Redrive DLQ sau khi sửa root cause, không loop vô hạn.

## 13. Observability và auto-remediation

```text
Metrics/logs/traces → CloudWatch/X-Ray
          ↓ alarm/event
     SNS / EventBridge
          ↓
SSM Automation / Lambda remediation

API activity → CloudTrail → central S3
Config state → Config aggregator/rules
```

- Remediation cần least privilege, guard condition và audit.
- Alarm trên customer impact/SLO, composite alarm giảm noise.
- Log retention và cross-account archive theo compliance.

## 14. Cách biến recipe theo keyword

| Keyword mới | Thay đổi |
|---|---|
| No public Internet | Private subnet, VPC endpoints/PrivateLink, private API, VPN/DX |
| Static IP global | Global Accelerator trước regional endpoint |
| UDP | NLB/Global Accelerator, không ALB |
| Kubernetes required | EKS thay ECS |
| Lowest ops, bursty | Lambda/Fargate/serverless data service nếu constraint cho phép |
| Strict ordering | SQS FIFO/Kinesis partition design, không SNS đơn thuần |
| Full-text search | OpenSearch branch |
| Shared Windows files | FSx for Windows |
| Sub-millisecond cache | ElastiCache/DAX theo source API |
| RTO phút | Warm standby/active-active tùy RPO và cost, không chỉ backup/restore |

## Bài tập 30 phút

Với mỗi recipe, che phần giải thích và tự trả lời:

1. Failure domain là gì?
2. Thành phần nào scale read/write/compute?
3. Dữ liệu nào durable, dữ liệu nào cache?
4. Security boundary và key/secret ở đâu?
5. Metric/health check nào kích hoạt failover?
6. Điểm tốn tiền lớn nhất là gì?
