# Cost optimization

## 1. Tư duy chọn đáp án

Không chọn phương án rẻ nhất nếu phá yêu cầu. Thứ tự:

1. Loại bỏ tài nguyên không dùng.
2. Right-size và tự động scale.
3. Chọn pricing model phù hợp độ ổn định/khả năng gián đoạn.
4. Chọn storage/database class theo access pattern.
5. Giảm data transfer và request thừa.
6. Đo lại bằng billing/usage data.

## 2. EC2 purchasing options

| Model | Cam kết/đặc điểm | Chọn khi |
|---|---|---|
| On-Demand | Không cam kết dài hạn | tải ngắn, mới, không dự đoán |
| Compute Savings Plans | Cam kết USD/giờ; linh hoạt compute family/Region/OS theo phạm vi sản phẩm | compute ổn định nhưng kiến trúc có thể đổi |
| EC2 Instance Savings Plans | Discount sâu hơn nhưng ràng buộc family trong Region | usage EC2 ổn định, rõ family |
| Standard RI | Discount, ít linh hoạt hơn | RDS/EC2 attributes ổn định theo sản phẩm |
| Convertible RI | Đổi attributes theo quy tắc, discount thường thấp hơn Standard | cần thay đổi cấu hình |
| Spot | Capacity dư, có thể bị interrupt | stateless, fault-tolerant, batch, queue worker |
| Capacity Reservation | Giữ capacity On-Demand trong AZ | bắt buộc launch lúc khủng hoảng/sự kiện |
| Dedicated Host | Whole physical host | BYOL, socket/core license, compliance |

Điểm cốt lõi:

- Savings Plans/RI chủ yếu giải **giá**; Capacity Reservation giải **khả năng có capacity**.
- Zonal RI EC2 có thể kèm capacity reservation theo điều kiện; Regional RI không.
- Spot không hợp database primary hoặc job không checkpoint/retry.
- Kết hợp baseline bằng commitment và burst bằng On-Demand/Spot.

## 3. Compute levers

- ASG target tracking và schedule để tránh idle.
- Rightsizing theo CPU, memory, network, EBS và percentile; đừng chỉ nhìn average CPU.
- Graviton có thể tăng price/performance nếu application tương thích ARM.
- Lambda tính theo request/duration/resources; tăng memory đôi khi chạy nhanh hơn và tổng chi phí thấp hơn.
- Fargate giảm ops nhưng EC2 cluster được tận dụng tốt có thể rẻ hơn tải dài ổn định.
- Batch/Spot cho công việc retryable; hibernate/stop dev environment ngoài giờ.
- Compute Optimizer đề xuất right-size dựa trên metric; vẫn phải validate business behavior.

## 4. Storage levers

### S3

- Lifecycle chuyển object cũ sang IA/Glacier và expire bản không cần.
- Intelligent-Tiering khi access pattern không dự đoán, nhưng hiểu monitoring/automation charge và điều kiện object.
- Nén và gộp object nhỏ khi workload cho phép để giảm storage/request overhead.
- Versioning tăng khả năng phục hồi nhưng noncurrent versions tốn tiền; thêm lifecycle.
- Incomplete multipart upload phải có lifecycle abort.
- Chọn đúng retrieval/RTO trước khi archive; Deep Archive rẻ nhưng restore chậm.

### EBS/EFS

- gp3 tách baseline performance khỏi dung lượng, thường là lựa chọn general-purpose cost-effective.
- Không overprovision io2 nếu không cần IOPS/durability/latency đặc biệt.
- Snapshot incremental nhưng tổng billing phụ thuộc block riêng biệt; lifecycle/Recycle Bin theo retention.
- EFS lifecycle/Intelligent-Tiering chuyển file lạnh; throughput mode phải khớp workload.
- Xóa unattached EBS/old snapshots sau khi xác nhận không cần; production nên tự động inventory/tagging.

## 5. Database levers

- RDS/Aurora Reserved Instances cho baseline ổn định; right-size instance/storage.
- Aurora Serverless v2 cho tải biến thiên nhưng không mặc định rẻ hơn mọi workload; xem minimum capacity và usage.
- Read replica offload read, nhưng thêm chi phí và không thay Multi-AZ HA.
- ElastiCache giảm DB read/load khi cache hit cao, đổi lại invalidation/consistency complexity.
- DynamoDB on-demand cho traffic khó dự đoán; provisioned + auto scaling/reserved capacity cho ổn định.
- DynamoDB Standard-IA hợp table lưu nhiều, truy cập ít; DAX chỉ khi cần microsecond read và access pattern phù hợp.
- Index thừa tốn storage/write; query scan toàn bảng tốn RCU và latency.

