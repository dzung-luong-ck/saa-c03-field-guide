# SAA-C03 theo Exam Guide — 14 task cần làm được

Phần này sắp xếp kiến thức đúng theo **4 domain và 14 task statement** của AWS Exam Guide. Mỗi task là một năng lực thiết kế mà đề thi muốn kiểm tra, không phải một danh sách dịch vụ cần học thuộc.

> **Nếu bạn hoàn toàn mới:** đọc [AWS từ số 0](../00-BAT-DAU/00-AWS-CHO-NGUOI-MOI.md) trước. Sau đó quay lại đây và học Task 1.1 → 4.4. Khi một task nhắc tới dịch vụ lạ, mở bài chuyên sâu được liên kết trong task đó.

## Bài nghe theo domain

Mỗi trang tổng quan domain có một bài nghe tiếng Việt và nút tải MP3 để ôn khi không tiện đọc:

- [Nghe Domain 1 — Secure Architectures](DOMAIN-1-SECURE/README.md)
- [Nghe Domain 2 — Resilient Architectures](DOMAIN-2-RESILIENT/README.md)
- [Nghe Domain 3 — High-Performing Architectures](DOMAIN-3-HIGH-PERFORMING/README.md)
- [Nghe Domain 4 — Cost-Optimized Architectures](DOMAIN-4-COST-OPTIMIZED/README.md)

## 1. Bản đồ chính thức

| Domain | Trọng số | Số task | Câu hỏi trung tâm |
|---|---:|---:|---|
| Domain 1 — Design Secure Architectures | 30% | 3 | Ai được truy cập gì, application và data được bảo vệ thế nào? |
| Domain 2 — Design Resilient Architectures | 26% | 2 | Hệ thống scale, tách rời và tiếp tục phục vụ khi có lỗi thế nào? |
| Domain 3 — Design High-Performing Architectures | 24% | 5 | Chọn storage, compute, database, network và data pipeline đạt hiệu năng ra sao? |
| Domain 4 — Design Cost-Optimized Architectures | 20% | 4 | Đạt requirement với tổng chi phí hợp lý nhất bằng cách nào? |

Nguồn chuẩn: [AWS SAA-C03 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html).

## 2. Domain 1 — Design Secure Architectures

1. [Task 1.1 — Design secure access to AWS resources](DOMAIN-1-SECURE/TASK-1.1-SECURE-ACCESS.md)
2. [Task 1.2 — Design secure workloads and applications](DOMAIN-1-SECURE/TASK-1.2-SECURE-WORKLOADS.md)
3. [Task 1.3 — Determine appropriate data security controls](DOMAIN-1-SECURE/TASK-1.3-DATA-SECURITY.md)

Kết thúc domain, bạn phải giải thích được IAM policy evaluation, multi-account guardrail, network segmentation, secrets, encryption và data protection.

## 3. Domain 2 — Design Resilient Architectures

1. [Task 2.1 — Design scalable and loosely coupled architectures](DOMAIN-2-RESILIENT/TASK-2.1-SCALABLE-LOOSELY-COUPLED.md)
2. [Task 2.2 — Design highly available and/or fault-tolerant architectures](DOMAIN-2-RESILIENT/TASK-2.2-HA-FAULT-TOLERANT.md)

Kết thúc domain, bạn phải phân biệt scale với HA, sync với async, Multi-AZ với multi-Region và chọn DR strategy từ RPO/RTO.

## 4. Domain 3 — Design High-Performing Architectures

1. [Task 3.1 — Storage hiệu năng cao và có thể scale](DOMAIN-3-HIGH-PERFORMING/TASK-3.1-STORAGE.md)
2. [Task 3.2 — Compute hiệu năng cao và elastic](DOMAIN-3-HIGH-PERFORMING/TASK-3.2-COMPUTE.md)
3. [Task 3.3 — Database hiệu năng cao](DOMAIN-3-HIGH-PERFORMING/TASK-3.3-DATABASE.md)
4. [Task 3.4 — Network hiệu năng cao và có thể scale](DOMAIN-3-HIGH-PERFORMING/TASK-3.4-NETWORK.md)
5. [Task 3.5 — Data ingestion và transformation hiệu năng cao](DOMAIN-3-HIGH-PERFORMING/TASK-3.5-DATA-INGESTION.md)

Kết thúc domain, bạn phải chọn theo access pattern và bottleneck đo được, thay vì chọn dịch vụ nổi tiếng nhất.

## 5. Domain 4 — Design Cost-Optimized Architectures

1. [Task 4.1 — Storage tối ưu chi phí](DOMAIN-4-COST-OPTIMIZED/TASK-4.1-STORAGE-COST.md)
2. [Task 4.2 — Compute tối ưu chi phí](DOMAIN-4-COST-OPTIMIZED/TASK-4.2-COMPUTE-COST.md)
3. [Task 4.3 — Database tối ưu chi phí](DOMAIN-4-COST-OPTIMIZED/TASK-4.3-DATABASE-COST.md)
4. [Task 4.4 — Network tối ưu chi phí](DOMAIN-4-COST-OPTIMIZED/TASK-4.4-NETWORK-COST.md)

Kết thúc domain, bạn phải biết cost driver của từng lớp và chỉ tối ưu sau khi đã giữ đủ security, resilience và performance bắt buộc.

## 6. Cách học một task cho người mới

Mỗi task dùng cùng một quy trình:

```text
1. Hiểu task đang yêu cầu quyết định gì
2. Học các khái niệm nền
3. Gắn requirement với service/pattern
4. Theo dấu một scenario từ đầu đến cuối
5. Loại exam traps
6. Tự trả lời checklist không nhìn tài liệu
```

Đừng đánh dấu “đã học” chỉ vì đã đọc. Chỉ đánh dấu khi bạn có thể giải thích:

- requirement nào quyết định đáp án;
- vì sao đáp án đúng phù hợp;
- vì sao ít nhất hai distractor sai;
- trade-off của lựa chọn.

## 7. Phân bổ trong 7 ngày

| Ngày | Task chính | Ôn bổ sung |
|---|---|---|
| 1 | Task 1.1–1.3 | IAM, KMS, network security |
| 2 | Task 2.1–2.2 | Messaging, Multi-AZ, DR |
| 3 | Task 3.1 và 3.3 | Storage, database, cache |
| 4 | Task 3.4 | VPC, hybrid, edge, ELB |
| 5 | Task 3.2 và 3.5 | Compute, containers, analytics |
| 6 | Task 4.1–4.4 | Cost drivers và migration |
| 7 | Trộn cả 14 task | Mock, error log, active recall |

Tiếp theo: [Domain 1 — Design Secure Architectures](DOMAIN-1-SECURE/README.md).
