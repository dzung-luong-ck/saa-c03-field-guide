# Nguồn và cách đối chiếu slide PDF

## Nguồn đã đọc

- `AWS Certified Solutions Architect Slides v48.pdf`
- 876 trang, tạo ngày 15/06/2026.
- Slide của khóa AWS Certified Solutions Architect Associate do Stéphane Maarek biên soạn.

Tài liệu PDF có thông báo bản quyền và giới hạn phân phối. Bộ cheatsheet này chỉ tóm tắt, tái cấu trúc và bổ sung diễn giải phục vụ việc học cá nhân; không sao chép nguyên bộ slide.

## Bản đồ section trong PDF

| Trang | Chủ đề | Được đưa vào folder |
|---:|---|---|
| 14–23 | AWS global infrastructure | Bắt đầu, Resilience |
| 24–40 | IAM cơ bản | Ngày 1 |
| 41–92 | EC2 basics/associate | Ngày 5 |
| 93–117 | EBS, instance store, EFS | Ngày 3 |
| 118–159 | High Availability, ELB, Auto Scaling | Ngày 2 và 5 |
| 160–192 | RDS, Aurora, ElastiCache | Ngày 2 và 3 |
| 193–226 | Route 53 | Ngày 4 |
| 227–266 | Classic solution architectures | Ngày 2 và 7 |
| 267–334 | S3 core, advanced, security | Ngày 1 và 3 |
| 335–349 | CloudFront, Global Accelerator | Ngày 4 |
| 350–374 | Storage extras | Ngày 3 và 6 |
| 375–413 | SQS, SNS, Kinesis, MQ | Ngày 2 và 5 |
| 414–437 | Containers | Ngày 5 |
| 438–512 | Serverless + architecture patterns | Ngày 5 và 7 |
| 513–559 | Databases, data, analytics | Ngày 3 và 5 |
| 560–574 | Machine learning recognition | Ngày 5 |
| 575–618 | Monitoring, audit, performance | Ngày 6 |
| 619–647 | Advanced identity | Ngày 1 |
| 648–696 | Security and encryption | Ngày 1 |
| 697–774 | VPC | Ngày 4 |
| 775–801 | DR and migrations | Ngày 2 và 6 |
| 802–823 | More architecture patterns | Ngày 7 |
| 824–851 | Other services | Ngày 5 và 6 |
| 852–858 | Well-Architected Framework | Xuyên suốt |
| 859–874 | Exam review and tips | Ngày 7 |

## Quy tắc ưu tiên nguồn

1. Exam scope/trọng số/format: AWS Exam Guide và trang Certification chính thức.
2. Service behavior hiện hành: AWS service documentation.
3. Pattern và cách diễn giải: slide PDF + AWS Well-Architected/Decision Guides.
4. Practice questions: chỉ dùng để phát hiện lỗ hổng, không dùng làm nguồn sự thật khi mâu thuẫn docs.

## Các điểm trong slide không nên học thuộc máy móc

Một số con số trong slide phản ánh thời điểm biên soạn hoặc mode mặc định cũ. Ví dụ:

- Giới hạn IOPS/throughput của EBS `gp3` đã thay đổi theo tài liệu EBS hiện hành.
- SQS FIFO có high-throughput mode; không dùng duy nhất con số throughput cũ để loại đáp án.
- KMS automatic rotation có tùy chọn/chu kỳ hiện hành cần xem tài liệu mới, không chỉ nhớ “mỗi năm”.
- Số lượng AZ, edge locations, quotas và pricing thay đổi thường xuyên.
- Tên một số dịch vụ có thể được AWS đổi hoặc rút gọn trên đề.

Do đó, cheatsheet ưu tiên câu “dùng khi nào” và “trade-off gì”. Con số chỉ được đưa vào khi ổn định và hữu ích cho lựa chọn kiến trúc.

## Diagram được dùng để tăng độ chi tiết

Các sơ đồ trong slide giúp củng cố những luồng sau:

- Route 53 → ELB → ASG multi-AZ.
- RDS primary/standby và Aurora reader/writer endpoints.
- SNS → nhiều SQS queues cho fan-out bền vững.
- Lambda → RDS Proxy → private RDS.
- API Gateway endpoint types và serverless mobile architecture.
- Gateway endpoint vs interface endpoint cho S3.
- DMS full load + CDC và schema conversion.
- Pilot light, warm standby và multi-site DR.

Trong các file chi tiết, những sơ đồ này được chuyển thành flow dạng text và scenario reasoning để dễ ôn hơn.

## Nguồn chính thức đi kèm

- [SAA-C03 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html)
- [AWS Decision Guides](https://docs.aws.amazon.com/decision-guides/)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
- [SQS queue types](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-types.html)
- [KMS key rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotating-keys.html)
