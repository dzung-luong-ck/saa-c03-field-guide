# Task 3.1 — Determine high-performing and/or scalable storage solutions

Task này hỏi cách chọn storage theo giao diện truy cập, latency, IOPS, throughput, sharing, durability và khả năng tăng dung lượng.

## 1. Giải thích cho người mới

Đầu tiên đừng hỏi “S3 hay EBS nhanh hơn?”. Chúng có giao diện khác nhau:

- object storage: app gọi API bằng key;
- block storage: OS thấy volume như ổ đĩa;
- file storage: client mount filesystem và dùng file/path.

Chọn sai loại storage thì dù cấu hình lớn đến đâu application cũng khó phù hợp.

## 2. IOPS, throughput và latency

| Chỉ số | Hiểu đơn giản | Workload ví dụ |
|---|---|---|
| IOPS | Bao nhiêu thao tác đọc/ghi mỗi giây | Database nhiều random small I/O |
| Throughput | Bao nhiêu MB/GB truyền mỗi giây | Video, analytics, file lớn |
| Latency | Mỗi thao tác mất bao lâu | Transaction hoặc HPC nhạy thời gian |

Một volume có throughput cao chưa chắc có IOPS phù hợp. Đề thường cho kích thước request hoặc từ khóa random/sequential để bạn nhận ra chỉ số quyết định.

## 3. Chọn storage service

| Requirement | Hướng chọn |
|---|---|
| Object scale lớn, API, static asset, data lake | Amazon S3 |
| Boot/database volume cho một EC2, block semantics | Amazon EBS |
| Temporary cực nhanh gắn host, chấp nhận mất khi host dừng/hỏng | Instance Store |
| Shared Linux/NFS, tự tăng dung lượng | Amazon EFS |
| Windows file share/SMB/Active Directory | FSx for Windows File Server |
| Lustre/HPC và throughput cao, tích hợp S3 | FSx for Lustre |
| NetApp ONTAP/OpenZFS feature requirement | FSx engine tương ứng |

## 4. S3 performance patterns

- Dùng multipart upload cho object lớn và retry từng part.
- Byte-range GET cho tải song song/range.
- CloudFront cache gần viewer cho download toàn cầu.
- Transfer Acceleration hỗ trợ client xa Region upload/download qua edge khi có lợi.
- Chọn storage class theo access/retrieval, không dùng archive tier cho dữ liệu cần đọc ngay nếu restore không đáp ứng.
- Prefix naming không cần random hóa theo lời khuyên S3 rất cũ; tập trung request pattern hiện hành.

S3 là regional object service có khả năng scale lớn; nó không mount như EBS cho database filesystem truyền thống.

## 5. EBS performance

- SSD volume phù hợp transaction/random I/O; HDD phù hợp sequential throughput use case được hỗ trợ.
- Tách dung lượng, IOPS và throughput theo volume type.
- Hiệu năng còn bị giới hạn bởi EBS bandwidth/IOPS của EC2 instance.
- RAID 0 có thể tăng performance nhưng tăng failure surface; snapshot/replication vẫn cần cho data protection.
- EBS nằm trong một AZ; snapshot hỗ trợ tạo volume ở AZ khác.

## 6. EFS và FSx

EFS phù hợp nhiều Linux clients cần shared namespace. Chọn performance/throughput mode và lifecycle/tiering theo workload. Nhiều file nhỏ, metadata-heavy và file lớn tuần tự tạo profile khác nhau.

FSx là các managed file systems theo engine. Từ khóa Windows/SMB, Lustre/HPC, ONTAP hoặc OpenZFS thường là dấu hiệu chọn engine chứ không phải chỉ “shared files”.

## 7. Hybrid storage

- Storage Gateway nối on-prem với cloud storage bằng file/volume/tape patterns.
- DataSync tăng tốc và tự động hóa transfer file/object giữa storage locations.
- Transfer Family cung cấp managed SFTP/FTPS/FTP endpoint cho S3/EFS use case.
- Snow Family phù hợp lượng dữ liệu lớn hoặc network window không đủ.

Tính thời gian truyền thô: `data bits / throughput bits mỗi giây`, rồi cộng overhead và thời gian kiểm tra/cutover.

## 8. Scenario điển hình

**Đề A:** 200 Linux EC2 cần đọc/ghi chung cây thư mục, dung lượng tăng không dự đoán, không muốn quản file server.

**Chọn:** EFS với mount targets ở các AZ sử dụng và mode phù hợp. Không chọn EBS đơn lẻ vì block volume không phải shared regional NFS mặc định.

**Đề B:** HPC xử lý dataset S3 cần filesystem throughput cao trong thời gian job.

**Chọn:** FSx for Lustre tích hợp S3 theo pattern phù hợp; compute gần data/AZ để giảm bottleneck.

## 9. Exam traps

- IOPS khác throughput.
- EBS volume type tốt nhưng EC2 bandwidth thấp vẫn nghẽn.
- Instance Store không phải durable persistent disk.
- EFS không phải object storage và S3 không phải POSIX file system.
- Multi-Attach có điều kiện/giới hạn; không thay shared filesystem cho mọi app.
- S3 storage class tối ưu cost không mặc định tối ưu latency/retrieval requirement.

## 10. Checklist làm được task

- [ ] Chọn đúng object, block hoặc file trước khi chọn service.
- [ ] Phân biệt IOPS, throughput và latency.
- [ ] Chọn S3, EBS, EFS và FSx theo access pattern.
- [ ] Kiểm tra giới hạn ở cả volume và EC2 instance.
- [ ] Chọn hybrid transfer theo protocol, data size và deadline.

Học sâu: [Amazon S3](../../03-NGAY-3-STORAGE-DATABASE/01-S3.md) và [EBS, EFS, FSx](../../03-NGAY-3-STORAGE-DATABASE/02-EBS-EFS-FSX.md).

Tiếp theo: [Task 3.2 — Compute](TASK-3.2-COMPUTE.md).
