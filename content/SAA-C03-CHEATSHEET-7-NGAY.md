# AWS SAA-C03 — Cheatsheet ôn thi trong 7 ngày

> Mục tiêu: đủ chi tiết để chọn đúng kiến trúc, đủ ngắn để đọc lại nhiều vòng trong 1 tuần.  
> Cách dùng: học theo lịch 7 ngày, làm câu hỏi ngay sau mỗi chủ đề, và đọc phần **Cram sheet 60 phút cuối** mỗi tối.

## 0. Bản đồ kỳ thi

| Domain | Trọng số | Ưu tiên trong 7 ngày |
|---|---:|---|
| 1. Design Secure Architectures | 30% | Rất cao |
| 2. Design Resilient Architectures | 26% | Rất cao |
| 3. Design High-Performing Architectures | 24% | Rất cao |
| 4. Design Cost-Optimized Architectures | 20% | Cao |

- 65 câu, 130 phút: trung bình **2 phút/câu**.
- 50 câu tính điểm + 15 câu không tính điểm; không biết câu nào thuộc nhóm nào.
- Điểm đậu: **720/1000**. Chấm tổng điểm, không cần đậu từng domain.
- Dạng câu: một đáp án hoặc nhiều đáp án. Câu bỏ trống tính sai; đoán không bị trừ điểm.
- Đề thi hỏi **lựa chọn kiến trúc tốt nhất theo ràng buộc**, không hỏi thuộc lòng giao diện console.

### Luật chọn đáp án

1. Gạch chân **mục tiêu**: secure, highly available, lowest latency, least operational overhead, most cost-effective.
2. Gạch chân **ràng buộc**: must keep order, cannot change app, shared file system, RPO/RTO, unpredictable traffic, compliance.
3. Loại đáp án không thỏa ràng buộc cứng, dù kỹ thuật vẫn chạy được.
4. Trong các đáp án còn lại, ưu tiên dịch vụ managed/serverless, multi-AZ, tự động scale, ít vận hành — trừ khi đề yêu cầu quyền kiểm soát hoặc tương thích cụ thể.
5. Không tự thêm yêu cầu. `Most cost-effective` không đồng nghĩa rẻ nhất nếu làm hỏng HA, latency hoặc durability.

### Từ khóa → phản xạ

| Từ khóa trong đề | Nghĩ ngay tới |
|---|---|
| least operational overhead | Serverless/managed: Lambda, Fargate, DynamoDB, Aurora Serverless, S3 |
| unpredictable/spiky traffic | Auto Scaling, Lambda, DynamoDB on-demand, S3 Intelligent-Tiering |
| decouple/buffer/back pressure | SQS; DLQ; consumer Auto Scaling |
| fan-out | SNS → nhiều SQS/Lambda; Kinesis nếu là stream có replay |
| event routing/content filtering/SaaS | EventBridge |
| ordering/deduplication | SQS FIFO hoặc SNS FIFO |
| HA relational DB | RDS Multi-AZ/Aurora; không phải read replica đơn thuần |
| scale relational reads | Read replica/Aurora Replicas + reader endpoint |
| global relational reads/DR | Aurora Global Database |
| global multi-active key-value | DynamoDB global tables |
| static website/global cache | S3 + CloudFront + OAC |
| global non-HTTP, static Anycast IP | Global Accelerator |
| private access to S3/DynamoDB | Gateway VPC endpoint |
| private access to AWS/SaaS service | Interface endpoint/PrivateLink |
| on-prem private, consistent bandwidth | Direct Connect; thêm VPN nếu cần mã hóa/backup |
| block/file/object | EBS / EFS-FSx / S3 |
| Windows SMB + AD | FSx for Windows File Server |
| HPC + S3 | FSx for Lustre |
| audit “ai gọi API gì” | CloudTrail |
| metrics/logs/alarms | CloudWatch |
| resource configuration/compliance | AWS Config |
| distributed request tracing | X-Ray |

---

# Kế hoạch 7 ngày

Mặc định 4–5 giờ/ngày. Nếu chỉ có 2–3 giờ, giữ phần đọc và câu hỏi timed; bỏ lab.

| Ngày | Trọng tâm | Đầu ra bắt buộc |
|---|---|---|
| 1 | Security, IAM, encryption | 40–60 câu domain Security; ghi 15 lỗi sai |
| 2 | Resilience, HA/DR, decoupling | Vẽ 3-tier multi-AZ; 40–60 câu |
| 3 | Storage + databases | Thuộc 3 bảng chọn storage/DB/cache; 50 câu |
| 4 | VPC, hybrid, DNS, edge, ELB | Vẽ luồng public/private; 50 câu |
| 5 | Compute, serverless, containers, integration, analytics | 50 câu; hoàn tất vòng đọc đầu |
| 6 | Cost, migration, operations + mock 1 | 1 đề 65 câu/130 phút; phân loại lỗi |
| 7 | Vá lỗ hổng + mock 2 + cram sheet | Mock ≥ 80%; dừng học mới trước giờ ngủ |

### Nhịp học mỗi ngày

- 90 phút: đọc chủ đề ngày đó, tự giải thích thành tiếng.
- 30 phút: vẽ hoặc viết lại bảng quyết định không nhìn tài liệu.
- 90–120 phút: làm câu hỏi timed.
- 45–60 phút: xem kỹ cả đáp án đúng lẫn sai; ghi **vì sao**.
- 20 phút: đọc cram sheet và ôn flashcards của ngày trước.

---

# Ngày 1 — Secure Architectures (30%)

## 1. Shared Responsibility Model

- AWS chịu trách nhiệm **security of the cloud**: datacenter, hardware, network, hypervisor, hạ tầng dịch vụ managed.
- Khách hàng chịu trách nhiệm **security in the cloud**: dữ liệu, IAM, cấu hình mạng, mã hóa, OS/app trên EC2, classification và compliance.
- Càng managed, AWS càng quản nhiều lớp:
  - EC2: khách hàng patch guest OS, app, security group.
  - RDS: AWS quản OS/DB infrastructure; khách hàng quản schema, users, network, backup settings, encryption choices.
  - Lambda: AWS quản server/OS/runtime platform; khách hàng quản code, dependencies, permissions, data.
  - S3/DynamoDB: AWS quản hạ tầng; khách hàng quản data, policy, public access, encryption và lifecycle.

## 2. IAM — phần phải chắc nhất

### Thành phần

| Thành phần | Dùng cho | Ghi nhớ |
|---|---|---|
| IAM user | Con người/app legacy cần danh tính dài hạn | Hạn chế; bật MFA; không dùng access key nếu role làm được |
| IAM group | Gom **users** | Không chứa role, không lồng group |
| IAM role | Quyền tạm thời cho người/workload/service/account khác | Không có credential dài hạn; STS cấp credential tạm |
| Identity policy | Gắn vào user/group/role | Nói principal được làm gì trên resource nào |
| Resource policy | Gắn vào resource như S3 bucket, SQS, KMS key | Nêu principal nào truy cập resource |
| Permissions boundary | Trần quyền của user/role | Không tự cấp quyền |
| Session policy | Giới hạn phiên STS | Chỉ thu hẹp quyền |
| SCP | Guardrail cho account/OU trong Organizations | Không tự cấp quyền; giới hạn tối đa, kể cả admin trong member account |

### Logic đánh giá quyền

```text
Mặc định = implicit deny
Explicit Allow cần tồn tại
Explicit Deny ở bất kỳ policy áp dụng nào = thắng tất cả
Effective permissions ≈ giao của identity permissions, boundary và SCP
Identity policy + resource policy trong cùng account thường hợp (union), trừ explicit deny
Cross-account thường cần cả phía principal lẫn resource/trust cho phép
```

### Best practices

- Root user: chỉ việc bắt buộc; bật MFA; không tạo access key; khóa thông tin liên hệ.
- Human workforce: federation/IAM Identity Center + MFA; không tạo hàng loạt IAM users.
- Workload trên EC2/ECS/Lambda: dùng **IAM role**, không nhúng access key.
- Least privilege; điều kiện theo resource, tag, source VPC/IP, MFA khi phù hợp.
- Cross-account: role trong account đích có trust policy cho principal account nguồn; principal nguồn có quyền `sts:AssumeRole`.

### Dịch vụ danh tính dễ nhầm

