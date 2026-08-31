# SAA-C03 — Bộ cheatsheet chi tiết theo lộ trình 7 ngày

Bộ tài liệu này được tổ chức để học tuần tự trong đúng một tuần. Mỗi ngày có một folder riêng, bên trong gồm phần lý thuyết, bảng quyết định, tình huống đề thi và câu hỏi tự kiểm tra.

> Điểm bắt đầu: [Lộ trình 7 ngày](00-BAT-DAU/LO-TRINH-7-NGAY.md)  
> Bản tra cứu gọn: [Cheatsheet tổng hợp](SAA-C03-CHEATSHEET-7-NGAY.md)

## Cấu trúc

```text
saa-learn/
├── 00-BAT-DAU/
│   ├── README.md
│   ├── LO-TRINH-7-NGAY.md
│   ├── CHIEN-THUAT-LAM-BAI.md
│   └── NGUON-VA-CACH-DOI-CHIEU.md
├── 01-NGAY-1-SECURITY/
│   ├── README.md
│   ├── 01-IAM-ORGANIZATIONS.md
│   ├── 02-ENCRYPTION-DATA-SECURITY.md
│   ├── 03-APPLICATION-NETWORK-SECURITY.md
│   └── 04-CAU-HOI-TU-KIEM-TRA.md
├── 02-NGAY-2-RESILIENCE/
│   ├── README.md
│   ├── 01-HA-AUTO-SCALING.md
│   ├── 02-DATABASE-RESILIENCE.md
│   ├── 03-DISASTER-RECOVERY.md
│   └── 04-DECOUPLING-MESSAGING.md
├── 03-NGAY-3-STORAGE-DATABASE/
│   ├── README.md
│   ├── 01-S3.md
│   ├── 02-EBS-EFS-FSX.md
│   ├── 03-DATABASES.md
│   └── 04-CACHING-DATA-PATTERNS.md
├── 04-NGAY-4-NETWORKING/
│   ├── README.md
│   ├── 01-VPC-FOUNDATIONS.md
│   ├── 02-CONNECTIVITY-HYBRID.md
│   └── 03-ELB-ROUTE53-EDGE.md
├── 05-NGAY-5-COMPUTE-INTEGRATION/
│   ├── README.md
│   ├── 01-EC2-AUTO-SCALING.md
│   ├── 02-LAMBDA-CONTAINERS.md
│   ├── 03-INTEGRATION-ANALYTICS.md
│   └── 04-IN-SCOPE-SERVICE-RADAR.md
├── 06-NGAY-6-COST-MIGRATION-OPS/
│   ├── README.md
│   ├── 01-COST-OPTIMIZATION.md
│   ├── 02-MIGRATION-TRANSFER.md
│   └── 03-OBSERVABILITY-GOVERNANCE.md
└── 07-NGAY-7-MOCK-REVIEW/
    ├── README.md
    ├── 01-MOCK-EXAM-STRATEGY.md
    ├── 02-CONFUSION-MATRIX.md
    ├── 03-ARCHITECTURE-RECIPES.md
    ├── 04-ACTIVE-RECALL.md
    └── 05-CRAM-SHEET.md
```

## Thứ tự học

| Ngày | Folder | Mục tiêu |
|---|---|---|
| 1 | [Security](01-NGAY-1-SECURITY/README.md) | IAM, multi-account, encryption, protection services |
| 2 | [Resilience](02-NGAY-2-RESILIENCE/README.md) | Multi-AZ, scaling, database HA, DR, decoupling |
| 3 | [Storage & Database](03-NGAY-3-STORAGE-DATABASE/README.md) | S3, EBS/EFS/FSx, RDS/Aurora/DynamoDB, cache |
| 4 | [Networking](04-NGAY-4-NETWORKING/README.md) | VPC, endpoints, hybrid, ELB, Route 53, CloudFront |
| 5 | [Compute & Integration](05-NGAY-5-COMPUTE-INTEGRATION/README.md) | EC2, Lambda, containers, messaging, analytics |
| 6 | [Cost, Migration & Ops](06-NGAY-6-COST-MIGRATION-OPS/README.md) | Pricing, cost levers, migration, monitoring, governance |
| 7 | [Mock & Review](07-NGAY-7-MOCK-REVIEW/README.md) | Mock exam, lỗi sai, architecture recipes, cram sheet |

## Quy ước trong tài liệu

- **Chọn khi**: dấu hiệu trực tiếp để chọn dịch vụ.
- **Không chọn khi**: giới hạn hoặc bẫy thường gặp.
- **Từ khóa đề**: cụm từ nên kích hoạt phản xạ.
- **Scenario**: cách đi từ yêu cầu đến đáp án.
- **Exam trap**: đáp án nghe hợp lý nhưng không tối ưu theo đề.

## Blueprint dùng để sắp xếp nội dung

| Domain | Trọng số |
|---|---:|
| Design Secure Architectures | 30% |
| Design Resilient Architectures | 26% |
| Design High-Performing Architectures | 24% |
| Design Cost-Optimized Architectures | 20% |

Nguồn nền: [AWS SAA-C03 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html).

## Cách cập nhật bộ tài liệu

AWS có thể thay đổi quota, pricing, tên dịch vụ và tính năng. Khi gặp con số mới trong một practice test, kiểm tra lại tài liệu chính thức trước khi ghi nhớ. Ưu tiên nắm access pattern và trade-off; chỉ học thuộc con số khi nó thực sự quyết định đáp án.
