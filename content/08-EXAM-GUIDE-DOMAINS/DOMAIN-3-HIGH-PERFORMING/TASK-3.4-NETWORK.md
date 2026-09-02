# Task 3.4 — Determine high-performing and/or scalable network architectures

Task này hỏi cách thiết kế topology, routing, load balancing, edge và hybrid connectivity để network không trở thành bottleneck khi hệ thống tăng tải hoặc mở rộng toàn cầu.

## 1. Giải thích cho người mới

Network performance chịu ảnh hưởng bởi:

- khoảng cách vật lý;
- số hop và đường đi;
- bandwidth;
- connection setup và protocol;
- load distribution;
- packet loss/retry;
- vị trí của compute và data.

Đặt application gần data thường quan trọng hơn chỉ nâng bandwidth. Cache tại edge có thể loại cả round trip về Region.

## 2. VPC topology có thể scale

- Chọn CIDR đủ lớn và tránh overlap với VPC/on-prem sẽ kết nối.
- Chia public, application, data subnets theo tier và AZ.
- Route tables thể hiện path; SG/NACL thể hiện permission.
- VPC peering phù hợp kết nối point-to-point, không transitive.
- Transit Gateway phù hợp hub-and-spoke nhiều VPC/on-prem.
- PrivateLink expose một service riêng tư mà không mở full network routing.

## 3. Load balancer selection

| Requirement | Hướng chọn |
|---|---|
| HTTP/HTTPS, host/path/header routing | ALB |
| TCP/UDP/TLS, rất cao performance, static IP/source IP requirement phù hợp | NLB |
| Chèn network virtual appliance | Gateway Load Balancer |

Load balancer cần targets khỏe ở nhiều AZ. Health check, deregistration delay và cross-zone behavior ảnh hưởng failover/performance.

## 4. Edge services

### CloudFront

CDN cache HTTP content tại edge. Phù hợp website/API/media, giảm latency tới viewer và origin load. Origin có thể là S3, ALB, API endpoint và nguồn được hỗ trợ.

### Global Accelerator

Cung cấp static anycast IP và đưa TCP/UDP traffic vào AWS global network tới healthy regional endpoint. Phù hợp non-cacheable, gaming/voice hoặc client cần IP ổn định/global failover.

### Route 53

DNS routing theo latency, weighted, failover, geolocation/geoproximity và policy phù hợp. DNS quyết định endpoint; nó không proxy mọi packet sau khi resolution.

## 5. Hybrid connectivity

| Lựa chọn | Trade-off |
|---|---|
| Site-to-Site VPN | Nhanh triển khai, mã hóa qua Internet, performance biến động hơn |
| Direct Connect | Dedicated private connection, ổn định hơn, provisioning lâu hơn |
| DX + VPN | Private connectivity cộng encryption theo requirement |
| Multiple links/sites | Tăng redundancy nếu thiết kế BGP/path độc lập |

Bandwidth phải đủ cho peak và recovery/replication window, không chỉ average traffic.

## 6. Placement và data path

- EC2 và EBS phải phù hợp AZ.
- App và database nên gần nhau nếu latency-sensitive.
- Cross-AZ/Region path có latency và cost.
- VPC endpoint giữ traffic tới service được hỗ trợ trên private path.
- CloudFront/edge giảm long-haul request lặp lại.
- Connection reuse/keep-alive và compression có thể giảm overhead ở application layer.

## 7. Scenario điển hình

**Đề A:** Game UDP toàn cầu, không cache, cần static IP và tự chuyển tới Region khỏe.

**Chọn:** Global Accelerator tới regional NLB/endpoints phù hợp. CloudFront không phải lựa chọn chính cho arbitrary UDP non-cacheable traffic.

**Đề B:** 100 VPC và nhiều on-prem sites cần routing tập trung, giảm mesh peering.

**Chọn:** Transit Gateway hub-and-spoke; route tables phân đoạn; Direct Connect/VPN attachments phù hợp.

## 8. Exam traps

- VPC peering không transitive.
- Internet Gateway không phải NAT.
- Route 53 là DNS, không phải Layer 7 load balancer proxy.
- CloudFront cache HTTP content; Global Accelerator tối ưu network path cho TCP/UDP.
- Direct Connect không tự mã hóa payload.
- Public subnet không đảm bảo resource có public IP hoặc firewall mở.
- Thêm AZ subnet mà không có target/capacity không tạo performance hay HA thực.

## 9. Checklist làm được task

- [ ] Vẽ topology public/app/data qua nhiều AZ.
- [ ] Chọn peering, Transit Gateway hoặc PrivateLink.
- [ ] Chọn ALB, NLB hoặc GWLB theo protocol/function.
- [ ] Phân biệt CloudFront, Global Accelerator và Route 53.
- [ ] Chọn VPN/DX từ bandwidth, thời gian, encryption và resilience.
- [ ] Theo dấu packet và tìm hop/cross-boundary không cần thiết.

Học sâu: [VPC Foundations](../../04-NGAY-4-NETWORKING/01-VPC-FOUNDATIONS.md), [Hybrid Connectivity](../../04-NGAY-4-NETWORKING/02-CONNECTIVITY-HYBRID.md) và [ELB, Route 53, Edge](../../04-NGAY-4-NETWORKING/03-ELB-ROUTE53-EDGE.md).

Tiếp theo: [Task 3.5 — Data ingestion](TASK-3.5-DATA-INGESTION.md).
