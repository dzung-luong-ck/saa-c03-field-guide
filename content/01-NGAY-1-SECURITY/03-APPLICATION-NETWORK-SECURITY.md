# Application và Network Security

## 1. Defense in depth

```text
Edge: Route 53 / CloudFront / Global Accelerator
  ↓
DDoS & web: Shield / WAF
  ↓
VPC perimeter: Network Firewall / GWLB appliances
  ↓
Subnet/resource: NACL / Security Group
  ↓
Application: authentication, authorization, validation
  ↓
Data: resource policy, encryption, backup, classification
  ↓
Detection: GuardDuty, Inspector, Macie, Security Hub, CloudTrail
```

Không có một service “security tổng quát” giải mọi lớp. Đề thường đưa loại threat hoặc data source để bạn chọn đúng control.

## 2. WAF, Shield, Network Firewall, Firewall Manager

### AWS WAF

- Web application firewall layer 7.
- Kiểm tra HTTP(S) requests: IP, headers, URI, query, body, rate, geo và managed rule groups.
- Gắn với CloudFront, ALB, API Gateway, AppSync và resources được hỗ trợ.
- Use cases: SQL injection, XSS, bad bots, IP reputation, rate limiting, geo rules.
- Không bảo vệ arbitrary TCP/UDP hoặc thay Security Group.

### AWS Shield

- Shield Standard: DDoS protection cơ bản tự động cho supported services.
- Shield Advanced: detection/mitigation nâng cao, visibility, DRT và cost protection theo điều kiện dịch vụ.
- DDoS-resilient architecture vẫn cần CloudFront/Route 53/ELB/Auto Scaling và origin protection.

### AWS Network Firewall

- Managed stateful firewall cho VPC traffic.
- Domain/IP/port/protocol và stateful inspection rules.
- Triển khai firewall endpoints trong dedicated subnets; route tables đưa traffic qua inspection path.
- Dùng cho centralized egress/ingress/east-west inspection theo architecture.

### AWS Firewall Manager

- Quản policy WAF, Shield Advanced, Network Firewall, security groups và controls được hỗ trợ trên nhiều accounts/resources.
- Cần AWS Organizations integration.
- Chọn khi đề nhấn mạnh central enforcement ở hàng chục/hàng trăm accounts.

### Gateway Load Balancer

- Không phải firewall rule engine.
- Dùng để deploy/scale/route traffic qua third-party virtual appliances như firewall/IDS/IPS.
- GENEVE encapsulation và GWLB endpoints.
- Chọn khi cần existing/vendor appliances; Network Firewall khi cần AWS-managed network firewall.

## 3. Security Group và NACL trong security design

| | Security Group | Network ACL |
|---|---|---|
| Level | ENI/resource | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow và deny |
| Evaluation | Tổng hợp rules | Rule number tăng dần, first match |
| Return path | Tự cho phép | Phải allow explicit, gồm ephemeral ports |

Pattern chuẩn:

```text
ALB-SG: inbound 443 từ internet/CloudFront range theo design
APP-SG: inbound app-port chỉ từ ALB-SG
DB-SG: inbound DB-port chỉ từ APP-SG
```

SG reference tốt hơn hard-code IP của autoscaled resources. NACL dùng cho coarse-grained subnet guardrail hoặc explicit deny CIDR.

## 4. Detection và posture services

| Service | Input/đối tượng | Output | Câu hỏi điển hình |
|---|---|---|---|
| GuardDuty | CloudTrail, DNS, VPC Flow Logs và optional data sources | Security findings | Credential/network behavior có đáng ngờ? |
| Inspector | EC2, ECR images, Lambda theo coverage | Vulnerability/exposure findings | Có CVE/package/network exposure nào? |
| Macie | S3 objects/metadata | Sensitive data/public access findings | Bucket nào chứa PII/financial data? |
| Security Hub | Findings từ AWS/partner + standards | Central posture/findings | Tổng hợp security posture nhiều accounts? |
| Detective | Findings/log relationships | Investigation graph/timeline | Điều tra root cause của GuardDuty finding? |
| Amazon Detective | Investigation | Không phải primary prevention | Ai/host/resource liên quan incident? |
| Audit Manager | Control evidence | Audit reports/evidence | Thu thập evidence framework? |
| Artifact | AWS compliance documents | Reports/agreements | Tải SOC/ISO/PCI report? |

### Detect vs prevent

- GuardDuty phát hiện, không thay firewall.
- Inspector báo vulnerability, không tự patch mọi host.
- Macie classify S3 data, không thay bucket policy/encryption.
- Security Hub tổng hợp/prioritize, không phải nguồn telemetry duy nhất.
- Detective điều tra sau finding, không block request.

## 5. S3 access control stack

Một request S3 có thể bị ảnh hưởng bởi:

- IAM identity policy.
- Bucket policy/access point policy.
- ACL nếu vẫn dùng; Object Ownership bucket-owner-enforced thường loại nhu cầu ACL.
- VPC endpoint policy.
- SCP/RCP/permissions boundary/session policy.
- Block Public Access.
- KMS key policy nếu SSE-KMS.

### Block Public Access

