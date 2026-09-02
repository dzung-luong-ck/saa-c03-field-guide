# Từ điển AWS cho người mới

Từ điển này giải thích thuật ngữ theo ngôn ngữ đơn giản. Đừng cố học thuộc một lượt; hãy quay lại khi gặp từ lạ trong bài kỹ thuật.

## 1. Hạ tầng và phạm vi

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| AWS account | Ranh giới tài nguyên, quyền và hóa đơn | Tách account giúp isolation và governance |
| Region | Khu vực địa lý chứa nhiều AZ | Chọn theo latency, compliance, service và DR |
| Availability Zone | Miền lỗi độc lập trong một Region | Multi-AZ thường giải HA trong Region |
| Edge location | Điểm hiện diện gần người dùng | CloudFront dùng để cache/serve gần viewer |
| Resource | Đối tượng trên AWS | EC2, bucket, VPC và function đều là resource |
| ARN | Định danh đầy đủ của resource | IAM policy thường dùng ARN để giới hạn phạm vi |
| Tag | Nhãn key-value gắn vào resource | Dùng cho cost, automation và ABAC |
| Quota | Giới hạn số lượng/rate của service | Scale design phải kiểm tra quota liên quan |

## 2. Identity và security

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| Principal | Danh tính đang thực hiện request | Có thể là user, role, account hoặc service |
| Authentication | Chứng minh bạn là ai | Password, MFA, token hoặc federation |
| Authorization | Quyết định bạn được làm gì | Được đánh giá bằng policy và context |
| IAM user | Danh tính dài hạn trong một account | Tránh dùng hàng loạt cho workforce/workload mới |
| IAM role | Bộ quyền được assume tạm thời | Không có access key dài hạn cố định |
| Policy | Tài liệu mô tả Allow/Deny | Explicit Deny thắng Allow |
| Least privilege | Chỉ cấp quyền thật sự cần | Giới hạn action, resource và condition |
| MFA | Thêm yếu tố xác thực | Rất quan trọng cho root và quyền nhạy cảm |
| Federation | Dùng identity bên ngoài để vào AWS | Giảm tạo user lặp trong nhiều account |
| Encryption at rest | Mã hóa dữ liệu khi lưu | Hỏi ai quản key và service nào thực hiện |
| Encryption in transit | Mã hóa dữ liệu khi truyền | Thường dùng TLS/HTTPS |
| KMS key | Khóa logic do KMS quản | Key policy và IAM đều có thể ảnh hưởng quyền dùng |
| Secret | Password, token hoặc API key bí mật | Dùng Secrets Manager/Parameter Store phù hợp; không hard-code |

## 3. Networking

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| VPC | Mạng riêng logic trên AWS | Chứa subnet, route và security controls |
| CIDR | Cách viết một dải IP | CIDR VPC/subnet không nên overlap khi cần kết nối |
| Subnet | Một phần dải IP của VPC trong một AZ | Public/private phụ thuộc route, không phụ thuộc tên |
| Route table | Bảng chỉ đường cho packet | Route không tự cấp phép traffic |
| Internet Gateway | Cổng Internet cho VPC | Cần route và public IP phù hợp cho direct Internet path |
| NAT Gateway | Cho private resource chủ động ra Internet | Không nhận inbound Internet tự do tới private instance |
| Security Group | Firewall stateful gắn vào resource | Chỉ rule allow; return traffic được nhớ trạng thái |
| NACL | Firewall stateless ở subnet | Có allow/deny và phải xét hai chiều |
| VPC endpoint | Đi private tới service được hỗ trợ | Giảm phụ thuộc NAT/public Internet |
| DNS | Đổi tên thành endpoint/IP | Route 53 cung cấp DNS và routing policies |
| Load balancer | Phân phối traffic tới nhiều target | Health check giúp tránh gửi tới target lỗi |
| TLS | Mã hóa kết nối | Certificate xác nhận danh tính endpoint |
| VPN | Tunnel mã hóa qua Internet | Nhanh triển khai hơn đường truyền chuyên dụng |
| Direct Connect | Kết nối mạng riêng chuyên dụng tới AWS | Không tự mã hóa traffic như VPN |

