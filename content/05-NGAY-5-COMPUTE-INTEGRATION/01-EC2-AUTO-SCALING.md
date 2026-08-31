# EC2 và Auto Scaling

## 1. Khi nào chọn EC2?

Chọn EC2 khi cần một hoặc nhiều điều sau:

- quyền kiểm soát OS, agent, kernel, network stack hoặc software tùy chỉnh;
- workload chạy lâu, stateful, license đặc biệt hoặc chưa thể container hóa;
- GPU/HPC, local NVMe, placement topology hoặc instance family cụ thể;
- ứng dụng legacy cần lift-and-shift.

Nếu đề nhấn mạnh “không quản lý server”, thời gian chạy ngắn, event-driven và tự động scale về 0, hãy cân nhắc Lambda. Nếu ứng dụng đã đóng gói container, cân nhắc ECS/EKS và Fargate.

## 2. Instance family theo workload

| Nhóm | Ý nghĩa | Ví dụ use case |
|---|---|---|
| General purpose | Cân bằng CPU/RAM/network | web/app server, dev/test |
| Compute optimized | CPU cao | batch, game server, HPC, transcoding |
| Memory optimized | RAM lớn | in-memory DB/cache, real-time analytics |
| Storage optimized | local IOPS/throughput cao | NoSQL, data warehouse, log processing |
| Accelerated computing | GPU/FPGA/accelerator | ML, graphics, inference |

Không cần học mọi tên instance. Hãy đọc keyword về CPU, memory, GPU và local storage.

## 3. AMI, bootstrap và metadata

- **AMI** chứa template hệ điều hành, software và block-device mapping. AMI gắn Region; copy để dùng Region khác.
- **User data** chạy khi boot lần đầu theo mặc định, phù hợp bootstrap; cần idempotent nếu cấu hình chạy lại.
- Golden AMI giúp khởi động nhanh và nhất quán; pipeline nên vá, test rồi phát hành AMI mới.
- Instance Metadata Service cung cấp metadata/temporary role credentials. Ưu tiên **IMDSv2**, dùng session token để giảm nguy cơ SSRF lấy metadata.
- Không đặt access key dài hạn trong AMI, user data hoặc source code; gắn IAM role qua instance profile.

## 4. Networking của EC2

- Primary ENI giữ private IP chính; secondary ENI có thể chuyển giữa instance trong cùng AZ cho một số mô hình failover.
- Private IPv4 nằm trong subnet; public IPv4 có thể đổi khi stop/start nếu không dùng Elastic IP.
- Elastic IP là public IPv4 tĩnh có thể remap, nhưng không phải giải pháp load balancing/HA toàn cầu.
- Security group gắn ENI, stateful; NACL gắn subnet, stateless.
- Enhanced networking/ENA và placement phù hợp cải thiện throughput/latency.

## 5. Trạng thái và lưu trữ

- **Stop/start**: EBS tồn tại; host vật lý có thể đổi; public IPv4 thường đổi.
- **Reboot**: thường giữ host/network attributes.
- **Terminate**: root EBS thường delete-on-termination theo mapping; volume phụ thuộc thuộc tính cấu hình.
- **Hibernate**: RAM được ghi vào encrypted EBS root rồi resume; chỉ hỗ trợ điều kiện/instance/OS nhất định.
- Instance store rất nhanh nhưng ephemeral; không dùng làm bản duy nhất của dữ liệu cần bền vững.

Chi tiết EBS/EFS/FSx nằm ở [Ngày 3](../03-NGAY-3-STORAGE-DATABASE/02-EBS-EFS-FSX.md).

## 6. Placement group

| Loại | Đặc điểm | Chọn khi |
|---|---|---|
| Cluster | Instance gần nhau trong một AZ, latency thấp/throughput cao | HPC, tightly coupled |
| Spread | Tách instance trên hardware khác nhau, số lượng hạn chế mỗi AZ | Ít instance cực kỳ quan trọng |
| Partition | Chia thành partition, mỗi partition có rack riêng | Hadoop, Kafka, Cassandra quy mô lớn |

Bẫy: cluster tăng hiệu năng nhưng giảm blast-radius isolation và không phải multi-AZ HA.

## 7. Auto Scaling Group

ASG duy trì `min`, `desired`, `max`, thay instance unhealthy và trải instance trên các AZ được cấu hình.

### Launch template

Chứa AMI, instance type, security group, user data, IAM role, storage. Dùng version để rollout; launch template được ưu tiên hơn launch configuration cũ.