| Nhu cầu | Chọn |
|---|---|
| SSO workforce vào nhiều AWS accounts/apps | IAM Identity Center |
| Web/mobile end users đăng ký/đăng nhập | Amazon Cognito user pool |
| Cấp AWS credentials tạm cho end users | Cognito identity pool |
| Microsoft AD managed trên AWS | AWS Managed Microsoft AD |
| Chuyển tiếp request tới AD on-prem, không lưu user trên AWS | AD Connector |
| AD nhẹ, ít tính năng | Simple AD |

## 3. Multi-account governance

- **AWS Organizations**: accounts, OU, consolidated billing, SCP.
- **SCP**: đặt giới hạn; không cấp quyền. Management account không bị SCP áp dụng như member accounts.
- **AWS Control Tower**: dựng landing zone multi-account và guardrails tự động.
- **AWS Resource Access Manager (RAM)**: chia sẻ resource được hỗ trợ (ví dụ subnets, Transit Gateway) giữa accounts; tránh nhân bản.
- Tách production/security/log archive/shared services thành accounts khác nhau để giảm blast radius.

## 4. Encryption và quản lý secrets

### KMS, CloudHSM, ACM

| Nhu cầu | Chọn |
|---|---|
| AWS-managed key management, tích hợp S3/EBS/RDS | AWS KMS |
| Toàn quyền HSM single-tenant, chuẩn/thuật toán đặc thù | AWS CloudHSM |
| TLS certificate công khai cho ALB/CloudFront/API Gateway | AWS Certificate Manager (ACM) |
| DNS domain và certificate tự gia hạn với service tích hợp | ACM |

- KMS thường dùng **symmetric key** và **envelope encryption**: data key mã hóa dữ liệu; KMS key mã hóa data key.
- AWS owned key: khách không thấy/quản; AWS managed key: thấy nhưng ít quyền; customer managed key: tự policy, rotation, lifecycle, audit, cross-account.
- Truy cập KMS cần xét **key policy** và IAM; explicit deny vẫn thắng.
- Mã hóa at rest: S3 SSE, EBS encryption, RDS/Aurora encryption, DynamoDB encryption.
- Mã hóa in transit: TLS/HTTPS, VPN/IPsec. Direct Connect tự thân không mặc định là mã hóa end-to-end; có thể chạy VPN trên DX hoặc dùng MACsec nơi hỗ trợ.
- S3 encryption: SSE-S3 = S3 quản key; SSE-KMS = KMS audit/control và cần quyền KMS; SSE-C = client gửi key trong từng request; client-side = mã hóa trước khi upload. S3 Bucket Key có thể giảm KMS request cost.
- ACM certificate cho CloudFront phải được request/import ở `us-east-1`; ALB/API Gateway regional dùng certificate ở Region tương ứng.

### Secrets Manager vs Parameter Store

| Nhu cầu | Chọn |
|---|---|
| Database/API secret + rotation tự động | Secrets Manager |
| Config/hierarchical parameters; SecureString với KMS; chi phí thấp | Systems Manager Parameter Store |
| Không secret, chỉ config thường | Parameter Store String/StringList |

Không lưu secret trong AMI, user data, source code, environment file hoặc S3 public.

## 5. Network và application security

### Security services — một dòng để chọn

| Dịch vụ | Trả lời câu hỏi nào? |
|---|---|
| AWS WAF | Chặn HTTP(S) layer 7: SQL injection, XSS, IP/rate rules; gắn CloudFront/ALB/API Gateway |
| AWS Shield Standard | DDoS cơ bản, tự động; đi kèm dịch vụ được hỗ trợ |
| AWS Shield Advanced | DDoS nâng cao, DRT, bảo vệ chi phí và visibility cao hơn |
| AWS Firewall Manager | Triển khai/quản policy WAF, Shield, Network Firewall, SG trên nhiều accounts |
| AWS Network Firewall | Stateful network firewall cho VPC, inspect/filter traffic |
| Amazon GuardDuty | Threat detection từ log/tín hiệu: compromised credentials, suspicious API/network/DNS |
| Amazon Inspector | Vulnerability/exposure scanning cho EC2, images trong ECR, Lambda |
| Amazon Macie | Phát hiện/classify dữ liệu nhạy cảm trong S3 |
| AWS Security Hub | Tổng hợp findings và posture/compliance từ nhiều security services |
| Amazon Detective | Điều tra, tương quan nguyên nhân và hoạt động đáng ngờ |
| AWS Artifact | Tải báo cáo compliance và quản thỏa thuận |
| AWS Audit Manager | Thu thập evidence và hỗ trợ audit liên tục |

### S3 security checklist

- Block Public Access ở account/bucket; bucket policy least privilege.
- Dùng OAC để chỉ CloudFront đọc origin S3; người dùng không bypass qua S3 URL.
- SSE-S3 khi chỉ cần managed encryption; SSE-KMS khi cần key control/audit/policy; client-side khi phải mã hóa trước khi gửi.
- Versioning chống overwrite/delete nhầm; MFA Delete tăng bảo vệ thao tác versioning/delete (quản qua root).
- Object Lock WORM cho retention/compliance; cần versioning.
- Object Lock governance mode có thể bypass với quyền đặc biệt; compliance mode không thể rút ngắn/xóa trong retention period, kể cả root.
- Presigned URL: quyền truy cập tạm thời tới object cụ thể bằng quyền của signer.
- CloudFront signed URL: ít file/cá nhân; signed cookies: nhiều file mà không muốn đổi URL.
- Access logs/CloudTrail data events khi cần audit object-level.

### Bẫy Security

- SCP, permissions boundary và session policy **không cấp quyền**.
- Security group không có deny rule; NACL có allow/deny.
- WAF không thay Security Group/Network Firewall; WAF chỉ xử lý web layer 7.
- GuardDuty phát hiện; WAF/Network Firewall chặn; Inspector quét lỗ hổng; Macie tìm dữ liệu nhạy cảm.
- Encryption không đồng nghĩa access control. Vẫn cần IAM/resource policies.
- S3 bucket private nhưng CloudFront truy cập được: dùng **OAC**, không mở public bucket.

---

# Ngày 2 — Resilient Architectures (26%)

## 1. Khái niệm nền

| Khái niệm | Ý nghĩa |
|---|---|
| High availability | Giảm downtime, thường dùng redundancy và failover |
| Fault tolerance | Tiếp tục chạy gần như không gián đoạn khi thành phần hỏng |
| Scalability | Tăng/giảm capacity theo tải |
| Elasticity | Tự động scale đúng lúc và thu hồi khi không cần |
| RPO | Mất tối đa bao nhiêu dữ liệu, đo theo thời gian |
| RTO | Mất tối đa bao lâu để khôi phục dịch vụ |

- Một **Region** có nhiều **Availability Zones** độc lập; multi-AZ chống lỗi AZ.
- Multi-Region dành cho Regional disaster, global latency, sovereignty hoặc RTO/RPO nghiêm ngặt; đắt và phức tạp hơn.
- Stateless application tier dễ thay thế và scale; state nên đưa vào RDS/DynamoDB/S3/EFS/ElastiCache.

## 2. Mẫu 3-tier chuẩn

```text
Route 53
  → CloudFront + WAF
    → ALB ở ≥2 public subnets/AZ
      → Auto Scaling EC2/ECS ở ≥2 private subnets/AZ
        → RDS Multi-AZ/Aurora hoặc DynamoDB

Private app outbound internet → NAT Gateway theo AZ
Private app → S3/DynamoDB → Gateway endpoint, tránh NAT
Logs/metrics → CloudWatch; audit API → CloudTrail
```

## 3. ELB + Auto Scaling

- ELB health check ngừng gửi traffic tới target hỏng.
- Auto Scaling Group (ASG) thay instance unhealthy và phân bố nhiều AZ.
- **Target tracking**: giữ metric gần target (CPU, ALB request/target); mặc định nên nghĩ tới đầu tiên.
- **Step scaling**: mức scale khác nhau theo độ nghiêm trọng alarm.
- **Scheduled scaling**: tải biết trước theo lịch.
- **Predictive scaling**: dự báo pattern tuần/ngày; có thể kết hợp dynamic scaling.
- Lifecycle hooks: chờ custom action khi launch/terminate.
- Warm pool: giảm thời gian khởi động cho instance boot chậm.
- Không lưu session trên một EC2. Đưa session vào DynamoDB/ElastiCache hoặc dùng application cookie; stickiness chỉ khi thật sự cần.