## 6. Network/data transfer levers

- Data transfer vào AWS thường rẻ/không tính theo dịch vụ, nhưng out-to-Internet và cross-AZ/cross-Region có thể tốn đáng kể; kiểm tra pricing hiện hành.
- Giữ các tầng chatty cùng Region; không đánh đổi HA bằng cách dồn vào một AZ chỉ để né phí.
- CloudFront cache giảm origin egress/request và latency cho user toàn cầu.
- S3 gateway endpoint tránh NAT Gateway cho S3/DynamoDB traffic từ private subnet.
- Interface endpoint tính theo giờ + data; so sánh với NAT theo số AZ/volume và yêu cầu private access.
- NAT Gateway theo AZ giúp HA/đường đi đúng, nhưng nhiều NAT tăng hourly cost. Chọn theo SLA và traffic.
- Nén, batching, caching và dùng private/direct connectivity đúng mục đích.

## 7. Cost visibility và control

| Công cụ | Dùng để |
|---|---|
| Cost Explorer | Phân tích lịch sử/forecast, filter/group chi phí |
| AWS Budgets | Alert/optional action khi cost hoặc usage vượt ngưỡng |
| Cost and Usage Report (CUR) / Data Exports | Dữ liệu billing chi tiết cho phân tích |
| Cost Anomaly Detection | Phát hiện chi tiêu bất thường |
| Pricing Calculator | Ước tính trước triển khai |
| Compute Optimizer | Right-size compute/storage liên quan dựa metric |
| Trusted Advisor | Checks về cost, security, fault tolerance, performance, quota |
| Cost allocation tags | Phân bổ theo team/app/env sau khi activate |

Billing alarm CloudWatch thường dùng estimated charges trong billing Region/account conditions; AWS Budgets linh hoạt hơn cho budget period/filter.

### Multi-account

- AWS Organizations consolidated billing gộp thanh toán và có thể chia sẻ volume discounts/commitment benefits theo quy tắc.
- Cost Categories tạo taxonomy business.
- SCP giới hạn quyền tối đa, không phải cost quota.
- Tag policy giúp chuẩn hóa tag; Budget alert phát hiện vượt tiền nhưng không mặc định tắt resource.

## 8. Kiến trúc cost-effective điển hình

### Static website

S3 + CloudFront + Route 53, thay vì EC2 luôn bật. OAC giữ bucket private.

### Variable API

API Gateway + Lambda + DynamoDB on-demand nếu traffic burst/idle nhiều; sau khi ổn định mới cân nhắc provisioned/commitment.

### Batch pipeline

S3 input → SQS/Batch → Spot compute → S3 output. Checkpoint/retry và đa instance pool.

### Archive

S3 lifecycle theo tuổi/access → Glacier tier đúng retrieval time; Object Lock nếu compliance yêu cầu WORM.

## 9. Bẫy đề thi

- Multi-AZ là availability, không phải read scaling và thường tăng chi phí.
- Read replica là read scaling/DR option, không đồng nghĩa synchronous HA.
- Reserved discount không tự scale-in workload.
- Spot Fleet vẫn có interruption.
- S3 Standard-IA có minimum storage duration/size considerations; object nhỏ/sống ngắn có thể đắt hơn Standard.
- Một NAT Gateway cho toàn Region có thể rẻ giờ nhưng tạo cross-AZ charge và single-AZ dependency.
- Cost Explorer quan sát; Budgets cảnh báo; neither tự tối ưu kiến trúc nếu không cấu hình action.
- Xóa log/snapshot bừa có thể vi phạm audit/RPO. Retention phải theo policy.

## 10. Câu hỏi tự kiểm tra

1. Baseline EC2 ổn định, có thể đổi family/Region? → Compute Savings Plans.
2. Job retry được, deadline linh hoạt? → Spot.
3. Phải chắc chắn có 20 instance trong một AZ? → Capacity Reservation.
4. S3 access không dự đoán? → Intelligent-Tiering.
5. Private workloads truy cập S3 qua NAT tốn tiền? → S3 gateway endpoint.
6. SQL read-heavy? → read replica/cache tùy consistency.
7. Chi phí tăng bất thường cần phát hiện? → Cost Anomaly Detection.
8. Dữ liệu billing dòng chi tiết? → CUR/Data Exports.
9. Object archive 7 năm, rất hiếm restore? → Glacier Deep Archive, kiểm tra restore SLA.
10. DynamoDB traffic thất thường? → on-demand capacity.

## Nguồn AWS

- [AWS Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [EC2 pricing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [AWS Cost Management](https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-costmanagement.html)
