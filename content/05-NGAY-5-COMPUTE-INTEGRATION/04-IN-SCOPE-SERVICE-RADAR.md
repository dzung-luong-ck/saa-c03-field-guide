# Service radar — dịch vụ in-scope ít gặp

Nguồn kiểm tra là danh sách **In-Scope AWS Services** hiện hành. Chỉ dành 15–20 phút cho file này: mục tiêu là nhận diện use case, không học cấu hình sâu.

## Analytics và application integration

| Dịch vụ | Nhận diện một dòng |
|---|---|
| AWS Data Exchange | Tìm, subscribe và dùng third-party datasets trên AWS |
| Amazon AppFlow | Managed data flow giữa SaaS như Salesforce và AWS services |
| AWS AppSync | Managed GraphQL API, subscription real-time và offline/data sync patterns |
| Amazon Quick | BI/AI workspace; Quick Sight là phần visualization, dashboard và SPICE |
| Amazon MSK | Managed Apache Kafka |
| Amazon MQ | Managed ActiveMQ/RabbitMQ cho app/protocol tương thích |

## Compute, edge và hybrid

| Dịch vụ | Nhận diện một dòng |
|---|---|
| AWS Outposts | AWS infrastructure/services tại on-prem cho low latency, residency và hybrid consistency |
| AWS Wavelength | AWS compute/storage tại 5G/telco edge cho ultra-low-latency mobile apps |
| ECS Anywhere | ECS control plane quản container workload trên external/on-prem instances |
| EKS Anywhere | Kubernetes distribution/deployment lifecycle on-prem do khách hàng vận hành |
| EKS Distro | Open-source Kubernetes distribution dùng bởi EKS, để tự dựng môi trường tương thích |
| Serverless Application Repository | Khám phá/deploy serverless apps/components được publish |
| VMware Cloud on AWS | Chạy VMware SDDC trên AWS cho migration/hybrid VMware use case |

Outposts không phải một Region mới và vẫn cần thiết kế connectivity/control-plane dependency. Wavelength không thay CloudFront cho content caching.

## Front-end, mobile và media

| Dịch vụ | Nhận diện một dòng |
|---|---|
| AWS Amplify | Tooling/hosting và workflow cho frontend web/mobile tích hợp AWS backend |
| AWS Device Farm | Test mobile/web app trên thiết bị/browser thật được managed |
| Amazon Kinesis Video Streams | Ingest, lưu và xử lý video streams từ camera/device |
| Amazon Elastic Transcoder | Managed media transcoding legacy; nhận diện khi scenario/app cũ nêu rõ |

## Machine learning

| Dịch vụ | Nhận diện một dòng |
|---|---|
| Amazon SageMaker AI | Build, train, tune và deploy ML model tùy chỉnh |
| Amazon Comprehend | NLP: entity, key phrase, sentiment, classification |
| Amazon Kendra | Enterprise intelligent search trên document/content sources |
| Amazon Lex | Conversational bot với intent/slot, text/voice |
| Amazon Polly | Text-to-speech |
| Amazon Rekognition | Image/video labels, face, moderation, text detection |
| Amazon Textract | OCR và trích form/table/document structure |
| Amazon Transcribe | Speech-to-text |
| Amazon Translate | Machine translation |

Mẹo: nếu đề yêu cầu model tùy chỉnh và lifecycle ML → SageMaker AI; nếu yêu cầu API AI đóng gói sẵn → chọn service chuyên dụng.

## Management và governance

| Dịch vụ | Nhận diện một dòng |
|---|---|
| AWS License Manager | Theo dõi và kiểm soát software license/BYOL usage |
| Amazon Managed Grafana | Managed Grafana visualization/dashboard cho nhiều data sources |
| Amazon Managed Service for Prometheus | Prometheus-compatible managed metrics ingestion/query |
| AWS Well-Architected Tool | Review workload theo pillars và theo dõi improvement plan |
| AWS Service Catalog | Portfolio sản phẩm/hạ tầng đã duyệt để self-service có kiểm soát |
| AWS Resource Access Manager | Chia sẻ resource được hỗ trợ giữa account/Organizations |

## Security ít gặp

| Dịch vụ | Nhận diện một dòng |
|---|---|
| Amazon Detective | Điều tra và liên kết activity quanh security finding |
| AWS Directory Service | Managed Microsoft AD/AD Connector/Simple AD theo directory integration need |
| AWS Firewall Manager | Central policy cho WAF, Shield Advanced, security groups và firewall resources đa account |
| AWS Audit Manager | Thu thập evidence và map controls cho audit framework |
| AWS Artifact | Tải AWS compliance reports và quản một số agreements |

## Câu hỏi nhận diện

1. Salesforce data sang S3 không tự dựng connector? → AppFlow.
2. Managed GraphQL cho mobile real-time? → AppSync.
3. AWS hardware/services tại data center? → Outposts.
4. Workload ở 5G edge? → Wavelength.
5. Test app trên thiết bị thật? → Device Farm.
6. Enterprise document search? → Kendra.
7. Prometheus managed? → Amazon Managed Service for Prometheus.
8. Enforce WAF policy qua nhiều account? → Firewall Manager.
9. Compliance report của AWS? → Artifact.
10. Evidence cho audit framework? → Audit Manager.

## Nguồn AWS

- [SAA-C03 in-scope services](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-in-scope-services.html)