## 4. Database HA và scale

### RDS/Aurora quyết định nhanh

| Yêu cầu | Chọn |
|---|---|
| HA cho RDS instance | RDS Multi-AZ DB **instance**; synchronous standby, automatic failover, standby không phục vụ read |
| HA + readable standbys trên RDS kiến trúc mới | RDS Multi-AZ DB **cluster**; writer + hai readable standbys ở ba AZ |
| Scale read | RDS read replicas; replication thường async; app gửi read tới replica |
| Aurora HA/read scale | Aurora Replicas ở nhiều AZ + reader endpoint; tối đa nhiều replicas |
| Cross-Region relational DR/global reads | Aurora Global Database hoặc cross-Region read replica theo engine/yêu cầu |
| Connection storm từ Lambda | RDS Proxy |
| Variable relational load, ít vận hành | Aurora Serverless |

**Bẫy kinh điển:** Multi-AZ là HA/failover; read replica là read scaling và có thể DR sau khi promote. Đừng chọn read replica chỉ để giải quyết HA trong một AZ.

### DynamoDB resilience

- Tự managed/partitioned và multi-AZ trong Region.
- Global tables: multi-Region, multi-active, local read/write; phù hợp global key-value và Regional resilience.
- Point-in-time recovery/backup cho lỗi logic; global tables không thay backup.
- Thiết kế partition key phân bố đều để tránh hot partition.

## 5. Disaster Recovery

Thứ tự **chi phí tăng**, **RTO/RPO giảm**:

| Chiến lược | Trạng thái DR Region | RTO/RPO tương đối | Khi chọn |
|---|---|---|---|
| Backup & Restore | Chỉ backup/IaC | Giờ | Rẻ nhất, chấp nhận phục hồi chậm |
| Pilot Light | Data/core tối thiểu luôn chạy | Hàng chục phút | Khởi tạo phần app khi failover |
| Warm Standby | Toàn stack chạy quy mô nhỏ | Phút | Scale up khi failover |
| Multi-site Active/Active | Full stack phục vụ traffic | Gần 0 | Cần RTO/RPO cực thấp, chấp nhận chi phí/phức tạp |

- Backup không phải HA. Replication cũng không thay backup vì lỗi/xóa logic có thể lan sang replica.
- AWS Backup: central backup plans, lifecycle, cross-account/cross-Region copy, Vault Lock.
- S3 CRR/RDS cross-Region/Aurora Global/DynamoDB global tables giải quyết các kiểu replication khác nhau.
- Route 53 failover + health checks hoặc Global Accelerator endpoint health để chuyển traffic.
- DR phải được **test định kỳ**; hạ tầng dùng CloudFormation/IaC để dựng lại nhất quán.

## 6. Loose coupling và failure isolation

### SQS pattern

```text
Producer → SQS → consumers trong ASG/Lambda
                     ↓ lỗi quá số lần
                    DLQ
```

- Consumer phải idempotent vì Standard queue có thể giao trùng.
- Visibility timeout ≥ thời gian xử lý hợp lý; nếu không delete trước khi hết timeout, message hiện lại.
- Long polling giảm empty responses/cost.
- DLQ giữ poison messages; redrive sau khi sửa lỗi.
- Scale consumers theo queue depth/age of oldest message, không chỉ CPU.

### Khi chọn dịch vụ tích hợp

| Yêu cầu | Dịch vụ |
|---|---|
| Một worker lấy từng task, buffer | SQS |
| Push một message tới nhiều subscribers | SNS |
| Route event theo nội dung/nguồn, SaaS, cross-account | EventBridge |
| Lưu và replay ordered stream, nhiều consumers | Kinesis Data Streams/MSK |
| Workflow nhiều bước, retry/wait/branch | Step Functions |

### Resilience traps

- Một NAT Gateway hoặc một app instance ở một AZ là single point of failure.
- ALB multi-AZ nhưng targets chỉ ở một AZ vẫn không tạo app tier HA.
- EBS snapshot/AMI giúp phục hồi; EBS volume vẫn gắn với một AZ.
- Route 53 DNS failover phụ thuộc TTL/cache; Global Accelerator chuyển endpoint ở network edge và có static Anycast IP.
- Synchronous chain dài làm tăng blast radius; queue/event giúp graceful degradation.

---

# Ngày 3 — Storage và Databases

## 1. Chọn kiểu storage trước, chọn service sau

| Kiểu | Service chính | Đặc tính |
|---|---|---|
| Object | S3 | API, virtually unlimited, durable, không mount như block disk |
| Block | EBS, instance store | Gắn như disk cho EC2; low-latency; thường theo AZ |
| Shared file | EFS, FSx | NFS/SMB/Lustre/ONTAP/OpenZFS; nhiều clients |

## 2. Amazon S3

### Storage classes

| Class | Access | Phạm vi | Chọn khi |
|---|---|---|---|
| S3 Standard | ms, thường xuyên | ≥3 AZ | Dữ liệu active, pattern thường xuyên |
| Intelligent-Tiering | ms | ≥3 AZ | Pattern không biết/thay đổi; tự chuyển tier; monitoring fee cho object đủ điều kiện |
| Standard-IA | ms + retrieval fee | ≥3 AZ | Ít truy cập, cần multi-AZ; tối thiểu 30 ngày |
| One Zone-IA | ms + retrieval fee | 1 AZ | Có thể tạo lại/secondary copy; tối thiểu 30 ngày |
| Glacier Instant Retrieval | ms | ≥3 AZ | Archive nhưng cần truy cập tức thì; tối thiểu 90 ngày |
| Glacier Flexible Retrieval | phút–giờ | ≥3 AZ | Archive hiếm đọc; tối thiểu 90 ngày |
| Glacier Deep Archive | giờ | ≥3 AZ | Rẻ nhất cho lưu dài hạn; tối thiểu 180 ngày |
| S3 Express One Zone | single-digit ms | 1 AZ | Latency-sensitive, access rất cao trong một AZ |

### S3 features quan trọng

- Strong read-after-write consistency cho PUT/DELETE/LIST.
- Versioning: giữ nhiều version; delete không version ID tạo delete marker.
- Lifecycle: transition class, expire current/noncurrent versions, abort incomplete multipart uploads.
- CRR: replicate async sang Region khác; SRR: cùng Region; cần versioning. Live replication mặc định áp dụng object mới; dùng Batch Replication cho object cũ.
- Transfer Acceleration: client xa upload/download qua edge rồi AWS backbone.
- Multipart upload: file lớn, song song, retry từng part.
- Event Notifications/EventBridge: kích hoạt workflow khi object thay đổi.
- S3 Select không phải trọng tâm; Athena query nhiều object bằng SQL, không quản server.
- S3 static website endpoint không hỗ trợ HTTPS trực tiếp; dùng CloudFront cho HTTPS/custom domain/cache.

## 3. EBS, instance store, EFS, FSx

### EBS volume types

| Type | Tối ưu | Use case |
|---|---|---|
| gp3 | General purpose SSD; IOPS/throughput tách khỏi size | Boot, app, phần lớn DB vừa; lựa chọn mặc định |
| gp2 | General purpose SSD cũ; performance gắn với size | Legacy; thường gp3 kinh tế/linh hoạt hơn |
| io2 Block Express | Provisioned IOPS, latency/durability cao | Mission-critical, I/O intensive DB |
| st1 | HDD throughput, sequential | Big data, logs, data warehouse; không boot |
| sc1 | Cold HDD, rẻ | Dữ liệu ít truy cập, sequential; không boot |

- EBS theo AZ; muốn sang AZ khác: snapshot → tạo volume mới ở AZ đích.
- Snapshot lưu incrementally và có thể copy Region/account; mã hóa snapshot theo KMS.
- EBS Multi-Attach chỉ một số Provisioned IOPS cases; ứng dụng phải cluster-aware. Không dùng như shared file system mặc định.
- Instance store: rất nhanh, ephemeral; mất khi underlying host/instance lifecycle làm storage biến mất. Dùng cache/scratch/replicated data.

### File storage

