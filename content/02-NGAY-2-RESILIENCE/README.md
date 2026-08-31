# Ngày 2 — Design Resilient Architectures

Resilience chiếm 26% phần tính điểm. Hôm nay tập trung vào cách một hệ thống **chịu lỗi thành phần**, **tự phục hồi**, **scale theo tải** và **khôi phục sau thảm họa**.

## Thứ tự học

1. [High Availability và Auto Scaling](01-HA-AUTO-SCALING.md) — 60 phút.
2. [Database Resilience](02-DATABASE-RESILIENCE.md) — 60 phút.
3. [Disaster Recovery](03-DISASTER-RECOVERY.md) — 50 phút.
4. [Decoupling và Messaging](04-DECOUPLING-MESSAGING.md) — 50 phút.
5. 40–60 practice questions — 90 phút.

## Checklist cuối ngày

- [ ] Phân biệt HA, fault tolerance, scalability và elasticity.
- [ ] Vẽ được ALB + ASG chạy ít nhất hai AZ.
- [ ] Biết target tracking, step, scheduled và predictive scaling.
- [ ] Phân biệt RDS Multi-AZ instance, Multi-AZ cluster và read replica.
- [ ] Phân biệt Aurora Replica và Aurora Global Database.
- [ ] Xếp DR từ Backup/Restore đến Active/Active theo cost và RTO/RPO.
- [ ] Thiết kế SQS queue với visibility timeout, DLQ và idempotent consumer.
- [ ] Phân biệt queue, pub/sub, event bus, stream và workflow.

## Liên hệ slide PDF

- High Availability & Scalability: trang 118–159.
- RDS, Aurora & ElastiCache: trang 160–192.
- Classic Solutions Architecture: trang 227–266.
- Integration & Messaging: trang 375–413.
- Disaster Recovery & Migrations: trang 775–801.
- More Solutions Architecture: trang 802–823.

Tiếp theo: [HA và Auto Scaling](01-HA-AUTO-SCALING.md).
