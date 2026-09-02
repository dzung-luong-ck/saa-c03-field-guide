# Domain 3 — Design High-Performing Architectures (24%)

Domain 3 kiểm tra khả năng chọn giải pháp đạt **latency, throughput, IOPS, concurrency và scale** cần thiết. Không có một dịch vụ “nhanh nhất” cho mọi workload; đáp án phụ thuộc access pattern và bottleneck.

## Năm task

| Task | Quyết định chính | Bài học |
|---|---|---|
| 3.1 Storage | Object, block, file hay hybrid; cần IOPS/throughput nào? | [Học Task 3.1](TASK-3.1-STORAGE.md) |
| 3.2 Compute | EC2, container, Lambda hay batch; scale theo metric nào? | [Học Task 3.2](TASK-3.2-COMPUTE.md) |
| 3.3 Database | Relational, NoSQL, cache, replica hay proxy? | [Học Task 3.3](TASK-3.3-DATABASE.md) |
| 3.4 Network | Topology, load balancer, edge và connectivity nào? | [Học Task 3.4](TASK-3.4-NETWORK.md) |
| 3.5 Data ingestion | Batch, stream, transfer và transform bằng gì? | [Học Task 3.5](TASK-3.5-DATA-INGESTION.md) |

## Mental model hiệu năng

```text
Đo symptom → tìm bottleneck → chọn đúng lớp → scale/optimize → đo lại
```

CPU cao không luôn nghĩa cần EC2 lớn hơn: có thể app đang chờ I/O, database thiếu index, connection pool cạn hoặc request đáng lẽ được cache.

Nguồn phạm vi: [AWS Exam Guide — Domain 3](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain3.html).

Tiếp theo: [Task 3.1 — Storage](TASK-3.1-STORAGE.md).
