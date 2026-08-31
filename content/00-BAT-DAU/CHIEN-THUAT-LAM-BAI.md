# Chiến thuật phân tích câu hỏi SAA-C03

## 1. Công thức đọc câu hỏi

Tách mỗi stem thành bốn thành phần:

```text
Current architecture
→ Problem or change
→ Hard constraints
→ Optimization objective
```

Ví dụ:

```text
EC2 web servers ghi task trực tiếp vào RDS
→ traffic spike làm request timeout
→ không được mất task, xử lý async được
→ least operational overhead
```

Suy luận:

1. Không được mất task → cần durable buffer.
2. Async được → không cần xử lý trong request path.
3. Ít vận hành → managed queue.
4. Đáp án: SQS giữa producer và scalable consumers; DLQ cho poison messages.

## 2. Hard constraint thắng preference

| Cụm từ | Ý nghĩa |
|---|---|
| must, required | Ràng buộc bắt buộc; đáp án vi phạm bị loại ngay |
| no code changes | Ưu tiên compatibility/lift-and-shift, managed adapter/gateway |
| exact ordering | FIFO hoặc stream partitioning đúng thiết kế |
| RPO/RTO cụ thể | Chọn replication/DR strategy đáp ứng con số |
| least operational overhead | Managed/serverless nếu vẫn thỏa các ràng buộc khác |
| most cost-effective | Tổng cost thấp nhất trong nhóm vẫn đạt SLA |
| highest performance/lowest latency | Performance được ưu tiên hơn cost nếu đề nói rõ |

## 3. Thứ tự loại đáp án

1. Sai loại dữ liệu/protocol: S3 không thay shared POSIX file system; EBS không phải multi-AZ shared file mặc định.
2. Không đạt durability/HA/security.
3. Không đạt access pattern hoặc latency.
4. Không đạt operational constraint.
5. Trong các đáp án đúng kỹ thuật, chọn phương án tối ưu đúng từ khóa cuối.

## 4. Managed service heuristic

AWS thường ưu tiên managed service khi đề dùng các từ:

- least operational overhead;
- automatically scales;
- highly available without managing servers;
- minimal administration;
- rapid deployment.

Nhưng không áp dụng máy móc. EC2/self-managed có thể đúng khi đề cần:

- custom OS/kernel/appliance;
- unsupported legacy protocol;
- BYOL gắn với host/socket;
- full database engine access;
- specialized hardware hoặc long-running process không phù hợp serverless.

## 5. Hai-pass decision

### Pass 1 — Functional correctness

- Dịch vụ có hỗ trợ protocol/data model không?
- Có thỏa ordering, consistency, RPO/RTO, latency không?
- Có thỏa compliance và network isolation không?

### Pass 2 — Quality attribute

- Ít ops nhất?
- Rẻ nhất?
- Nhanh nhất?
- Resilient nhất?

Chỉ so quality attribute sau khi đã thỏa functional constraints.

## 6. Kỹ thuật 3 vòng trong 130 phút

- Vòng 1, 80–90 phút: làm câu rõ, flag câu dài/không chắc.
- Vòng 2, 25–30 phút: xử lý câu flagged bằng elimination.
- Vòng 3, 10–15 phút: không bỏ trống, kiểm tra số đáp án và từ phủ định.

Nếu kẹt quá 2.5 phút, chọn đáp án tốt nhất hiện tại, flag và đi tiếp. Chỉ đổi đáp án khi tìm được lý do kỹ thuật rõ ràng.

## 7. Error log hiệu quả

| Câu | Từ khóa bỏ lỡ | Lỗi thuộc loại | Rule mới |
|---|---|---|---|
| Ví dụ | read-heavy + HA | Nhầm Multi-AZ/read replica | Multi-AZ = HA; replica = read scale; có thể dùng cả hai |

Phân loại lỗi:

- Knowledge gap: chưa biết feature/service.
- Boundary confusion: nhầm hai dịch vụ gần nhau.
- Requirement miss: không đọc kỹ từ khóa.
- Overengineering: chọn giải pháp quá phức tạp.
- Cost blindness: đúng kỹ thuật nhưng không tối ưu cost.
- Changed correct answer: đổi đáp án vì cảm giác.

## 8. Dấu hiệu distractor

- Scale vertically khi đề yêu cầu elasticity/HA lâu dài.
- Tự quản cluster EC2 trong khi có managed service đúng use case.
- Mở public access để “đơn giản hóa” private connectivity.
- Dùng read replica như synchronous HA standby.
- Dùng replication thay backup.
- Đưa state/session vào local disk của Auto Scaling instances.
- Chọn Spot cho stateful, non-interruptible database.

Tiếp theo: [Ngày 1 — Security](../01-NGAY-1-SECURITY/README.md).
