# Chiến thuật mock và phòng thi

## 1. Cấu trúc cần nhớ

Theo exam guide SAA-C03 hiện hành, kỳ thi có 65 câu, 130 phút; 50 câu tính điểm và 15 câu không tính điểm nhưng không được đánh dấu cho thí sinh. Điểm đạt là 720/1000. Tỷ trọng domain:

- Secure Architectures: 30%.
- Resilient Architectures: 26%.
- High-Performing Architectures: 24%.
- Cost-Optimized Architectures: 20%.

Không bỏ câu vì nghĩ đó là unscored. Mọi câu đều phải được xử lý như câu tính điểm.

## 2. Chiến lược ba lượt

### Lượt 1 — chắc và nhanh

- Mục tiêu khoảng 65–75 phút.
- Trả lời câu nhận diện rõ trong 45–75 giây.
- Flag câu dài/tính toán/confusing; chọn tạm đáp án tốt nhất rồi đi tiếp.
- Không để một câu lấy 4–5 phút lúc đầu.

### Lượt 2 — câu flagged

- Khoảng 35–45 phút.
- Viết mental checklist: requirement bắt buộc, keyword tối ưu, loại từng distractor.
- Với multiple response, đánh giá từng option độc lập, đủ đúng số lựa chọn.

### Lượt 3 — kiểm tra

- 10–15 phút.
- Kiểm tra câu bỏ trống, multiple response và câu vừa đổi.
- Chỉ đổi khi tìm được bằng chứng cụ thể: một requirement bị vi phạm hoặc đã đọc sai phủ định.

## 3. Cách giải một câu kiến trúc

### Bước A — xác định trạng thái hiện tại

Vẽ rất ngắn: client → entry → compute → data → integration. Tìm single point of failure, bottleneck, public exposure và coupling.

### Bước B — gạch chân requirement

Keyword thường quyết định đáp án:

- **most secure**: private path, least privilege, encryption, managed keys/secret rotation, no public exposure.
- **most resilient**: multi-AZ/Region theo failure scope, decoupling, health checks, backup/replication.
- **lowest operational overhead**: managed/serverless, native integration, auto scaling.
- **most cost-effective**: đạt SLA rồi mới giảm cost; tiering, right-size, commitment/Spot đúng loại.
- **near real-time**: stream/CDC/event, không phải nightly batch.
- **minimal downtime**: replication/CDC, test cutover, DNS/connection plan.

### Bước C — tách MUST và preference

Ví dụ: “must keep source IP” là hard constraint; “minimize cost” chỉ xét trong các phương án đã giữ source IP.

### Bước D — loại phương án

Loại nếu:

- không đáp ứng protocol/latency/RTO;
- tạo public exposure trái yêu cầu;
- manual khi đề yêu cầu least ops;
- dùng service đúng ngành nhưng sai chức năng;
- over-engineered mà không có requirement;
- scale performance nhưng không giải HA, hoặc ngược lại.

### Bước E — so phần còn lại

Ưu tiên AWS-managed/native pattern, failure isolation, ít thành phần tự vận hành và chi phí hợp lý.

## 4. Mẹo cho câu dài

- Đọc câu hỏi cuối trước: hỏi chọn gì, hai đáp án hay một?
- Đọc scenario và ghi 3–5 keyword.
- Bỏ chi tiết trang trí không ảnh hưởng decision.
- Đừng tự thêm requirement không có trong đề.
- “Immediately”, “without modifying application”, “no public Internet”, “retain client IP” thường là constraint thật.

## 5. Multiple response

- Đề ghi chính xác số đáp án cần chọn.
- Mỗi option phải đúng riêng và kết hợp phải giải toàn bộ bài toán.
- Không chọn hai đáp án trùng chức năng nếu câu hỏi cần hai lớp khác nhau, ví dụ prevention + detection.
- Nếu option A cần option B để hoạt động, kiểm tra câu có yêu cầu chọn cả hai không.

## 6. Công thức ước lượng hữu ích

### RTO/RPO

- RPO = lượng dữ liệu tối đa chấp nhận mất.
- RTO = thời gian tối đa để khôi phục service.
- Backup/restore: cost thấp, RTO/RPO cao hơn.
- Pilot light → warm standby → active-active: cost và readiness tăng dần.

### Network transfer

`time ≈ data size in bits / throughput in bits/s`

1 byte = 8 bits. Cộng overhead thực tế. Nếu kết quả vượt migration window nhiều lần, chọn Snow/offline hoặc tăng đường truyền.

### Availability

Không cộng availability phần trăm một cách tùy tiện. Serial dependency làm availability end-to-end giảm; redundancy độc lập và failover mới tăng resilience.

## 7. Error log tối thiểu

| ID | Domain | Tôi chọn | Đáp án | Keyword bỏ sót | Quy tắc mới | Ôn lại |
|---|---|---|---|---|---|---|
| 12 | Resilience | read replica | Multi-AZ | automatic failover | HA write path → Multi-AZ | ngày 7 |

Đánh dấu confidence:

- A: chắc và giải thích được.
- B: phân vân hai phương án.
- C: đoán.

Review cả câu đúng loại B/C; đó là “lỗi ẩn”.

## 8. Bẫy ngôn ngữ

- “All of the following EXCEPT”: xác định đang tìm câu sai.
- “least operational overhead”: đừng chọn tự dựng cluster nếu managed service đáp ứng.
- “without changing application”: tránh refactor/protocol change.
- “durable” không đồng nghĩa “highly available ngay lập tức”. Backup bền nhưng restore vẫn lâu.
- “encrypted” phải hỏi at rest hay in transit, key ownership và path nào.
- “scalable” phải hỏi write/read/connection/throughput nào đang nghẽn.

## 9. Ngày trước thi

- Xác nhận ID, giờ, địa điểm/online system check theo nhà cung cấp thi.
- Không học quota vụn mới vào đêm cuối.
- Chuẩn bị nước/đồ ăn nhẹ theo quy định và ngủ đủ.
- Trước khi bắt đầu, viết mental anchors: IAM evaluation, SG vs NACL, Multi-AZ vs replica, SQS/SNS/EventBridge, EBS/EFS/S3, RTO/RPO.

## 10. Khi kẹt giữa hai đáp án

Hỏi lần lượt:

1. Đáp án nào vi phạm hard constraint?
2. Đáp án nào AWS managed hơn?
3. Đáp án nào có failure scope đúng?
4. Đáp án nào xử lý root cause thay vì symptom?
5. Đáp án nào cần ít custom code/manual sync hơn?
6. Đáp án nào đạt mục tiêu với chi phí hợp lý hơn?

Nếu vẫn không chắc, chọn, flag và đi tiếp. Không để một câu phá thời gian toàn bài.

## Nguồn AWS

- [SAA-C03 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html)