| Service | Protocol/đặc tính | Use case |
|---|---|---|
| EFS Standard | NFS, elastic, shared Linux, multi-AZ | Web content, home dirs, shared app data, Lambda/ECS shared file |
| EFS One Zone | NFS, một AZ, rẻ hơn | Dev/cache/recreatable data |
| FSx for Windows | Native Windows, SMB, AD, ACL | Windows lift-and-shift, home dirs, SQL/file share |
| FSx for Lustre | High-performance parallel file system, liên kết S3 | HPC, ML, financial modeling, media processing |
| FSx for NetApp ONTAP | NFS/SMB/iSCSI, ONTAP features | NetApp migration, multi-protocol, snapshots/clones |
| FSx for OpenZFS | NFS, ZFS features | ZFS/Linux migration, low latency, snapshots/clones |

## 4. Chọn database theo access pattern

| Nhu cầu | Chọn |
|---|---|
| SQL, joins, transactions, schema | RDS/Aurora |
| Key-value/document, massive scale, single-digit ms | DynamoDB |
| In-memory cache/session/leaderboard | ElastiCache/MemoryDB tùy durability yêu cầu |
| Data warehouse OLAP | Redshift |
| Search, log analytics | OpenSearch Service |
| Graph relationships | Neptune |
| Document tương thích MongoDB | DocumentDB |
| Cassandra-compatible wide column | Keyspaces |

### RDS và Aurora

- RDS: managed engines, automated backups/PITR, snapshots, Multi-AZ, read replicas.
- Aurora: MySQL/PostgreSQL-compatible; shared distributed storage, replicas chia sẻ cluster volume, reader/writer endpoints, tự động mở rộng storage.
- Aurora Replica: read scale + failover target trong Region.
- Aurora Global Database: primary write Region + secondary read Regions, replication cross-Region cho global reads/DR.
- RDS Proxy: pool/reuse connections, bảo vệ DB trước connection surge và cải thiện failover experience.
- ElastiCache phía trước RDS để giảm repeated reads; không dùng cache như nguồn dữ liệu duy nhất nếu cần durability.

### DynamoDB

- Primary key:
  - Partition key: truy cập theo một key.
  - Composite key: partition key + sort key; nhiều items cùng partition key, sắp xếp/range query theo sort key.
- Query hiệu quả hơn Scan; thiết kế từ access pattern.
- GSI: partition/sort key khác base table; tạo sau được; replication async; eventual consistency.
- LSI: cùng partition key, sort key khác; tạo cùng table; hỗ trợ strong consistency; giới hạn theo item collection.
- Capacity:
  - On-demand: pay per request, tải mới/khó dự đoán/spiky.
  - Provisioned + auto scaling: tải ổn định/dự đoán, tối ưu cost.
- Reads: eventually consistent mặc định; strongly consistent tùy API/table trong cùng Region; strong tốn capacity hơn.
- DAX: managed in-memory cache, microsecond reads, API-compatible; tốt cho read-heavy eventually consistent access.
- Streams: change data capture; kích Lambda/consumer.
- TTL: xóa item hết hạn bất đồng bộ; không dùng làm hard real-time scheduler.
- Transactions: ACID khi cần nhiều item/table; tốn capacity hơn.
- Global tables: multi-Region multi-active; ứng dụng phải hiểu conflict/consistency mode.

## 5. Caching

| Nhu cầu | Chọn |
|---|---|
| Cache HTTP static/dynamic gần user | CloudFront |
| Cache DB/app, rich data structures, pub/sub, replication | ElastiCache for Redis/Valkey |
| Cache đơn giản multithreaded, không replication/persistence | ElastiCache for Memcached |
| DynamoDB read acceleration | DAX |
| DNS caching/routing | Route 53 + resolver/cache behavior |

Patterns:

- **Cache-aside/lazy loading**: app đọc cache → miss thì đọc DB và ghi cache. Hiệu quả, có miss/stale data.
- **Write-through**: cập nhật cache đồng thời đường ghi; cache ấm hơn, write latency/cost cao hơn.
- TTL chống stale và memory growth; tránh cache stampede bằng locking/jitter/pre-warming.

### Storage/DB traps

- S3 không phải POSIX file system; EBS không phải shared multi-AZ file system.
- EBS snapshot không đồng nghĩa application-consistent nếu chưa flush/quiesce ứng dụng.
- Standard-IA có retrieval fee và minimum duration; object nhỏ/truy cập thường xuyên có thể đắt hơn Standard.
- One Zone-IA không phù hợp bản duy nhất của dữ liệu không thể tạo lại.
- RDS read replica không thay Multi-AZ HA.
- DynamoDB Scan toàn bảng thường là dấu hiệu data model chưa đúng.
- DAX chỉ giúp DynamoDB read latency; không tăng write throughput.

---

# Ngày 4 — Networking, DNS, Edge và Hybrid

## 1. VPC mental model

```text
VPC CIDR
├── Public subnet A ─ route 0.0.0.0/0 → Internet Gateway
│   ├── ALB
│   └── NAT Gateway A + Elastic IP
├── Private app subnet A ─ default route → NAT Gateway A
├── Public subnet B ─ ALB + NAT Gateway B
├── Private app subnet B ─ default route → NAT Gateway B
└── Private DB subnets A/B ─ không route internet trực tiếp
```

- Subnet là resource theo **một AZ**.
- Public/private do **route table**, không do tên subnet hay auto-assign public IP một mình.
- Internet Gateway: gắn VPC; cho resource có public IPv4/IPv6 và route phù hợp giao tiếp internet.
- NAT Gateway: outbound IPv4 từ private subnet; đặt ở public subnet, có Elastic IP. NAT không nhận kết nối inbound tùy ý từ internet.
- Egress-only Internet Gateway: outbound-only cho IPv6; NAT Gateway không phải cơ chế bắt buộc cho IPv6.
- Route ưu tiên prefix cụ thể nhất (longest prefix match), sau đó xét rule phù hợp của loại route.

## 2. Security Group vs NACL

| | Security Group | Network ACL |
|---|---|---|
| Cấp áp dụng | ENI/resource | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow + deny |
| Đánh giá | Tất cả rules | Theo rule number tăng dần, first match |
| Return traffic | Tự cho phép | Phải cho phép explicit, kể cả ephemeral ports |
| Dùng chính | Firewall cho app/resource | Guardrail subnet/deny CIDR, defense in depth |

- SG có thể tham chiếu SG khác: ALB SG → app SG; app SG → DB SG. Đây là lựa chọn tốt hơn hard-code IP động.
- NACL stateless: phải cho cả inbound và outbound; nhớ ephemeral return ports.

## 3. VPC connectivity

| Nhu cầu | Chọn | Bẫy |
|---|---|---|
| Kết nối hai VPC đơn giản | VPC Peering | Không transitive; CIDR không overlap |
| Nhiều VPC/on-prem hub-and-spoke | Transit Gateway | Có route tables; trả phí |
| Publish service private cho consumer VPC/account | PrivateLink + interface endpoint | One-way service access, không full mesh |
| S3/DynamoDB private từ VPC | Gateway endpoint | Không phí endpoint; cập nhật route table; Regional |
| AWS services khác private từ VPC | Interface endpoint | ENI private IP, SG, hourly/data charge |
| Chia sẻ subnet/TGW/resource hỗ trợ | AWS RAM | Không phải copy resource |
| DNS hybrid | Route 53 Resolver inbound/outbound endpoints | Dùng forwarding rules |

### Gateway vs interface endpoint

- Gateway endpoint: chỉ S3/DynamoDB, route table, không ENI/SG, không phí endpoint, không dùng từ on-prem trực tiếp.
- Interface endpoint: PrivateLink, ENI + private IP + SG trong subnets, dùng private DNS, có phí; phù hợp nhiều AWS/SaaS/custom endpoint services và truy cập private từ on-prem qua VPN/DX.

## 4. Hybrid networking

| Nhu cầu | Chọn |
|---|---|
| Thiết lập nhanh, encrypted qua internet | Site-to-Site VPN |
| Dedicated private connection, bandwidth/latency ổn định | Direct Connect |
| DX chính + encrypted/backup path | DX + VPN |
| Nhiều VPC với hybrid central routing | Direct Connect Gateway/Transit Gateway theo topology |
| User cá nhân truy cập VPC | AWS Client VPN |

- VPN có thể là backup cho DX; BGP dùng dynamic routing.
- Direct Connect không thay Internet Gateway/NAT cho internet egress.
- CIDR overlap làm peering/TGW/hybrid routing khó hoặc không thực hiện trực tiếp.

