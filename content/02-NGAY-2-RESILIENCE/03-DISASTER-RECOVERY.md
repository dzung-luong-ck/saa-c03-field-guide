# Disaster Recovery

## 1. RPO và RTO

```text
Last recoverable data point ── RPO ── Disaster ── RTO ── Service restored
```

- **RPO**: lượng dữ liệu tối đa có thể mất, đo theo thời gian.
- **RTO**: thời gian tối đa hệ thống được phép gián đoạn.

Ví dụ:

- RPO 15 phút: recovery point không cũ hơn 15 phút.
- RTO 1 giờ: dịch vụ phải hoạt động lại trong một giờ.

RPO/RTO là business requirements. Không chọn active/active nếu business chấp nhận hàng giờ và ưu tiên cost.

## 2. Bốn chiến lược DR

| Strategy | DR environment | RPO/RTO tương đối | Cost/complexity |
|---|---|---|---|
| Backup & Restore | Backups + IaC, compute chưa chạy | Cao/chậm nhất | Thấp nhất |
| Pilot Light | Data/core services chạy, app compute tối thiểu/tắt | Hàng chục phút | Trung bình thấp |
| Warm Standby | Toàn stack chạy nhỏ | Phút | Cao |
| Multi-site Active/Active | Full stack phục vụ traffic | Gần zero | Cao nhất |

### Backup & Restore

```text
Primary → scheduled backups/snapshots → DR Region/account
Failure → deploy IaC → restore data → start app → switch DNS
```

Chọn khi:

- Cost quan trọng.
- RTO hàng giờ chấp nhận được.
- Workload có IaC và restore automation.

Rủi ro: restore time phụ thuộc dataset size, initialization, quota/capacity và configuration drift.

### Pilot Light

```text
DR Region:
data replication luôn chạy
critical core services chạy
app fleet chưa chạy hoặc minimum
```

Failure:

- provision/scale app tier;
- attach/configure data;
- validate;
- switch traffic.

Nhanh hơn backup vì data/core đã sẵn sàng.

### Warm Standby

```text
DR Region có full functional stack ở capacity nhỏ
Failure → scale up → switch traffic
```

Chọn khi RTO vài phút và có ngân sách duy trì full stack nhỏ.

### Active/Active

- Cả hai/multiple Regions phục vụ users.
- Data layer phải hỗ trợ multi-Region model.
- Traffic manager loại unhealthy Region.
- Không có “failover deploy” lớn, nhưng operational complexity cao.

Khó khăn:

- consistency/conflicts;
- deployment đồng bộ;
- global quota/certificate/secrets;
- observability và incident isolation;
- toàn bộ traffic có chạy được ở phần còn lại không?

## 3. DR service mapping

| Layer | Options |
|---|---|
| Traffic | Route 53 failover/latency/weighted, Global Accelerator |
| Compute | CloudFormation, AMI copy, ASG, ECS/EKS images, Lambda deployment |
| Object | S3 CRR, Batch Replication, backups |
| Block | EBS snapshots copy Region/account |
| File | EFS replication/DataSync/backup; FSx replication/backup theo type |
| Relational | Cross-Region read replica, Aurora Global, snapshot/PITR |
| NoSQL | DynamoDB global tables + PITR/backup |
| Cache | Rebuild/replicate theo engine; không dựa cache như source of truth |
| Secrets/keys | Replicate secrets where supported/design; multi-Region KMS/client encryption hoặc destination keys |
| Governance | AWS Backup, cross-account vault, Vault Lock, Organizations policies |

## 4. Backup design

### 3-2-1-inspired cloud thinking

- Multiple recovery points.
- Independent account/security boundary.
- Cross-Region/offline/immutable copy theo threat model.
- Retention phù hợp legal/business.
- Restore test và evidence.

### AWS Backup

- Backup plans: frequency, window, lifecycle, retention.
- Resource assignments bằng tags/ARNs.
- Cross-account và cross-Region copy theo resource support.
- Backup Vault Lock tạo immutable retention control.
- Audit Manager/restore testing features theo availability.

