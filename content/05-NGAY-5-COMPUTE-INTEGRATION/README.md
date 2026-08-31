# Ngày 5 — Compute, serverless, container và data integration

## Mục tiêu

Sau ngày 5, bạn phải chọn được compute model phù hợp và ghép đúng dịch vụ integration/analytics, thay vì chỉ nhớ tên dịch vụ.

## Lịch học đề xuất: 6–7 giờ

1. 90 phút: [EC2 và Auto Scaling](./01-EC2-AUTO-SCALING.md).
2. 100 phút: [Lambda và containers](./02-LAMBDA-CONTAINERS.md).
3. 120 phút: [Integration và analytics](./03-INTEGRATION-ANALYTICS.md).
4. 20 phút: [Service radar](./04-IN-SCOPE-SERVICE-RADAR.md) cho dịch vụ ít gặp.
5. 45 phút: vẽ lại 5 kiến trúc trong ngày bằng giấy.
6. 60 phút: làm 35–50 câu theo chủ đề và ghi error log.

## Trọng tâm

- EC2 cho quyền kiểm soát OS; Lambda tối thiểu vận hành; ECS/EKS cho container; Fargate bỏ quản lý worker node.
- Event-driven không đồng nghĩa mọi luồng đều dùng SQS: phân biệt queue, pub/sub, event bus và workflow.
- Phân biệt stream ingestion, delivery stream, ETL, query data lake, warehouse và search.
- Chọn dịch vụ theo ràng buộc câu hỏi: thời gian chạy, giao thức, portability, ops, ordering, fan-out, latency.

## Đối chiếu slide PDF

- EC2 và ELB/ASG: khoảng trang 41–92, 118–159.
- Messaging/integration: khoảng trang 375–413.
- Containers: khoảng trang 414–437.
- Serverless: khoảng trang 438–512.
- Database/analytics/ML: khoảng trang 513–574.

Slide là nguồn củng cố sơ đồ và keyword. Với quota, giới hạn và tính năng thay đổi theo thời gian, dùng liên kết AWS cuối từng bài làm nguồn quyết định.

## Definition of done

- Giải thích được vì sao một workload cần EC2, Lambda, ECS/Fargate hay EKS.
- Phân biệt execution role và task role của ECS.
- Phân biệt SQS, SNS, EventBridge, Step Functions, Kinesis Data Streams và Firehose.
- Biết Athena, Glue, EMR, Redshift, OpenSearch giải loại bài toán nào.
- Nhận diện một dòng các dịch vụ in-scope ít xuất hiện mà không sa đà cấu hình.
- Hoàn thành error log, không chỉ ghi điểm số.