## 5. Elastic Load Balancing

| LB | Layer/protocol | Chọn khi |
|---|---|---|
| ALB | L7 HTTP/HTTPS/gRPC | Host/path/header routing, microservices, WebSocket, Lambda targets, WAF |
| NLB | L4 TCP/UDP/TLS | Ultra-high performance, static IP/EIP, preserve source IP, non-HTTP |
| GWLB | L3 IP + GENEVE | Scale virtual appliances: firewall, IDS/IPS, deep packet inspection |
| CLB | Legacy | Chỉ workload cũ; không chọn cho thiết kế mới nếu ALB/NLB phù hợp |

- Internet-facing vs internal LB theo nguồn truy cập.
- ALB terminate TLS bằng ACM; có thể re-encrypt tới targets.
- NLB phù hợp khi allowlist static IP; ALB dùng DNS name và rich L7 routing.

## 6. Route 53

| Policy | Chọn khi |
|---|---|
| Simple | Một resource hoặc nhiều values không có policy đặc biệt |
| Weighted | Canary/blue-green/chia % traffic |
| Latency | Gửi tới Region có latency tốt nhất |
| Failover | Active-passive với health check |
| Geolocation | Theo vị trí **user**: country/continent/state |
| Geoproximity | Theo vị trí **resource**, bias để dịch traffic |
| Multivalue answer | Trả tối đa nhiều healthy records; không thay ELB |

- Alias record: trỏ apex/root domain tới AWS resources được hỗ trợ; không giống CNAME; Route 53 không tính phí DNS query cho alias tới một số AWS targets.
- TTL thấp: failover nhanh hơn nhưng nhiều DNS queries hơn; client/recursive resolver vẫn cache.
- Private hosted zone: DNS chỉ trong VPC được associate (và hybrid resolution phù hợp).

## 7. CloudFront vs Global Accelerator vs Route 53

| | CloudFront | Global Accelerator | Route 53 |
|---|---|---|---|
| Vai trò | CDN/cache + edge security | Network acceleration/failover | DNS routing |
| Protocol | HTTP/HTTPS | TCP/UDP | DNS |
| Static Anycast IP | Không phải mục tiêu chính | Có | Không |
| Cache content | Có | Không | Không |
| Điểm chọn | Static/dynamic web, S3 origin, WAF, signed URL/cookie | Gaming/VoIP/non-HTTP, static IP, fast endpoint failover | Chọn endpoint theo policy/health/location |

- CloudFront origins: S3, ALB, EC2/custom HTTP, API Gateway và các nguồn được hỗ trợ.
- OAC khóa S3 origin; WAF thường đặt ở CloudFront cho bảo vệ global.
- Cache key càng chứa nhiều headers/cookies/query strings → cache hit ratio càng thấp.

### Networking traps

- Public subnet cần route tới IGW; EC2 còn cần public IP/EIP để IPv4 internet trực tiếp.
- NAT Gateway phải ở public subnet; private subnet route tới NAT.
- Một NAT Gateway cross-AZ vừa là rủi ro AZ vừa phát sinh cross-AZ cost; production HA thường NAT mỗi AZ và route local-AZ.
- VPC peering không transitive: A↔B và B↔C không tạo A↔C.
- SG stateful, NACL stateless.
- Route 53 Multivalue không phải load balancer và không health-check theo từng request.

---

# Ngày 5 — Compute, Serverless, Containers, Integration, Analytics

## 1. EC2

### Instance family clue

| Chữ gợi nhớ | Tối ưu | Ví dụ use case |
|---|---|---|
| T | Burstable | Dev, web nhỏ, baseline CPU thấp |
| M | General purpose | App server cân bằng |
| C | Compute | Batch, CPU-heavy, encoding |
| R/X/U | Memory | In-memory DB/cache, SAP |
| I/D/H | Storage/local I/O | NoSQL, data warehouse, dense storage |
| P/G/Trn/Inf | Accelerator | GPU, graphics, ML train/inference |

### Placement groups

| Type | Mục tiêu | Trade-off |
|---|---|---|
| Cluster | Low latency/high throughput giữa instances | Cùng AZ, giảm phân tán lỗi |
| Spread | Mỗi instance trên hardware riêng | Nhóm nhỏ, maximum fault isolation |
| Partition | Chia partitions trên racks khác | Hadoop/Cassandra/Kafka, app biết partition |

- AMI: template launch; chứa root volume snapshot + permissions + mapping.
- User data: bootstrap lúc launch; không đặt secrets.
- ENI: network identity có private IP/SG/MAC; có thể move trong AZ cho một số failover patterns.
- EC2 Auto Scaling giải quyết capacity/health; ELB giải quyết traffic distribution.

## 2. Chọn compute

| Yêu cầu | Chọn |
|---|---|
| Full OS/control, legacy, long-running | EC2 |
| Event-driven function ≤ 15 phút, scale-to-zero | Lambda |
| Container serverless, không quản nodes | ECS/EKS on Fargate |
| AWS-native container orchestration, đơn giản hơn Kubernetes | ECS |
| Kubernetes API/ecosystem/portability | EKS |
| Batch queue/scheduling/compute environments | AWS Batch |
| Deploy web app, AWS quản capacity/LB/health | Elastic Beanstalk |
| Infrastructure on-prem nhưng AWS APIs/tools | Outposts |
| Ultra-low-latency telco/5G edge | Wavelength |

### Lambda

- Event-driven, stateless; tối đa 900 giây/15 phút mỗi invocation.
- Memory tăng kéo theo CPU; tune memory để tối ưu cả latency và cost.
- Concurrency giới hạn số executions đồng thời:
  - Reserved concurrency: vừa bảo đảm vừa giới hạn cho function.
  - Provisioned concurrency: pre-initialized environments, giảm cold start, trả phí.
- Async invocation: Lambda retry và có destination/DLQ tùy cấu hình.
- Event source mapping với SQS/Kinesis: Lambda poll; xử lý idempotent/partial batch failure.
- VPC attachment khi cần private resources; dùng VPC endpoints/NAT đúng luồng.
- `/tmp` là ephemeral per execution environment; durable state đưa ra S3/EFS/DB.
- Lambda layers chia sẻ dependencies; container image chỉ là packaging, vẫn chạy theo Lambda model.

### ECS/EKS/Fargate

- ECS task definition: image, CPU/memory, ports, IAM roles, logging.
- Task role: quyền của application container; execution role: pull image/log startup actions.
- Fargate: trả theo task resources, không quản EC2 nodes; phù hợp variable workloads/ít ops.
- EC2 launch type: kiểm soát nodes/AMI/instance/GPU, có thể dùng Spot/RI/Savings Plans sâu hơn.
- ECR: private container registry; image scanning + lifecycle policies.

## 3. Messaging và workflow

### SQS vs SNS vs EventBridge

| | SQS | SNS | EventBridge |
|---|---|---|---|
| Model | Queue, pull/poll | Pub/sub push | Event bus + rules |
| Persistence | Có tới khi consume/expire | Không phải queue | Có archive/replay tùy cấu hình, event routing real-time |
| Dùng | Buffer/decouple/work queue | Fan-out/notifications | Event routing, SaaS, cross-account, content matching |
| Ordering | FIFO queue | FIFO topic với compatible targets | Không đảm bảo ordering chung |

- SNS → SQS fan-out: mỗi consumer group có queue riêng, không mất message khi consumer tạm down.
- SQS Standard: at-least-once, best-effort order, high throughput.
- SQS FIFO: strict order trong message group + dedup/exactly-once processing semantics; tên kết thúc `.fifo`.
- SQS retention mặc định 4 ngày, tối đa 14 ngày; visibility timeout mặc định 30 giây, tối đa 12 giờ.
- Amazon MQ: broker managed cho app cần protocol/API như ActiveMQ/RabbitMQ, ít code change.
- MSK: managed Apache Kafka khi cần Kafka ecosystem/compatibility.

### Step Functions

| Standard | Express |
|---|---|
| Long-running, auditable, tối đa 1 năm | High-volume, tối đa 5 phút |
| Exactly-once workflow execution mặc định | Async at-least-once; action nên idempotent |
| Giá theo state transitions | Giá theo executions, duration, memory |
| Hỗ trợ `.sync`, callback/task token | Không hỗ trợ `.sync`/callback patterns |