## 4. Compute và scaling

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| EC2 instance | Máy ảo | Bạn quản OS, patch và capacity |
| AMI | Khuôn để tạo EC2 | Chứa image hệ điều hành và cấu hình nền |
| Instance type | Cấu hình CPU/RAM/network | Chọn family theo workload |
| Auto Scaling Group | Nhóm tự duy trì số EC2 | Có min, desired, max và health replacement |
| Horizontal scaling | Thêm/bớt nhiều máy | Thường tăng HA và elasticity tốt hơn vertical |
| Vertical scaling | Đổi sang máy mạnh hơn | Có giới hạn và thường cần restart/cutover |
| Lambda function | Code chạy theo request/event | Phù hợp stateless và event-driven |
| Container | Gói code cùng dependency | ECS/EKS chạy và điều phối containers |
| Fargate | Compute managed cho container | Không quản worker EC2 trực tiếp |
| Stateless | Request không phụ thuộc state trên máy cụ thể | Dễ scale và replace instance |
| Stateful | Có state gắn với process/máy | Cần replication, shared store hoặc sticky strategy phù hợp |

## 5. Storage và database

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| Object | Dữ liệu + key + metadata | S3 truy cập object qua API |
| Block storage | Ổ đĩa dạng block | EBS thường gắn với EC2 trong một AZ |
| File system | Cây thư mục/file | EFS/FSx cung cấp shared file access theo use case |
| Snapshot | Bản chụp dữ liệu tại một thời điểm | Thường incremental về storage, dùng backup/restore |
| IOPS | Số thao tác I/O mỗi giây | Quan trọng với workload nhiều thao tác nhỏ |
| Throughput | Lượng dữ liệu truyền mỗi giây | Quan trọng với file lớn/streaming/batch |
| Latency | Thời gian hoàn thành một request | Thấp hơn thường phản hồi nhanh hơn |
| Relational DB | Database bảng và quan hệ | RDS/Aurora cho SQL và transaction |
| NoSQL | Database không theo mô hình relational truyền thống | DynamoDB phù hợp key-value/document scale lớn |
| Primary key | Key định danh/truy cập record | Thiết kế key quyết định phân bố và query DynamoDB |
| Index | Cấu trúc giúp query nhanh hơn | Tăng storage/write cost; không miễn phí |
| Read replica | Bản sao phục vụ đọc | Tăng read scale; thường async |
| Multi-AZ | Dự phòng ở AZ khác | Mục tiêu chính là availability/failover |
| Cache | Bản sao dữ liệu truy cập nhanh | Có hit, miss, TTL và invalidation |

## 6. Integration và dữ liệu chuyển động

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| Producer | Thành phần tạo message/event | Không nên phụ thuộc chặt vào tốc độ consumer |
| Consumer | Thành phần xử lý message/event | Phải xử lý retry và duplicate phù hợp |
| Queue | Hàng đợi công việc | SQS thường cho buffer/decoupling |
| Pub/sub | Một message phát cho nhiều subscriber | SNS phù hợp fan-out notification |
| Event bus | Router event theo rule | EventBridge phù hợp event routing phong phú |
| Stream | Dòng record có thứ tự theo shard/partition | Kinesis/MSK cho xử lý dữ liệu liên tục |
| Batch | Xử lý một nhóm dữ liệu theo đợt | Khác near-real-time streaming |
| Idempotency | Làm lại request không tạo tác dụng phụ sai | Cần khi hệ thống có retry/at-least-once delivery |
| Dead-letter queue | Nơi giữ message xử lý lỗi nhiều lần | Giúp cô lập và điều tra poison message |
| Eventual consistency | Bản sao cần thời gian để hội tụ | Application phải chấp nhận dữ liệu tạm thời chưa đồng nhất |

