# Lộ trình SAA-C03 trong đúng 7 ngày

## Phân bổ thời gian

Lộ trình chuẩn cần 4–5 giờ mỗi ngày. Nếu chỉ có 2–3 giờ, giữ nguyên thứ tự nhưng giảm lab và số câu practice; không bỏ phần xem lại lỗi sai.

| Khối | Thời lượng chuẩn | Mục đích |
|---|---:|---|
| Học lý thuyết | 90 phút | Hiểu service boundaries và patterns |
| Tự vẽ/tóm tắt | 30 phút | Chuyển từ đọc thụ động sang recall |
| Câu hỏi timed | 90–120 phút | Rèn quyết định dưới áp lực thời gian |
| Review lỗi | 45–60 phút | Biến lỗi thành rule có thể dùng lại |
| Cram/flashcards | 20 phút | Spaced repetition kiến thức ngày trước |

## Ngày 1 — Security

Đọc:

- IAM, policy evaluation, roles và federation.
- Organizations, OU, SCP, Control Tower và RAM.
- KMS, secrets, certificate, encryption at rest/in transit.
- WAF, Shield, GuardDuty, Inspector, Macie, Security Hub.

Đầu ra:

- Viết lại logic IAM bằng 5 dòng mà không nhìn tài liệu.
- Lập bảng “detect vs protect vs investigate”.
- Làm 40–60 câu Security.

## Ngày 2 — Resilience

Đọc:

- Region/AZ, HA, fault tolerance, scalability, elasticity.
- ELB + Auto Scaling; stateless design.
- RDS/Aurora/DynamoDB resilience.
- RPO/RTO và bốn chiến lược DR.
- SQS/SNS/EventBridge cho loose coupling.

Đầu ra:

- Vẽ 3-tier application chạy ở ít nhất hai AZ.
- Xếp bốn DR strategies theo cost và recovery speed.
- Làm 40–60 câu Resilience.

## Ngày 3 — Storage và Database

Đọc:

- S3 storage classes, lifecycle, versioning, replication, security.
- EBS, instance store, EFS và các loại FSx.
- RDS, Aurora, DynamoDB và purpose-built databases.
- Caching tại edge/app/database.

Đầu ra:

- Tự dựng ba bảng: object/block/file, relational/NoSQL, cache options.
- Làm 50 câu storage/database.

## Ngày 4 — Networking

Đọc:

- VPC CIDR, subnet, route table, IGW, NAT, IPv6.
- Security Group và NACL.
- VPC endpoints, peering, Transit Gateway, PrivateLink.
- VPN, Direct Connect, hybrid DNS.
- ALB/NLB/GWLB, Route 53, CloudFront, Global Accelerator.

Đầu ra:

- Vẽ chính xác đường đi từ private EC2 tới internet và tới S3.
- Làm 50 câu networking.

## Ngày 5 — Compute và Integration

Đọc:

- EC2 instance families, placement groups, AMI, storage và scaling.
- Lambda, ECS/EKS, Fargate, Batch, Elastic Beanstalk.
- SQS/SNS/EventBridge, Step Functions, Kinesis, Firehose, MSK/MQ.
- Athena, Glue, EMR, Redshift, OpenSearch.

Đầu ra:

- Tạo flowchart chọn EC2/Lambda/Fargate.
- Làm 50 câu compute/integration/performance.

## Ngày 6 — Cost, Migration và Operations

Đọc:

- On-Demand, Spot, Savings Plans, Reserved Instances, Capacity Reservation.
- Tối ưu cost compute/storage/database/network.
- MGN, DMS, DataSync, Storage Gateway, Snow Family, Transfer Family.
- CloudWatch, CloudTrail, Config, X-Ray, Systems Manager, CloudFormation.

Đầu ra:

- Làm mock 1: 65 câu/130 phút.
- Phân loại mọi câu sai theo error type, không chỉ xem đáp án.

## Ngày 7 — Mock và review

- Làm mock 2 trong điều kiện giống thi thật.
- Chỉ vá ba lỗ hổng có tác động lớn nhất.
- Đọc confusion matrix, architecture recipes, active recall và cram sheet.
- Dừng học kiến thức mới trước giờ ngủ.

## Quy tắc cắt giảm khi thiếu thời gian

Không cắt:

- IAM/KMS/security services.
- RDS/Aurora/DynamoDB.
- S3/EBS/EFS.
- VPC/ELB/Route 53/CloudFront.
- SQS/SNS/EventBridge.
- Pricing models và DR.

Có thể giảm thời gian:

- Machine learning service recognition.
- Media services.
- Các quotas hiếm và thao tác console.
- Tính năng mới không xuất hiện trong blueprint hoặc practice questions chất lượng.

Tiếp theo: [Chiến thuật làm bài](CHIEN-THUAT-LAM-BAI.md).