### Backup dependency checklist

- KMS key không bị delete/disable.
- Destination account không thể tự ý leave Organization nếu policy cấm.
- IAM restore role tồn tại.
- Quotas/capacity ở DR Region đủ.
- AMIs/container images/config/certificates/secrets cũng có mặt.
- DNS TTL và health checks phù hợp.

## 5. Replication không phải backup

| Event | Replica | Backup/PITR |
|---|---|---|
| AZ/Region failure | Hữu ích | Restore chậm hơn |
| Accidental delete | Có thể replicate delete | Quay lại point trước delete |
| Bad deployment corrupt data | Có thể replicate corruption | Restore pre-corruption point |
| Ransomware credential | Có thể xóa cả replica | Immutable/cross-account backup tốt hơn |

Kết luận: replication tối ưu availability/RPO; backup tối ưu recoverability trước logical/security failure.

## 6. Traffic failover

### Route 53

- Failover policy active/passive.
- Health check endpoint hoặc calculated health checks.
- DNS TTL/cache làm failover không tức thì tuyệt đối.
- Alias evaluate target health cho supported AWS targets.

### Global Accelerator

- Static Anycast IPs.
- Health-based routing tới regional endpoints.
- Fast network-level failover, không cache content.
- Phù hợp TCP/UDP và clients cần static IP.

### CloudFront origin failover

- Origin group primary/secondary cho supported request patterns.
- Hữu ích cho web content/API origin resilience nhưng không thay full application/data DR.

## 7. Data consistency và DR

- Synchronous replication giảm RPO nhưng tăng latency/coupling distance.
- Asynchronous cross-Region replication thường cho performance tốt hơn nhưng RPO > 0.
- Planned switchover có thể chờ sync; unplanned failover có thể mất in-flight/unreplicated writes.
- Application phải xử lý duplicate/replayed requests và reconcile ambiguous transactions.

## 8. IaC và configuration parity

- CloudFormation templates/StackSets giữ infrastructure repeatable.
- AMI/image artifacts replicated.
- Parameter values, certificates, secrets, KMS keys, DNS và quotas được inventory.
- Drift detection/config rules phát hiện DR stack lệch.
- Deploy application changes cho primary và DR theo pipeline; pilot light “quên update” sẽ không chạy khi cần.

## 9. DR runbook

1. Declare incident và authority.
2. Dừng/kiểm soát writes nếu có thể.
3. Xác định recovery point.
4. Promote/restore data layer.
5. Scale/provision compute.
6. Validate security, dependency và business transaction.
7. Switch traffic.
8. Monitor và communicate.
9. Sau recovery: reconcile data, plan failback, postmortem.

Failback cũng là một project DR; không mặc định “đổi DNS ngược lại”.

## 10. Scenario reasoning

### A. RTO 12 giờ, RPO 24 giờ, cost thấp nhất

Backup & Restore: daily backup/copy + IaC. Active/active là overengineering.

### B. RTO 15 phút, RPO vài phút

Pilot light hoặc warm standby tùy exact startup/scale time. Data replicated, IaC/app artifacts ready; test chứng minh RTO.

### C. Global app RTO gần zero

Multi-site active/active + multi-Region data service + health-based routing. Kiểm tra remaining Region có capacity chịu full load.

### D. Database deleted bởi compromised admin

Cross-Region read replica có thể nhận delete. Cross-account immutable backup/PITR và protected KMS/backup roles tốt hơn.

## 11. Exam traps

- Multi-AZ không bảo vệ Regional disaster.
- Cross-Region replication không tự tạo complete DR stack.
- Backup ở cùng account và key có thể không đủ trước credential compromise.
- Low TTL không đảm bảo mọi client lập tức bỏ cache.
- Pilot light và warm standby khác nhau ở mức full stack đang chạy.
- Active/passive Route 53 không tự promote database.
- Chọn DR theo RPO/RTO, không theo “dịch vụ mạnh nhất”.

Tiếp theo: [Decoupling và Messaging](04-DECOUPLING-MESSAGING.md).
