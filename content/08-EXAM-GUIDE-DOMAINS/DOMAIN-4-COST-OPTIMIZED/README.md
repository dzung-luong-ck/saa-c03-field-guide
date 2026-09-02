# Domain 4 — Design Cost-Optimized Architectures (20%)

Domain 4 kiểm tra cách đạt requirement với **tổng chi phí hợp lý nhất**. “Rẻ nhất” không phải đáp án nếu vi phạm SLA, security, compliance hoặc performance.

## Bốn task

| Task | Cost driver chính | Bài học |
|---|---|---|
| 4.1 Storage | Dung lượng, class/tier, request, retrieval, backup và transfer | [Học Task 4.1](TASK-4.1-STORAGE-COST.md) |
| 4.2 Compute | Thời gian chạy, size, purchasing model và utilization | [Học Task 4.2](TASK-4.2-COMPUTE-COST.md) |
| 4.3 Database | Engine, capacity, storage/I/O, replica, backup và cache | [Học Task 4.3](TASK-4.3-DATABASE-COST.md) |
| 4.4 Network | Data path, cross-AZ/Region, NAT, edge và connectivity | [Học Task 4.4](TASK-4.4-NETWORK-COST.md) |

## Quy trình tối ưu

```text
Biết requirement bắt buộc
→ đo usage/cost hiện tại
→ xác định cost driver lớn nhất
→ bỏ lãng phí/right-size
→ chọn pricing/tiering phù hợp
→ theo dõi sau thay đổi
```

Nguồn phạm vi: [AWS Exam Guide — Domain 4](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html).

Tiếp theo: [Task 4.1 — Storage cost](TASK-4.1-STORAGE-COST.md).