- Có thể bật ở account/bucket/access point scope.
- Chặn các dạng public policy/ACL theo settings.
- Nên bật mặc định; tắt chỉ khi business requirement thật sự cần public S3.

### Object Ownership

- Bucket owner enforced vô hiệu ACL và bucket owner sở hữu objects.
- Giảm vấn đề object do account khác upload nhưng bucket owner không kiểm soát đầy đủ.

### Access Points

- Tạo access policy/network origin riêng cho từng application/team trên shared bucket.
- Giảm bucket policy khổng lồ.
- S3 Object Lambda access point có transform use cases, nhưng không phải lựa chọn mặc định.

## 6. CloudFront private content

### Origin protection

- OAC cho private S3 bucket; bucket policy chỉ cho distribution.
- Người dùng không truy cập trực tiếp S3 URL.
- Với custom origin/ALB, dùng secret header/origin controls và restrict network access theo capability hiện hành.

### Viewer authorization

| Nhu cầu | Chọn |
|---|---|
| Một file hoặc client không hỗ trợ cookie | CloudFront signed URL |
| Nhiều file/private area/HLS | CloudFront signed cookies |
| Cấp tạm quyền trực tiếp S3 object | S3 presigned URL |

CloudFront signed URL/cookie kiểm soát viewer access tới distribution. S3 presigned URL cho truy cập S3 bằng permission của signer; không tận dụng CloudFront cache mặc định.

### Geo restriction vs WAF geo match

- CloudFront geo restriction: allowlist/blocklist countries đơn giản ở distribution.
- WAF geo rule: kết hợp với rule logic, rate, IP, managed rules linh hoạt hơn.

## 7. Credentials và application config

- Workload role thay static access keys.
- Secrets Manager/Parameter Store cho secret/config.
- IMDSv2 cho EC2 metadata protection.
- ECR image scanning/Inspector cho container vulnerabilities.
- Patch Manager/Systems Manager cho patch workflow.
- CloudTrail data events khi cần object/Lambda-level API audit.
- VPC Flow Logs cho network metadata, không capture packet body.

## 8. Secure administration

### Session Manager

- Quản shell/session qua IAM và Systems Manager.
- Không cần mở inbound port 22/3389 hoặc quản bastion public trong nhiều use cases.
- Có thể log session theo configuration.
- Instance cần SSM Agent, IAM role và network path tới Systems Manager endpoints.

### Bastion host

- Vẫn có thể dùng khi protocol/tooling yêu cầu SSH/RDP trực tiếp.
- Đặt public subnet, restrict source IP, patch/harden, HA nếu bắt buộc.
- Không mở SSH/RDP từ toàn internet.

### Private EC2 outbound

- NAT Gateway cho internet outbound IPv4.
- VPC endpoints cho AWS services để tránh internet/NAT và tăng private access.
- Egress-only IGW cho outbound IPv6.
- Network Firewall/proxy khi cần inspect/control egress.

## 9. Incident response pattern

```text
GuardDuty/Inspector/Macie finding
→ Security Hub/EventBridge
→ SNS/ticket/Lambda/Step Functions
→ isolate SG / snapshot disk / revoke credential
→ preserve evidence in protected account
→ Detective/CloudTrail/CloudWatch analysis
```

Automation phải có guardrails, approvals và rollback. Không tự động terminate evidence-bearing instance nếu forensic requirement nói phải bảo toàn.

## 10. Scenario reasoning

### Scenario A — Chặn SQL injection cho global website

```text
Users → CloudFront + WAF managed/custom rules → ALB → app
```

Shield hỗ trợ DDoS, nhưng SQL injection là WAF layer 7. SG/NACL không hiểu SQL payload.

### Scenario B — Phát hiện EC2 gọi crypto-mining domain

GuardDuty phân tích DNS/network/API signals và tạo finding. EventBridge có thể trigger containment. Inspector không phải primary service cho runtime suspicious behavior.

### Scenario C — Tìm buckets chứa PII

Macie classify sensitive data trong S3, Security Hub aggregate finding, S3 policy/encryption/remediation bảo vệ dữ liệu.

### Scenario D — Central WAF rules cho 100 accounts

Firewall Manager + Organizations triển khai/enforce WAF policy. Không cấu hình tay từng account.

### Scenario E — Private S3 website content

S3 website endpoint yêu cầu public-style access và không phù hợp OAC như S3 REST origin. Dùng private S3 REST origin + CloudFront OAC; CloudFront cung cấp HTTPS/custom domain/default root object behavior.

## 11. Exam traps

- WAF = HTTP layer 7; Network Firewall = VPC network traffic.
- Shield không thay WAF và WAF không thay Shield.
- SG không có deny rule; NACL stateless.
- VPC Flow Logs không capture application payload.
- CloudTrail audit API, không phải packet inspection.
- Public S3 website không phải lựa chọn tốt cho private CloudFront origin.
- Signed URL/cookie không tự mã hóa origin; vẫn cần OAC/TLS.
- Artifact cung cấp compliance reports; Audit Manager thu evidence.

Tiếp theo: [Câu hỏi tự kiểm tra](04-CAU-HOI-TU-KIEM-TRA.md).