Chọn Step Functions thay vì chuỗi Lambda tự gọi nhau khi cần state, retry/backoff, timeout, branching, parallel, human approval hoặc audit workflow.

## 4. Streaming và analytics

| Yêu cầu | Chọn |
|---|---|
| Real-time custom consumers, replay, ordered per shard | Kinesis Data Streams |
| Giao streaming data tới S3/Redshift/OpenSearch, transform nhẹ | Amazon Data Firehose |
| Kafka-compatible streaming | Amazon MSK |
| SQL query trực tiếp dữ liệu S3 | Athena |
| ETL/data catalog/serverless Spark | AWS Glue |
| Hadoop/Spark big data cluster tùy biến | EMR |
| Columnar data warehouse/BI OLAP | Redshift |
| Search/log analytics | OpenSearch Service |
| BI dashboards | Amazon Quick |

### Kinesis Data Streams

- Shards cung cấp capacity và ordering theo shard; partition key quyết định shard.
- Producer → stream → nhiều independent consumers; retained records có thể replay.
- Hot shard: partition key lệch; chọn key phân bố đều hoặc reshard/on-demand mode.
- Firehose thiên về delivery managed, near-real-time batching; không phải queue consumer tùy ý.

## 5. API và application delivery

- API Gateway: managed REST/HTTP/WebSocket APIs; authentication, throttling, caching, usage plans, Lambda/AWS/backend integration.
- Cognito user pool hoặc custom authorizer/IAM tùy client.
- WAF bảo vệ API public; private API qua VPC endpoint khi chỉ nội bộ.
- AppSync: managed GraphQL, real-time/offline sync use cases.
- AWS Amplify: frontend/web/mobile developer workflow; không thay Cognito/API backend concepts.

### Compute/integration traps

- Lambda 15 phút: job lâu/CPU-heavy → ECS/Fargate/Batch/EC2.
- Fargate không có nghĩa luôn rẻ hơn EC2; nó tối ưu vận hành và variable workloads.
- SNS không giữ message cho subscriber offline như queue; dùng SNS → SQS.
- SQS không broadcast một message cho mọi consumer: competing consumers cùng queue. Muốn mỗi nhóm nhận bản riêng, tạo nhiều queues qua SNS/EventBridge.
- Kinesis ordering theo shard/partition key, không mặc định toàn stream.
- Cron/schedule event → EventBridge Scheduler/rule; multi-step orchestration → Step Functions.

---

# Ngày 6 — Cost Optimization, Migration và Operations

## 1. Compute purchasing

| Option | Chọn khi | Ghi nhớ |
|---|---|---|
| On-Demand | Ngắn hạn, không đoán trước, không cam kết | Linh hoạt; không bảo đảm capacity tuyệt đối |
| Spot | Interruptible, stateless, fault-tolerant: batch, CI, workers | Rẻ nhất; có thể bị reclaim; diversify pools và checkpoint |
| Savings Plans | Baseline compute ổn định 1/3 năm | Cam kết $/giờ; Compute SP linh hoạt EC2/Fargate/Lambda hơn |
| Reserved Instances | EC2/RDS và scope/config phù hợp | Billing discount; Zonal EC2 RI có capacity reservation |
| On-Demand Capacity Reservation | Cần capacity trong AZ nhưng không muốn/không có discount commitment | Trả cho capacity giữ chỗ; SP/RI discount có thể áp dụng khi match |
| Dedicated Host | Compliance hoặc BYOL gắn socket/core/host | Toàn physical host; đắt, kiểm soát placement |

Savings Plans tạo billing discount nhưng không giữ capacity. Nếu đề bắt buộc có EC2 capacity trong một AZ, dùng Zonal Reserved Instance hoặc On-Demand Capacity Reservation phù hợp.

### Spot architecture

- Dùng mixed instances policy và capacity-optimized strategy.
- ASG baseline On-Demand + burst Spot.
- Stateless, retryable, checkpoint tới S3/EFS/DB; xử lý interruption notice.
- Không chọn Spot đơn độc cho database hoặc workload không thể gián đoạn.

## 2. Cost levers

### Compute

- Right-size bằng CloudWatch + Compute Optimizer.
- Auto Scaling, schedule stop dev/test, Graviton khi compatible.
- Lambda/Fargate cho variable/idle-heavy; EC2 commitment cho steady long-running.
- Đừng over-provision để “phòng tải”; scale theo demand.

### Storage

- S3 lifecycle + đúng storage class; Intelligent-Tiering cho unknown pattern.
- EBS gp3 thường tốt hơn gp2; xóa unattached volumes/snapshots cũ; snapshot lifecycle.
- EFS lifecycle sang IA/archive tier phù hợp; chọn throughput/performance mode đúng.
- Compress/columnar formats (Parquet/ORC) cho Athena/analytics để giảm scan.

### Database

- DynamoDB on-demand cho unpredictable; provisioned + auto scaling cho stable.
- Aurora Serverless cho variable/intermittent relational workload.
- Reserved DB instances cho steady RDS; read replica chỉ khi cần performance/DR, không tạo “cho chắc”.
- Cache hot reads khi hit ratio đủ tốt và giảm DB load thực sự.

### Network — rất hay ra đề

- Dùng S3/DynamoDB gateway endpoint để tránh NAT processing/data cost.
- NAT Gateway theo AZ cho HA; đồng thời giữ traffic local-AZ để tránh cross-AZ fee.
- CloudFront giảm origin data transfer và latency cho cacheable content.
- Cùng AZ thường rẻ hơn cross-AZ nhưng không đánh đổi HA nếu đề yêu cầu resilience.
- Chọn Region gần users/data và xét price/compliance/data transfer.
- PrivateLink có thể rẻ/đơn giản hơn full mesh peering/TGW khi chỉ cần expose một service.

## 3. Cost management tools

| Tool | Dùng để |
|---|---|
| Cost Explorer | Phân tích lịch sử, forecast, recommendations |
| AWS Budgets | Ngưỡng budget/usage/commitment + alerts/actions |
| Cost and Usage Report (CUR) | Dữ liệu billing chi tiết nhất, xuất S3 để query |
| Pricing Calculator | Ước tính trước khi triển khai |
| Cost Anomaly Detection | Phát hiện spending bất thường |
| Compute Optimizer | Right-size EC2/EBS/Lambda/ECS-related resources được hỗ trợ |
| Trusted Advisor | Checks cost, security, fault tolerance, performance, service limits |

- Tags + cost allocation tags + accounts/OUs giúp chargeback/showback.
- Consolidated billing gom usage và chia sẻ volume discount/commitment theo rule hiện hành; SCP không phải billing tool.

## 4. Migration và transfer

| Tình huống | Dịch vụ |
|---|---|
| Lift-and-shift servers/VMs với continuous replication | AWS Application Migration Service (MGN) |
| DB homogeneous/heterogeneous, minimal downtime CDC | AWS Database Migration Service (DMS) |
| Chuyển schema giữa khác engine | DMS Schema Conversion/SCT theo tooling hiện hành |
| Online bulk/incremental files giữa on-prem và AWS storage | AWS DataSync |
| SFTP/FTPS/FTP vào S3/EFS | AWS Transfer Family |
| Hybrid file/tape/volume interface với cloud backing | AWS Storage Gateway |
| Data quá lớn/mạng chậm, chuyển offline | AWS Snow Family |
| Upload S3 từ users toàn cầu | S3 Transfer Acceleration |
| Dedicated network transfer dài hạn | Direct Connect |

### Storage Gateway modes

| Mode | Use case |
|---|---|
| S3 File Gateway | NFS/SMB on-prem, objects lưu ở S3 |
| FSx File Gateway | Cache low-latency cho FSx for Windows từ on-prem |
| Volume Gateway cached | Primary data ở S3, cache hot data on-prem |
| Volume Gateway stored | Full dataset on-prem, async backup to AWS |
| Tape Gateway | Virtual tape library thay physical tapes, archive cloud |

### DMS traps

- DMS chuyển data và CDC; không tự chuyển mọi schema/code object giữa heterogeneous engines.
- Full load + CDC giảm downtime; source/target vẫn cần capacity/network/security phù hợp.
- DataSync là data movement, không phải application server migration.

## 5. Operations, governance, observability

