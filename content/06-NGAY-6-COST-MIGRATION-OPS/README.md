# Ngày 6 — Cost, migration và operations

## Mục tiêu

Ngày 6 biến kiến thức dịch vụ thành quyết định kiến trúc: đáp ứng yêu cầu nhưng ít tốn tiền/vận hành nhất, chọn đúng đường di chuyển dữ liệu và quan sát được hệ thống.

## Lịch học: 6–7 giờ

1. 110 phút: [Cost optimization](./01-COST-OPTIMIZATION.md).
2. 100 phút: [Migration và transfer](./02-MIGRATION-TRANSFER.md).
3. 100 phút: [Observability và governance](./03-OBSERVABILITY-GOVERNANCE.md).
4. 60 phút: làm 40–50 câu mixed-domain.
5. 45 phút: gom error log thành confusion list cho ngày 7.

## PDF slide dùng để củng cố

- Monitoring/audit: khoảng trang 575–618.
- Security/governance liên quan: khoảng trang 619–696.
- Disaster recovery/migration: khoảng trang 775–801.
- Well-Architected và exam tips: khoảng trang 852–874.

## Mental model

Mỗi câu cost/migration/ops nên trả lời theo chuỗi:

1. Workload thực sự yêu cầu gì về availability, durability, latency, RPO/RTO và compliance?
2. Dịch vụ managed/serverless nào loại bỏ undifferentiated work?
3. Data movement có đi qua Internet, private link, appliance vật lý hay online agent?
4. Metric, log, audit event và config history nào chứng minh hệ thống hoạt động đúng?
5. Có thể giảm compute idle, storage tier, data transfer hoặc license không?

## Definition of done

- Không nhầm Savings Plans với capacity reservation.
- Phân biệt DataSync, DMS, MGN, Snow Family, Storage Gateway và Transfer Family.
- Phân biệt CloudWatch, CloudTrail, Config và X-Ray.
- Biết CloudFormation/StackSets, Organizations/SCP, Control Tower, Service Catalog giải vấn đề nào.

