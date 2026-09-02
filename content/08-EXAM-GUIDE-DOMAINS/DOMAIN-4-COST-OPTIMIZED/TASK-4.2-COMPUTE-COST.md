# Task 4.2 — Design cost-optimized compute solutions

Task này hỏi cách chọn compute model, size, purchasing option và scaling strategy để trả tiền đúng với workload thực tế.

## 1. Giải thích cho người mới

Compute cost thường đến từ hai biến:

```text
Đơn giá capacity × thời gian sử dụng
```

Tối ưu bằng cách giảm capacity thừa, giảm thời gian nhàn rỗi, chọn mô hình mua đúng và chuyển sang managed/serverless khi tổng chi phí vận hành tốt hơn.

## 2. Right-sizing

Đừng chọn instance theo cảm giác. Xem CPU, memory, network, EBS I/O, accelerator và peak pattern.

- CPU cao liên tục: compute family/scale-out.
- Memory cao nhưng CPU thấp: memory family/size phù hợp.
- Dev chỉ dùng giờ hành chính: schedule stop/start.
- Fleet web dao động: Auto Scaling.
- Instance idle: terminate/resize/consolidate.

Rightsizing phải giữ headroom và HA. Giảm fleet từ hai AZ xuống một instance có thể rẻ nhưng vi phạm availability.

## 3. Purchasing options

| Option | Khi phù hợp |
|---|---|
| On-Demand | Nhu cầu ngắn hạn, khó dự đoán, chưa muốn cam kết |
| Savings Plans | Baseline compute ổn định và chấp nhận cam kết sử dụng |
| Reserved Instances | Discount/reservation semantics phù hợp service và requirement |
| Spot | Batch/worker/stateless có checkpoint/retry, chịu interruption |
| Capacity Reservation | Cần bảo đảm capacity trong AZ; không đồng nghĩa tự có discount tốt nhất |

Kết hợp: baseline bằng commitment/On-Demand, burst fault-tolerant bằng Spot.

## 4. Chọn EC2, Lambda hay containers

- Lambda: trả theo request/duration; tốt cho spiky/idle-heavy event workload, nhưng high steady usage cần so TCO.
- Fargate: không quản nodes, task-level capacity; operational saving có thể quan trọng.
- ECS/EKS trên EC2: có thể tối ưu bin packing/commitment nhưng phải quản nodes.
- EC2: linh hoạt và có nhiều pricing option, nhưng trả cho thời gian instance chạy.

“Serverless luôn rẻ hơn” là sai. Đề cho traffic pattern để bạn so fixed baseline với pay-per-use.

## 5. Scaling strategy

- Target tracking giữ capacity theo demand.
- Scheduled scaling tránh chờ phản ứng cho pattern biết trước.
- Predictive scaling hỗ trợ pattern lặp.
- Scale-in có drain/cooldown để không mất work.
- Hibernation có thể phù hợp stateful dev/workstation cần resume nhanh theo feature support; không phải mọi instance/workload.

Chọn metric liên hệ với nhu cầu: backlog per worker tốt hơn CPU cho queue worker I/O-heavy.

## 6. Load balancing và availability tiers

ALB, NLB, GWLB có protocol/function khác nhau; chọn sai làm tăng cost lẫn complexity. Non-production có thể chấp nhận schedule/off hoặc availability thấp hơn, nhưng production SLA có thể cần multi-AZ baseline.

Không nhân bản mọi môi trường giống production nếu business không yêu cầu. Dùng IaC để tạo test environment on demand và xóa sau test.

## 7. Distributed/edge compute

CloudFront Functions/Lambda@Edge hoặc edge processing có thể giảm origin compute/latency cho logic phù hợp, nhưng có execution model và cost riêng. Đừng đẩy business logic phức tạp ra edge nếu requirement không cần.

Outposts/hybrid compute chỉ chọn khi latency, data residency hoặc on-prem integration bắt buộc; không phải phương án tiết kiệm mặc định.

## 8. Scenario điển hình

**Đề:** Web có baseline ổn định 30% capacity, tăng gấp năm trong sự kiện; stateless; batch report chịu gián đoạn.

**Thiết kế:** ASG multi-AZ; commitment phù hợp baseline; On-Demand/Spot mix cho burst theo risk; Spot cho batch với queue/checkpoint; CloudFront cache; target tracking theo ALB request metric.

**Không chọn:** mua commitment cho peak cả năm; chạy fleet peak 24/7; Spot cho database stateful không có resilience plan.

## 9. Exam traps

- Savings Plans/RI là commitment/discount, không tự scale resource.
- Capacity Reservation bảo đảm capacity nhưng không mặc định là discount strategy.
- Spot rẻ nhưng có interruption.
- Lambda ít ops không luôn rẻ hơn steady EC2.
- Tắt một AZ để giảm cost có thể phá HA requirement.
- Smaller instance không tiết kiệm nếu throttling làm chạy job lâu hơn nhiều.

## 10. Checklist làm được task

- [ ] Right-size từ metric thay vì average đơn lẻ.
- [ ] Tách baseline và burst.
- [ ] Chọn On-Demand, commitment, Spot và capacity reservation đúng mục tiêu.
- [ ] So EC2/Lambda/Fargate bằng usage + operations.
- [ ] Chọn scaling metric và schedule phù hợp.
- [ ] Giữ availability bắt buộc trước khi giảm cost.

Học sâu: [Cost Optimization](../../06-NGAY-6-COST-MIGRATION-OPS/01-COST-OPTIMIZATION.md) và [EC2/Auto Scaling](../../05-NGAY-5-COMPUTE-INTEGRATION/01-EC2-AUTO-SCALING.md).

Tiếp theo: [Task 4.3 — Database cost](TASK-4.3-DATABASE-COST.md).
