# Domain 2 — Design Resilient Architectures (26%)

Domain 2 kiểm tra hai năng lực lớn: thiết kế thành phần **scale độc lập và ít phụ thuộc**, sau đó bảo đảm hệ thống **chịu lỗi đúng failure domain**.

## Hai task

| Task | Câu hỏi trung tâm | Bài học |
|---|---|---|
| 2.1 Scalable & loosely coupled | Làm sao hấp thụ spike và cho từng thành phần scale riêng? | [Học Task 2.1](TASK-2.1-SCALABLE-LOOSELY-COUPLED.md) |
| 2.2 Highly available/fault tolerant | Làm sao tiếp tục phục vụ khi instance, AZ hoặc Region lỗi? | [Học Task 2.2](TASK-2.2-HA-FAULT-TOLERANT.md) |

## Hai trục không được nhầm

```text
Traffic tăng → scalability / elasticity / decoupling
Thành phần hỏng → redundancy / failover / recovery
```

Một hệ thống scale tốt vẫn có thể có single point of failure. Một hệ thống có backup vẫn có thể downtime lâu. Luôn xác định đề đang nói về tải hay lỗi, rồi mới chọn pattern.

Nguồn phạm vi: [AWS Exam Guide — Domain 2](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain2.html).

Tiếp theo: [Task 2.1 — Scalable and loosely coupled](TASK-2.1-SCALABLE-LOOSELY-COUPLED.md).