### Scaling policy

| Policy | Khi dùng |
|---|---|
| Target tracking | Giữ metric quanh target, ví dụ CPU 50% hoặc ALB requests/target |
| Step scaling | Thay đổi capacity theo mức alarm |
| Simple scaling | Một action + cooldown; ít linh hoạt hơn |
| Scheduled | Biết trước thời điểm tải tăng/giảm |
| Predictive | Dữ liệu tải tuần hoàn để dự báo trước |

Chọn metric phản ánh bottleneck. Queue consumer nên scale theo backlog/instance hoặc tuổi message, không chỉ CPU.

### Health và lifecycle

- EC2 status check phát hiện lỗi instance/hạ tầng; ELB health check phát hiện app không phục vụ.
- Bật ELB health check cho ASG để thay instance ứng dụng unhealthy.
- Health check grace period tránh thay instance khi bootstrap chưa xong.
- Lifecycle hook cho phép hoàn tất bootstrap, drain hoặc thu thập log trước launch/terminate.
- Instance warm-up giúp metric scaling không bị lệch bởi instance mới.
- Capacity Rebalancing hỗ trợ ASG Spot chủ động thay capacity có nguy cơ interruption.

### Mixed instances và purchase options

ASG có thể trộn instance type, On-Demand và Spot. Thiết kế chịu lỗi, checkpoint và đa dạng pool giúp Spot bền hơn. Không đặt workload không thể gián đoạn chỉ trên Spot.

## 8. EC2 purchase model — nhận diện nhanh

| Lựa chọn | Từ khóa |
|---|---|
| On-Demand | linh hoạt, không cam kết, tải ngắn/không dự đoán |
| Savings Plans | cam kết chi tiêu theo giờ, giảm compute; linh hoạt hơn RI tùy loại |
| Reserved Instances | discount theo attributes/term; Standard/Convertible; RI zonal có capacity reservation |
| Spot | rẻ nhất, có thể bị reclaim; batch/stateless/fault-tolerant |
| On-Demand Capacity Reservation | giữ capacity trong AZ, không tự tạo discount |
| Dedicated Instance | hardware không chia với account khác, ít quyền host-level |
| Dedicated Host | cả physical host, BYOL/socket/core licensing/host affinity |

Cost chi tiết ở Ngày 6. Nhớ: **discount** và **capacity reservation** là hai nhu cầu khác nhau.

## 9. Mẫu kiến trúc

### Stateless web tier

`Route 53 → CloudFront/WAF → ALB → ASG EC2 đa AZ → Aurora/RDS Multi-AZ`

- Session ngoài instance.
- AMI/user data có thể tái tạo instance.
- Target health check và target tracking.

### Queue workers

`Producer → SQS → ASG workers → durable database/S3`

- Scale theo queue depth/age.
- Worker idempotent; visibility timeout dài hơn thời gian xử lý.
- DLQ cho poison messages.

### HPC

- Cluster placement group + compute optimized/accelerated instances.
- EFA khi cần tightly coupled high-throughput, low-latency communication.
- FSx for Lustre cho parallel file system và tích hợp S3.

## 10. Bẫy đề thi

- ASG không tự làm database stateful trở thành HA.
- AMI không thay backup dữ liệu đang thay đổi liên tục.
- Một instance lớn hơn chỉ là vertical scaling, vẫn có single point of failure.
- EIP không tự failover và bị tính phí theo chính sách IPv4 hiện hành.
- User data không phải secret store.
- CPU thấp không có nghĩa ứng dụng không nghẽn; có thể nghẽn I/O, connection hoặc queue.
- Stop instance store-backed workload có thể làm mất local ephemeral data.

## 11. Tự kiểm tra

1. Batch có thể retry và cần rẻ? → Spot fleet/mixed ASG.
2. License theo socket và cần biết host? → Dedicated Host.
3. Web app cần scale theo requests? → ALB request count per target target-tracking.
4. Queue worker CPU thấp nhưng backlog tăng? → scale theo backlog/worker hoặc message age.
5. HPC cần latency cực thấp giữa node? → cluster placement group, cân nhắc EFA.
6. Instance cần AWS credentials? → IAM role/instance profile.
7. Tự thay app instance lỗi dù EC2 status vẫn OK? → ASG dùng ELB health checks.
8. Public IP phải giữ khi stop/start? → Elastic IP, hoặc tốt hơn đặt sau ELB nếu là service.

## Nguồn AWS

- [Amazon EC2 User Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html)
- [EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [Placement groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html)
