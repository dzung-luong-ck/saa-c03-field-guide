# Task 4.4 — Design cost-optimized network architectures

Task này hỏi cách đặt resource và chọn route, NAT, connectivity, load balancer, CDN và bandwidth để giảm network cost mà vẫn giữ availability/performance.

## 1. Giải thích cho người mới

Network bill thường xuất hiện khi dữ liệu vượt một ranh giới:

- ra Internet;
- qua AZ;
- qua Region;
- qua NAT Gateway hoặc processing service;
- qua Direct Connect/VPN/Transit Gateway;
- qua CDN/edge.

Muốn tối ưu, vẽ đúng data path và đánh dấu số GB qua từng hop. Chỉ nhìn monthly fee của một thiết bị sẽ bỏ sót data processing/transfer charge.

## 2. Đặt compute gần data

- Application và database chatty nên tránh cross-Region path không cần thiết.
- Cross-AZ có thể có transfer cost nhưng multi-AZ lại cần cho HA; không hy sinh SLA chỉ để tránh phí.
- Batch/analytics nên xử lý gần S3/data source và chỉ chuyển result nhỏ nếu phù hợp.
- Compress, filter và aggregate trước khi transfer khi business cho phép.

## 3. NAT cost

NAT Gateway có hourly và data processing cost theo pricing hiện hành. Các hướng tối ưu tùy architecture:

- VPC endpoints cho S3/DynamoDB và supported services nếu traffic phù hợp;
- tránh route nội bộ AWS qua NAT/Internet không cần thiết;
- cân nhắc NAT per AZ cho resilience so với shared NAT và cross-AZ path;
- xóa NAT không dùng ở dev/test;
- không thay NAT Gateway bằng NAT instance chỉ vì hourly rẻ nếu operational/scale/HA requirement làm TCO cao hơn.

## 4. VPC connectivity topology

### Peering

Point-to-point, không transitive. Mesh nhiều VPC tạo nhiều connections/routes và khó vận hành.

### Transit Gateway

Hub-and-spoke, đơn giản hóa nhiều VPC/on-prem nhưng có attachment/data processing cost. Dùng khi scale topology/operations justify.

### PrivateLink

Expose một service riêng qua endpoint mà không kết nối full networks. Phù hợp producer-consumer service model; có endpoint/hour/data costs.

Chọn theo số VPC, routing scope, transitivity, segmentation và traffic volume.

## 5. Internet, VPN và Direct Connect

| Path | Khi phù hợp |
|---|---|
| Internet/HTTPS | Dễ triển khai, public endpoint chấp nhận được |
| Site-to-Site VPN | Mã hóa, nhanh thiết lập, bandwidth/Internet variability chấp nhận được |
| Direct Connect | Dedicated private connectivity, traffic ổn định/lớn, performance cần thiết |

DX có port/circuit/provider cost nhưng có thể hợp lý cho volume lớn và ổn định. VPN có thể rẻ/nhanh hơn cho volume nhỏ hoặc backup path. Luôn tính redundancy.

## 6. CDN và edge caching

CloudFront có thêm request/distribution cost nhưng có thể giảm origin data transfer, origin compute và latency. Phù hợp nội dung được cache hoặc global delivery. Cache key quá chi tiết làm hit ratio thấp và giảm lợi ích.

Global Accelerator không phải CDN cache; chọn khi network path/static IP/failover benefit đáp ứng workload. Route 53 routing là DNS-level và có cost model khác.

## 7. Load balancer và throttling

- Chọn ALB/NLB/GWLB đúng protocol, đừng chạy nhiều loại không cần.
- Consolidate bằng host/path routing khi isolation/SLA cho phép.
- Cross-zone traffic, target placement và LCU/capacity drivers ảnh hưởng cost.
- API Gateway throttling/usage plan hoặc application rate limit bảo vệ backend khỏi request vượt capacity/cost budget.
- Cache response phù hợp để giảm backend/network calls.

## 8. Scenario điển hình

**Đề A:** Private EC2 tải hàng TB từ S3 qua NAT Gateway mỗi tháng.

**Chọn:** S3 gateway VPC endpoint và route phù hợp; giữ IAM/bucket/endpoint policies. Traffic S3 không cần đi NAT, giảm processing cost và giữ private path.

**Đề B:** 50 VPC full mesh đang tăng nhanh, nhiều on-prem connections, vận hành route quá phức tạp.

**Chọn:** đánh giá Transit Gateway hub-and-spoke; dù có processing cost, tổng architecture/operations có thể tối ưu hơn mesh peering.

## 9. Exam traps

- “Ít hourly fee nhất” không luôn “TCO thấp nhất”.
- Một NAT dùng chung có thể giảm hourly cost nhưng thêm cross-AZ cost và single-AZ dependency.
- VPC endpoint có cost khác nhau theo loại; không mặc định mọi endpoint miễn phí.
- CloudFront có cost nhưng có thể giảm tổng origin/transfer cost.
- Direct Connect không tự mã hóa và có provisioning/port/provider costs.
- Cross-AZ traffic có thể là chi phí cần thiết để đạt HA.
- VPC peering mesh rẻ ở quy mô nhỏ nhưng khó scale vận hành.

## 10. Checklist làm được task

- [ ] Vẽ data path và đánh dấu AZ/Region/Internet/NAT boundaries.
- [ ] Chọn endpoint để tránh NAT path không cần thiết.
- [ ] So peering, Transit Gateway và PrivateLink theo scale/traffic/TCO.
- [ ] So Internet, VPN và DX theo volume, latency, security và duration.
- [ ] Đánh giá CDN bằng cacheability và origin savings.
- [ ] Giữ HA/performance bắt buộc khi tối ưu transfer.

Học sâu: [Cost Optimization](../../06-NGAY-6-COST-MIGRATION-OPS/01-COST-OPTIMIZATION.md), [Hybrid Connectivity](../../04-NGAY-4-NETWORKING/02-CONNECTIVITY-HYBRID.md) và [ELB/Route 53/Edge](../../04-NGAY-4-NETWORKING/03-ELB-ROUTE53-EDGE.md).

Hoàn tất 14 task: chuyển sang [Chiến thuật mock](../../07-NGAY-7-MOCK-REVIEW/01-MOCK-EXAM-STRATEGY.md).
