# Domain 1 — Design Secure Architectures (30%)

Domain 1 kiểm tra khả năng bảo vệ **access**, **workload/application** và **data**. Với người mới, hãy luôn tách ba lớp này: IAM đúng không thay thế network security; network kín không thay thế encryption; encryption không tự quyết định ai được truy cập.

## Ba task

| Task | Bạn phải quyết định được | Bài học |
|---|---|---|
| 1.1 Secure access | Identity nào, quyền nào, account nào và guardrail nào | [Học Task 1.1](TASK-1.1-SECURE-ACCESS.md) |
| 1.2 Secure workloads | Network path, secret, endpoint và protection service nào | [Học Task 1.2](TASK-1.2-SECURE-WORKLOADS.md) |
| 1.3 Data security controls | Mã hóa, key, access, backup, retention và classification nào | [Học Task 1.3](TASK-1.3-DATA-SECURITY.md) |

## Mental model chung

```text
Identity: ai đang gọi?
  ↓
Authorization: được phép action nào trên resource nào?
  ↓
Network: request có đường đi và được firewall cho qua không?
  ↓
Data: dữ liệu được mã hóa, phân loại, giữ và phục hồi ra sao?
  ↓
Detection: làm sao biết có hành vi bất thường?
```

Nguồn phạm vi: [AWS Exam Guide — Domain 1](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html).

Tiếp theo: [Task 1.1 — Secure access](TASK-1.1-SECURE-ACCESS.md).