| Câu hỏi | Dịch vụ |
|---|---|
| Metrics, logs, dashboards, alarms | CloudWatch |
| Ai/user/role/service đã gọi API nào, lúc nào | CloudTrail |
| Resource config thay đổi ra sao, compliant không | AWS Config |
| Trace request qua distributed services | X-Ray |
| Patch/Run Command/Session Manager/inventory EC2-hybrid | Systems Manager |
| IaC repeatable stacks, drift detection | CloudFormation |
| Multi-account landing zone/guardrails | Control Tower |
| Service incidents ảnh hưởng account | AWS Health Dashboard |

- CloudWatch alarm → SNS/Auto Scaling/action.
- CloudTrail Event History giữ management events gần đây; Trail gửi log dài hạn tới S3/CloudWatch Logs.
- AWS Config rules đánh giá desired configuration; có thể remediation qua Systems Manager Automation.
- Session Manager thay bastion/SSH inbound khi phù hợp: IAM-controlled, auditable, không cần mở port 22.
- CloudFormation rollback và change sets giảm lỗi thay đổi; StackSets triển khai multi-account/Region.

---

# Ngày 7 — Mock exam, vá lỗ hổng, chiến thuật phòng thi

## 1. Lịch ngày cuối

1. **Sáng — Mock 2:** 65 câu/130 phút, không tra tài liệu.
2. **Trưa — Error log:** phân loại từng câu sai:
   - Không biết service.
   - Nhầm yêu cầu/câu chữ.
   - Nhầm cặp dịch vụ.
   - Đổi đáp án đúng thành sai.
   - Thiếu thời gian.
3. **Chiều — Vá đúng 3 lỗ hổng lớn nhất:** đọc lại bảng, làm 10–15 câu mỗi lỗ hổng.
4. **Tối — Cram sheet + nghỉ:** không học dịch vụ mới, ngủ đủ.

## 2. Chiến thuật 3 vòng trong 130 phút

- Vòng 1, khoảng 80–90 phút: câu rõ làm ngay; câu dài/không chắc flag rồi đi tiếp.
- Vòng 2, khoảng 25–30 phút: xử lý câu flagged; loại đáp án theo ràng buộc.
- Vòng 3, 10–15 phút: đảm bảo không bỏ trống, kiểm tra câu multiple response và từ phủ định.
- Nếu kẹt >2.5 phút: chọn tốt nhất, flag, tiếp tục.
- Chỉ đổi đáp án khi tìm được lý do kỹ thuật cụ thể; đừng đổi vì cảm giác.

## 3. Cách đọc stem dài

```text
Current state → Problem → Hard constraints → Optimization word
```

Ví dụ:

```text
EC2 app ghi trực tiếp vào RDS
→ traffic spike làm RDS overload
→ không được mất request, app xử lý async được
→ least operational overhead

Đáp án: SQS buffer + scalable consumers; không chỉ tăng DB instance size.
```

## 4. Mục tiêu mock

- <70%: quay lại bảng quyết định core; chưa nên học edge cases.
- 70–79%: tập trung error log và cặp dễ nhầm.
- ≥80%: giữ nhịp, giảm careless mistakes; không nhồi kiến thức mới.
- Điểm practice provider không quy đổi trực tiếp sang 720/1000; dùng để theo xu hướng và lỗ hổng.

---

# Bảng quyết định tổng hợp

## 1. 28 cặp dễ nhầm

| A | B | Ranh giới quyết định |
|---|---|---|
| RDS Multi-AZ | Read replica | HA/failover vs read scaling |
| RDS Multi-AZ instance | Multi-AZ cluster | Standby không read vs hai readable standbys |
| Aurora Replica | Aurora Global DB | Trong Region read/HA vs cross-Region global reads/DR |
| SQS | SNS | Queue/buffer/pull vs pub-sub fan-out/push |
| SNS | EventBridge | Simple pub-sub endpoints vs event bus/rules/SaaS/content routing |
| EventBridge | Step Functions | Route event vs orchestrate stateful multi-step workflow |
| Kinesis Streams | Firehose | Custom consumers/replay vs managed delivery to destinations |
| SQS | Kinesis | Work queue/delete after consume vs ordered retained stream/replay |
| MSK | Amazon MQ | Kafka streaming ecosystem vs legacy broker protocols ActiveMQ/RabbitMQ |
| EBS | EFS | Block/single-AZ attachment vs shared elastic NFS |
| EFS | FSx Windows | Linux NFS vs Windows SMB/AD |
| FSx Lustre | EFS | HPC parallel throughput/S3 link vs general shared NFS |
| S3 Standard-IA | One Zone-IA | Multi-AZ primary copy vs recreatable one-AZ data |
| S3 lifecycle | S3 replication | Cost/retention transition vs duplicate data |
| CloudFront | Global Accelerator | HTTP cache/CDN vs TCP/UDP network acceleration/static IP |
| Route 53 latency | Geolocation | Best measured latency vs user geography/business rule |
| ALB | NLB | L7 content routing/WAF vs L4/static IP/extreme performance |
| Security Group | NACL | Stateful resource allow-only vs stateless subnet allow/deny |
| Gateway endpoint | Interface endpoint | Free route-table S3/DDB vs ENI PrivateLink cho nhiều services/on-prem |
| VPC peering | Transit Gateway | Few one-to-one links vs hub nhiều networks/transitive routing |
| VPN | Direct Connect | Nhanh thiết lập/encrypted internet vs dedicated predictable link |
| WAF | Network Firewall | HTTP L7 app protection vs VPC stateful network inspection |
| GuardDuty | Inspector | Threat detection behavior/logs vs vulnerability scanning |
| Secrets Manager | Parameter Store | Secret rotation vs config/secure parameters |
| CloudWatch | CloudTrail | Health/metrics/logs vs API audit |
| CloudTrail | Config | Ai làm gì vs resource từng được cấu hình/compliant thế nào |
| Spot | Savings Plans | Interruptible spare capacity vs committed baseline discount |
| Reserved concurrency | Provisioned concurrency | Limit/guarantee capacity vs pre-warm giảm cold start |

## 2. Architecture recipes

### Public static website an toàn, global

```text
Route 53 alias → CloudFront + ACM + WAF → private S3 bucket via OAC
```

- Không public bucket; cache tại edge; signed URL/cookie nếu private content.

### Highly available web app

```text
Route 53 → ALB (≥2 AZ) → ASG/ECS (private, ≥2 AZ)
                         → RDS Multi-AZ/Aurora
                         → ElastiCache nếu read/cache phù hợp
Static assets → S3 + CloudFront
```

### Serverless API

```text
CloudFront/WAF → API Gateway → Lambda → DynamoDB
                              ↘ SQS cho async work → Lambda consumer + DLQ
Auth → Cognito; orchestration → Step Functions
```

### Global low-latency application

```text
Route 53 latency hoặc Global Accelerator
  → regional ALB/API stacks
  → DynamoDB global tables hoặc Aurora Global Database
  → S3 CRR/Multi-Region access pattern nếu object data cần cross-Region
```

Chọn data layer theo write model/consistency; global app không chỉ là deploy compute ở hai Regions.

### Event-driven fan-out bền vững

```text
Producer → SNS/EventBridge
             ├→ SQS A → consumer A
             ├→ SQS B → consumer B
             └→ SQS C → consumer C
Mỗi queue có DLQ; consumers idempotent.
```

### Data lake analytics

```text
Sources → Firehose/DataSync/DMS → S3 data lake
                               → Glue catalog/ETL
                               → Athena/EMR/Redshift Spectrum
                               → Quick dashboards
```

- Parquet/ORC + partitioning + compression giảm scan/cost.

### Hybrid file access

```text
On-prem NFS/SMB → Storage Gateway/DataSync → S3/EFS/FSx
Network → VPN (nhanh) hoặc Direct Connect (ổn định)
```

## 3. Port numbers có ích

| Protocol | Port |
|---|---:|
| SSH | 22 |
| HTTP / HTTPS | 80 / 443 |
| DNS | 53 TCP/UDP |
| RDP | 3389 |
| MySQL/Aurora MySQL | 3306 |
| PostgreSQL/Aurora PostgreSQL | 5432 |
| MS SQL Server | 1433 |
| Oracle listener mặc định | 1521 |
| NFS | 2049 |
| SMB | 445 |
| Redis/Valkey mặc định | 6379 |

