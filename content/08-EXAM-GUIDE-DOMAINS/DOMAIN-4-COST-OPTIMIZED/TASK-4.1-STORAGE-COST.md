# Task 4.1 — Design cost-optimized storage solutions

Task này hỏi cách chọn object, block, file, backup và transfer sao cho đáp ứng access/recovery requirement với chi phí thấp nhất hợp lý.

## 1. Giải thích cho người mới

Storage cost không chỉ là số GB mỗi tháng. Tổng chi phí có thể gồm:

- dung lượng;
- số request;
- retrieval từ infrequent/archive tier;
- minimum storage duration;
- IOPS/throughput provisioned;
- snapshot/backup versions;
- data transfer;
- replication sang AZ/Region khác.

Vì vậy chuyển tất cả sang tier rẻ nhất có thể làm tổng bill cao hơn nếu dữ liệu được đọc thường xuyên.

## 2. Chọn storage type trước

| Access pattern | Hướng chọn |
|---|---|
| Object/API, data lake, backup | S3 |
| Block volume cho EC2 | EBS |
| Shared Linux files | EFS |
| Windows/HPC/specialized file engine | FSx phù hợp |
| Temporary scratch có thể mất | Instance Store |

Không đổi sang service rẻ hơn nếu application không dùng được giao diện đó mà phải viết lại tốn kém hơn.

## 3. S3 lifecycle và tiering

- Standard: truy cập thường xuyên.
- Intelligent-Tiering: access pattern không biết/thay đổi, xét monitoring fee và object profile.
- Standard-IA: ít truy cập nhưng cần multi-AZ và millisecond access.
- One Zone-IA: dữ liệu tái tạo được hoặc secondary copy, chấp nhận mất AZ.
- Glacier classes: archive theo retrieval time và retention.

Lifecycle tự transition/expire current và noncurrent versions. Luôn xét minimum duration và retrieval; object nhỏ hoặc sống ngắn có thể không tiết kiệm khi transition sớm.

## 4. EBS cost

- Right-size volume và chọn SSD/HDD theo IOPS/throughput.
- gp-family thường là mặc định cân bằng; provisioned IOPS khi requirement thật sự cần.
- Xóa unattached volume và snapshot không còn retention value.
- Snapshot lifecycle/Recycle Bin/AWS Backup policy giúp quản retention.
- Dung lượng provisioned và performance settings đều có thể là cost driver.

Không giảm volume/performance trước khi kiểm tra peak metric và recovery requirement.

## 5. EFS/FSx cost

- EFS lifecycle/tiering cho file lạnh theo access pattern.
- Throughput/performance mode phải phù hợp; over-provision throughput gây lãng phí.
- FSx deployment type, SSD/HDD, throughput capacity và backup retention ảnh hưởng cost.
- Nếu file chỉ cần object access, chuyển sang S3 có thể rẻ hơn; nếu app cần POSIX/SMB, chi phí rewrite cũng phải tính.

## 6. Backup, retention và replication

Giữ mọi backup mãi mãi không phải chiến lược. Xác định:

- RPO quyết định tần suất;
- RTO quyết định nơi và tốc độ restore;
- compliance quyết định retention/immutability;
- lifecycle xóa bản hết hạn;
- cross-account/Region copy chỉ khi failure/compliance scope yêu cầu.

Read replica hoặc replication không thay backup lịch sử; backup quá ít không đáp ứng RPO.

## 7. Transfer cost và phương pháp

- DataSync cho online automated transfer, nhưng vẫn có network/service cost.
- Snow Family khi network window không đủ.
- Requester Pays chuyển request/data transfer responsibility theo S3 use case cụ thể.
- Batch file/object để giảm per-request overhead khi application cho phép.
- Compress dữ liệu và tránh chuyển lại nhiều lần.

## 8. Cost tools

- Cost allocation tags phân bổ chi phí theo team/app/environment.
- Cost Explorer xem xu hướng và phân tích.
- AWS Budgets cảnh báo/automation khi vượt ngưỡng.
- Cost and Usage Report cho dữ liệu billing chi tiết.

Tags không tự giảm cost; chúng giúp tìm owner và quyết định.

## 9. Scenario điển hình

**Đề:** Log ghi liên tục, gần như không đọc sau 30 ngày, phải giữ 7 năm, restore trong 12 giờ, không sửa/xóa trước hạn.

**Thiết kế:** S3 lifecycle từ Standard sang archive class đáp ứng restore; Object Lock retention nếu WORM; expire đúng 7 năm; compression/partition phù hợp. Không giữ Standard 7 năm và không chọn Instant Retrieval nếu 12 giờ cho phép tier rẻ hơn.

## 10. Exam traps

- Storage class rẻ theo GB có thể có retrieval/minimum duration cost.
- One Zone-IA không phù hợp bản duy nhất của dữ liệu không thể tái tạo.
- Versioning tăng cost nếu không có noncurrent lifecycle.
- Replication nhân đôi storage/transfer; chỉ dùng khi requirement cần.
- Snapshot incremental về dữ liệu lưu không có nghĩa giữ vô hạn là miễn phí.
- Requester Pays không tự giảm tổng chi phí hệ thống; nó đổi bên trả.

## 11. Checklist làm được task

- [ ] Liệt kê đủ storage, request, retrieval, performance và transfer cost.
- [ ] Chọn lifecycle theo access và retention.
- [ ] Right-size EBS/EFS/FSx theo metric.
- [ ] Thiết kế backup từ RPO/RTO/compliance.
- [ ] Chọn online/offline transfer từ data size và deadline.
- [ ] Dùng cost tools để tìm owner và xu hướng.

Học sâu: [Amazon S3](../../03-NGAY-3-STORAGE-DATABASE/01-S3.md), [EBS/EFS/FSx](../../03-NGAY-3-STORAGE-DATABASE/02-EBS-EFS-FSX.md) và [Cost Optimization](../../06-NGAY-6-COST-MIGRATION-OPS/01-COST-OPTIMIZATION.md).

Tiếp theo: [Task 4.2 — Compute cost](TASK-4.2-COMPUTE-COST.md).