## 7. Resilience và disaster recovery

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| High availability | Giảm thời gian ngừng dịch vụ | Thường dùng redundancy và automatic failover |
| Fault tolerance | Tiếp tục chạy gần như không gián đoạn khi lỗi | Tốn nhiều tài nguyên hơn HA thông thường |
| Durability | Khả năng dữ liệu không mất | Không đồng nghĩa service luôn sẵn sàng |
| Backup | Bản sao để khôi phục | Restore cần thời gian; không tự tạo HA |
| Replication | Sao chép dữ liệu sang vị trí khác | Có thể sync hoặc async |
| RPO | Chấp nhận mất tối đa bao nhiêu dữ liệu | RPO nhỏ cần replication thường xuyên hơn |
| RTO | Chấp nhận hệ thống dừng bao lâu | RTO nhỏ cần môi trường sẵn sàng hơn |
| Failover | Chuyển sang thành phần dự phòng | Có thể tự động hoặc thủ công |
| Health check | Kiểm tra target có phục vụ được không | Check quá nông hoặc quá sâu đều có rủi ro |
| Retry | Thử lại lỗi tạm thời | Dùng giới hạn, backoff và jitter |

## 8. Operations và governance

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| Metric | Số đo theo thời gian | CPU, request count, latency, error rate |
| Log | Bản ghi sự kiện chi tiết | Dùng điều tra một request hoặc lỗi |
| Trace | Đường đi của request qua nhiều service | Hữu ích cho distributed application |
| CloudWatch | Metrics, logs, alarms và quan sát workload | Không thay CloudTrail cho audit API |
| CloudTrail | Lịch sử hoạt động AWS API | Trả lời ai làm gì, lúc nào, ở đâu |
| AWS Config | Theo dõi configuration state/compliance | Không phải log ứng dụng |
| IaC | Mô tả hạ tầng bằng code/template | CloudFormation/CDK hỗ trợ repeatable deployment |
| Drift | Resource thật lệch khỏi cấu hình mong muốn | Cần detect và remediation |
| SCP | Guardrail quyền tối đa trong Organizations | Không tự cấp permission |
| Control Tower | Dựng và quản landing zone nhiều account | Giảm thao tác governance thủ công |

## 9. Cost và mô hình mua

| Thuật ngữ | Hiểu đơn giản | Điểm cần nhớ trong đề |
|---|---|---|
| On-Demand | Dùng tới đâu trả tới đó, ít cam kết | Linh hoạt nhưng đơn giá thường cao hơn commitment |
| Savings Plans | Cam kết mức sử dụng compute | Phù hợp baseline dự đoán được |
| Reserved Instances | Mô hình giảm giá/đặt trước theo loại dịch vụ | Không nhầm với capacity reservation |
| Spot | Dùng capacity dư với giá thấp, có thể bị thu hồi | Phù hợp workload fault-tolerant |
| Right-sizing | Chọn đúng kích cỡ resource | Cần dựa trên metric, không đoán |
| Data transfer | Chi phí dữ liệu đi giữa location/service | Có thể quyết định kiến trúc và Region |
| TCO | Tổng chi phí sở hữu | Gồm hạ tầng, nhân lực, license, downtime và vận hành |

## 10. Các cặp phải phân biệt

| Cặp | Cách nhớ ngắn |
|---|---|
| IAM vs Security Group | IAM cho API identity; SG cho network traffic |
| Route table vs Security Group | Route chỉ đường; SG cho phép/chặn ở resource |
| Multi-AZ vs read replica | Multi-AZ cho HA; replica chủ yếu cho read scale |
| Backup vs replication | Backup để phục hồi; replication giữ bản sao gần hiện tại |
| SQS vs SNS | Queue giữ việc cho consumer; SNS phát một message tới nhiều subscriber |
| CloudWatch vs CloudTrail | CloudWatch quan sát hệ thống; CloudTrail audit AWS API |
| S3 vs EBS | S3 object qua API; EBS block volume cho EC2 |
| NAT Gateway vs Internet Gateway | NAT cho private outbound; IGW là cổng Internet của VPC |
| Encryption vs permission | Mã hóa bảo vệ dữ liệu; permission quyết định ai được thao tác |
| Scalability vs availability | Scale chịu tải; HA chịu lỗi/giảm downtime |

Tiếp theo: [Ngày 1 — Security](../01-NGAY-1-SECURITY/README.md).