Không mở database/SSH/RDP ra `0.0.0.0/0`; dùng SG references, Session Manager, VPN hoặc controlled admin path.

---

# Nhận diện dịch vụ ít gặp — chỉ học một dòng

Không dành nhiều hơn 15–20 phút cho bảng này. Mục tiêu là nhận ra use case, không học cấu hình sâu.

| Dịch vụ | Từ khóa nhận diện |
|---|---|
| AWS Lake Formation | Dựng và quản governance/permissions cho data lake trên S3 |
| AWS Data Exchange | Tìm và subscribe third-party datasets |
| Amazon AppFlow | Managed data flow giữa SaaS như Salesforce và AWS services |
| Amazon Quick | BI, dashboard, visualization |
| AWS AppSync | Managed GraphQL + real-time/offline data sync |
| AWS Amplify | Tooling/hosting cho frontend web và mobile tích hợp backend AWS |
| AWS Device Farm | Test app trên thiết bị mobile/browser thật |
| Amazon Comprehend | NLP: entities, key phrases, sentiment |
| Amazon Kendra | Enterprise intelligent search |
| Amazon Lex | Conversational bot, speech/text intent |
| Amazon Polly | Text-to-speech |
| Amazon Rekognition | Image/video labels, faces, moderation |
| Amazon Textract | OCR + trích forms/tables từ document |
| Amazon Transcribe | Speech-to-text |
| Amazon Translate | Machine translation |
| Amazon SageMaker AI | Build/train/deploy/manage ML models |
| AWS Service Catalog | Danh mục sản phẩm/hạ tầng đã được phê duyệt để users tự triển khai |
| AWS License Manager | Theo dõi và kiểm soát software licenses |
| Amazon Managed Grafana | Managed visualization/dashboard cho metrics |
| Amazon Managed Service for Prometheus | Prometheus-compatible metrics monitoring managed |
| Amazon Kinesis Video Streams | Ingest và lưu video streams cho processing/analytics |
| Amazon Elastic Transcoder | Legacy managed media transcoding; nhận diện khi đề dùng workload cũ |

---

# Active recall — 35 câu trả lời nhanh

Đọc câu hỏi, trả lời thành tiếng trước khi nhìn phần sau dấu `→`.

1. HA RDS nhưng không cần scale read? → **RDS Multi-AZ**.
2. RDS read-heavy? → **Read replicas**, app route reads tới replicas.
3. Lambda tạo quá nhiều DB connections? → **RDS Proxy**.
4. Key-value toàn cầu, mỗi Region cùng read/write? → **DynamoDB global tables**.
5. SQL global reads và cross-Region DR? → **Aurora Global Database**.
6. Không biết pattern access S3? → **S3 Intelligent-Tiering**.
7. Archive rẻ nhất, chấp nhận restore hàng giờ? → **S3 Glacier Deep Archive**.
8. Shared Linux file system cho nhiều EC2? → **EFS**.
9. Windows SMB + AD? → **FSx for Windows File Server**.
10. HPC processing dữ liệu trong S3? → **FSx for Lustre**.
11. EC2 private cần S3, ít cost nhất? → **S3 gateway VPC endpoint**.
12. On-prem cần private IP tới AWS service qua DX/VPN? → **Interface endpoint/PrivateLink** nếu service hỗ trợ.
13. Chặn SQL injection ở CloudFront/ALB? → **WAF**.
14. Phát hiện credential/API/network đáng ngờ? → **GuardDuty**.
15. Tìm PII trong S3? → **Macie**.
16. Quét CVE trên EC2/ECR/Lambda? → **Inspector**.
17. Ai xóa security group? → **CloudTrail**.
18. Security group có compliant không, từng thay đổi gì? → **AWS Config**.
19. Latency nằm ở microservice nào? → **X-Ray**.
20. Buffer spike, không mất task? → **SQS + scalable consumers + DLQ**.
21. Một event cho ba hệ thống độc lập? → **SNS/EventBridge → ba SQS queues**.
22. Route event SaaS theo JSON content? → **EventBridge**.
23. Ordered task processing? → **SQS FIFO**, đúng message group/dedup.
24. Replay streaming events cho nhiều consumers? → **Kinesis Data Streams/MSK**.
25. Deliver stream đơn giản tới S3/Redshift/OpenSearch? → **Data Firehose**.
26. Workflow có wait/retry/branch/human approval? → **Step Functions Standard**.
27. HTTP path-based routing? → **ALB**.
28. TCP/UDP + static IP? → **NLB**.
29. Fleet firewalls/IDS appliances? → **GWLB**.
30. Hai VPC đơn giản? → **Peering**; hàng chục VPC/hybrid hub → **Transit Gateway**.
31. Dedicated on-prem link? → **Direct Connect**; encrypted nhanh triển khai → **VPN**.
32. Interruptible batch rẻ nhất? → **Spot**.
33. Baseline compute ổn định nhưng muốn linh hoạt EC2/Fargate/Lambda? → **Compute Savings Plans**.
34. Di chuyển VM lift-and-shift? → **Application Migration Service**.
35. Chuyển database với minimal downtime? → **DMS full load + CDC**.

---

# Cram sheet — 60 phút cuối

## Nếu chỉ còn 15 phút

- IAM: implicit deny → allow → explicit deny thắng; SCP/boundary không cấp quyền; workload dùng role.
- SG stateful/resource/allow-only; NACL stateless/subnet/allow+deny.
- Multi-AZ = HA; read replica = scale read; Aurora Global = cross-Region relational; DynamoDB global tables = multi-active key-value.
- SQS buffer; SNS fan-out; EventBridge route; Kinesis stream/replay; Step Functions orchestrate.
- EBS block; EFS shared NFS; FSx Windows SMB; FSx Lustre HPC; S3 object.
- ALB L7; NLB L4/static IP; GWLB appliances.
- CloudFront cache HTTP; Global Accelerator TCP/UDP/static Anycast; Route 53 DNS policy.
- Gateway endpoint = S3/DDB; interface endpoint = PrivateLink.
- CloudWatch health; CloudTrail audit; Config configuration/compliance; X-Ray tracing.
- Spot interruptible; Savings Plans baseline commitment; On-Demand uncertain/short; Dedicated Host compliance/BYOL.

## Checklist trước khi nộp bài

- [ ] Không câu nào bỏ trống.
- [ ] Multiple response đã chọn đúng **số lượng** đáp án được yêu cầu.
- [ ] Đã chú ý `MOST`, `LEAST`, `NOT`, `EXCEPT`.
- [ ] Đáp án thỏa đủ security + resilience trước khi tối ưu cost.
- [ ] Không chọn self-managed EC2 nếu managed service giải đúng yêu cầu với ít ops hơn.
- [ ] Không nhầm HA với backup, hoặc replication với backup.
- [ ] Không nhầm read scaling với write scaling.
- [ ] Không tự thêm giả định ngoài đề.

---

# Nguồn chính thức và phạm vi cập nhật

Cheatsheet này được xây dựng theo blueprint SAA-C03 đang công bố tại thời điểm **2026-08-30**. AWS thay đổi quotas, tên dịch vụ và tính năng theo thời gian; trong đề, ưu tiên requirement và kiến trúc hơn các con số ít gặp.

- [SAA-C03 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html)
- [AWS Certified Solutions Architect – Associate exam overview](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [AWS Decision Guides](https://docs.aws.amazon.com/decision-guides/)
- [IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [VPC security groups vs network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html)
- [Route 53 routing policies](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
- [RDS Multi-AZ deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [DynamoDB capacity modes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/CostOptimization_TableCapacityMode.html)
- [SQS, SNS, or EventBridge decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html)
- [Step Functions workflow types](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html)
- [EC2 purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [AWS disaster recovery strategies](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- [AWS migration services decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/migration-on-aws-how-to-choose.html)

## Tiêu chuẩn “đã sẵn sàng thi”

Bạn có thể giải thích không nhìn tài liệu các bảng sau: IAM evaluation, SG vs NACL, storage, database, ELB, connectivity, messaging, DR và purchasing. Hai mock gần nhất đạt khoảng 80% trở lên, mọi câu sai đều có một dòng “từ khóa → lý do đáp án”. Khi đạt các điều này, đọc lại cram sheet hiệu quả hơn học thêm dịch vụ hiếm.
