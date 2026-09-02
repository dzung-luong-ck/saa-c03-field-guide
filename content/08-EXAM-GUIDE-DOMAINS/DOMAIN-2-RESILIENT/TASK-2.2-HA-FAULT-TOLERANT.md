# Task 2.2 — Design highly available and/or fault-tolerant architectures

Task này hỏi cách chọn redundancy, failover, backup và DR phù hợp với mức lỗi mà doanh nghiệp phải chịu được.

## 1. Giải thích cho người mới

Đầu tiên xác định thứ có thể hỏng:

```text
Process → instance → host → AZ → Region → account → dependency toàn cầu
```

Sau đó đặt bản dự phòng ngoài cùng failure domain. Hai EC2 trên cùng host/AZ không giải sự cố AZ. Backup ở cùng account với quyền xóa giống production không giải tốt account compromise.

## 2. Các khái niệm phải tách

| Khái niệm | Ý nghĩa |
|---|---|
| High availability | Giảm downtime bằng redundancy và failover |
| Fault tolerance | Tiếp tục chạy gần như không gián đoạn khi một lỗi xảy ra |
| Durability | Dữ liệu không bị mất/hỏng lâu dài |
| RPO | Chấp nhận mất tối đa bao nhiêu dữ liệu tính theo thời gian |
| RTO | Chấp nhận hệ thống ngừng tối đa bao lâu |

Multi-AZ thường cho HA trong một Region. Multi-Region dùng khi business cần chịu Region failure hoặc latency/compliance khác.

## 3. Loại single point of failure

Kiến trúc web HA cơ bản:

```text
Route 53
→ ALB ở public subnets AZ-A/AZ-B
→ ASG targets private AZ-A/AZ-B
→ RDS Multi-AZ hoặc data layer có failover
```

Điều kiện:

- có healthy targets ở nhiều AZ, không chỉ LB subnets;
- application stateless hoặc state nằm ở shared resilient store;
- health check đủ sâu để biết app nhận traffic được;
- dependencies như NAT, database, cache, DNS không tạo SPOF;
- retry có backoff/jitter và request thay đổi có idempotency.

## 4. Database resilience

### Multi-AZ

Mục tiêu chính: availability và automatic failover. Standby không phải read scaling endpoint mặc định theo mọi engine/deployment.

### Read replica

Mục tiêu chính: read scaling và có thể hỗ trợ DR/migration theo thiết kế. Replication thường asynchronous nên có lag.

### RDS Proxy

Giảm connection storm và tái sử dụng connection cho RDS/Aurora use case phù hợp. Nó không làm query chậm tự nhiên nhanh lên và không thay database HA.

## 5. DR strategies theo RTO/RPO

| Strategy | Môi trường DR | Cost tương đối | Recovery tương đối |
|---|---|---:|---:|
| Backup & restore | Chủ yếu giữ backup | Thấp | Chậm nhất |
| Pilot light | Data/core tối thiểu đang chạy | Thấp–vừa | Nhanh hơn restore |
| Warm standby | Bản thu nhỏ đang chạy | Vừa–cao | Nhanh |
| Active-active | Nhiều site phục vụ | Cao nhất | Nhanh nhất, phức tạp nhất |

Không chọn active-active nếu đề chỉ cần RTO nhiều giờ và ưu tiên chi phí. Không chọn backup/restore nếu RTO vài phút.

## 6. Failover và health

- Route 53 health check/failover có thể chuyển DNS endpoint; phải tính DNS caching/TTL.
- ELB health check loại target lỗi trong target group.
- Auto Scaling thay instance unhealthy.
- Database failover có thể reset connection; application cần retry và connection handling.
- CloudWatch alarm phải dựa trên business symptom như error rate/latency/queue age, không chỉ CPU.

## 7. Immutable infrastructure

Thay vì sửa server đang chạy, build AMI/container image mới và rollout theo batch/blue-green. Điều này giảm configuration drift và giúp rollback rõ. Auto Scaling instance refresh/lifecycle hook hỗ trợ rollout và drain có kiểm soát.

## 8. Legacy application

Nếu không thể sửa code:

- dùng ELB/ASG cho process có thể nhân bản;
- EFS/FSx cho shared filesystem requirement;
- DMS/DataSync/Storage Gateway theo data path;
- RDS Proxy giảm connection issue phù hợp;
- Elastic Disaster Recovery cho server recovery;
- stickiness chỉ như bridge, không phải trạng thái HA lý tưởng.

## 9. Scenario điển hình

**Đề:** Application phải chịu lỗi một AZ, RTO dưới vài phút, không mất transaction đã commit, database relational, ít vận hành.

**Thiết kế:** ALB/ASG multi-AZ + RDS/Aurora Multi-AZ phù hợp + stateless app + automated health replacement + backup cho lỗi logic. Multi-AZ giải availability; backup giải point-in-time recovery.

**Loại:** một EC2 lớn; read replica đơn lẻ nhưng không có failover plan; snapshot mỗi ngày như giải pháp RTO vài phút.

## 10. Exam traps

- Backup durable nhưng restore vẫn có downtime.
- Multi-AZ không mặc định giải Region failure.
- Read replica không giống synchronous standby.
- Hai resources trong cùng AZ không chịu AZ failure.
- Health check quá sâu có thể loại toàn fleet khi shared dependency lỗi.
- DNS failover không tức thời tuyệt đối vì resolver caching.
- Service quota ở DR Region phải đủ trước sự cố.

## 11. Checklist làm được task

- [ ] Xác định failure domain từ requirement.
- [ ] Phân biệt HA, fault tolerance và durability.
- [ ] Dùng RPO/RTO để chọn DR strategy.
- [ ] Phân biệt Multi-AZ, read replica và backup.
- [ ] Tìm SPOF ở compute, network, data và account.
- [ ] Chọn metric/health check phản ánh khả năng phục vụ.

Học sâu: [High Availability và Auto Scaling](../../02-NGAY-2-RESILIENCE/01-HA-AUTO-SCALING.md), [Database Resilience](../../02-NGAY-2-RESILIENCE/02-DATABASE-RESILIENCE.md) và [Disaster Recovery](../../02-NGAY-2-RESILIENCE/03-DISASTER-RECOVERY.md).

Tiếp theo: [Domain 3 — Design High-Performing Architectures](../DOMAIN-3-HIGH-PERFORMING/README.md).
