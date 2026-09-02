# AWS từ số 0 — nền tảng cho người mới

Nếu bạn chưa từng làm cloud, hãy đọc bài này trước Ngày 1. Mục tiêu không phải thuộc tên hàng trăm dịch vụ. Mục tiêu là tạo một **bản đồ trong đầu** để khi thấy một tên AWS, bạn biết nó đang giải quyết lớp nào của hệ thống.

> **Cách học bài này:** đọc chậm một lượt, tự vẽ lại sơ đồ request ở phần 8, rồi trả lời câu hỏi cuối bài. Khi gặp từ lạ trong các bài sau, mở [Từ điển AWS cho người mới](01-TU-DIEN-AWS-CHO-NGUOI-MOI.md).

## 1. Cloud là gì?

Trước cloud, công ty thường phải mua máy chủ vật lý, thuê chỗ đặt máy, kéo mạng, cài hệ điều hành và dự đoán tải nhiều tháng trước. Nếu dự đoán thấp, hệ thống quá tải. Nếu dự đoán cao, nhiều máy nằm không nhưng vẫn phải trả tiền.

Cloud biến hạ tầng thành tài nguyên gọi qua API:

```text
Bạn cần máy chủ → gọi API tạo EC2
Bạn cần lưu file → gọi API ghi S3
Bạn cần database → gọi API tạo RDS
Bạn không cần nữa → xóa resource và ngừng trả phần lớn chi phí sử dụng
```

Ba ý quan trọng:

1. **On-demand:** tạo tài nguyên khi cần, thay vì mua trước.
2. **Elastic:** tăng hoặc giảm theo tải.
3. **Pay for use:** phần lớn dịch vụ tính theo thời gian, dung lượng, request hoặc dữ liệu truyền.

Cloud không tự động làm kiến trúc an toàn hay rẻ. Bạn vẫn phải chọn đúng dịch vụ, cấu hình quyền, thiết kế dự phòng và theo dõi chi phí.

## 2. AWS account, Region và Availability Zone

### AWS account là ranh giới quản trị

Hãy hình dung account như một căn hộ có:

- hóa đơn riêng;
- danh tính và quyền riêng;
- quota riêng;
- tài nguyên riêng;
- log và chính sách riêng.

Một công ty thường dùng nhiều account để tách production, development, security và logging. AWS Organizations gom các account vào một tổ chức và áp guardrail tập trung.

### Region là khu vực địa lý

Ví dụ một Region có thể nằm ở Singapore hoặc Tokyo. Bạn chọn Region dựa trên:

- độ trễ tới người dùng;
- yêu cầu dữ liệu phải nằm ở đâu;
- dịch vụ có được hỗ trợ không;
- giá và khả năng phục hồi mong muốn.

### Availability Zone là miền lỗi độc lập trong một Region

Một Region có nhiều Availability Zone, thường viết tắt là **AZ**. Mỗi AZ gồm một hoặc nhiều data center được thiết kế tách biệt về nguồn điện và kết nối, nhưng vẫn liên kết với các AZ khác bằng mạng tốc độ cao.

```text
Region
├── AZ-A
│   ├── Public subnet
│   └── Private subnet
├── AZ-B
│   ├── Public subnet
│   └── Private subnet
└── AZ-C
```

Nếu toàn bộ application chỉ nằm trong một AZ, sự cố AZ có thể làm hệ thống dừng. Vì vậy câu hỏi có từ khóa **high availability** thường dẫn tới triển khai ở ít nhất hai AZ.

### Edge location không phải AZ

Edge location nằm gần người dùng và phục vụ các dịch vụ biên như CloudFront. Nó giúp cache nội dung, giảm độ trễ hoặc bảo vệ entry point. Bạn không chọn edge location như nơi đặt EC2 thông thường.

## 3. Resource, ARN và API

### Resource

Resource là một đối tượng bạn tạo hoặc sử dụng trên AWS: EC2 instance, S3 bucket, VPC, Lambda function, RDS database.

### ARN

ARN là định danh đầy đủ của resource. Nó giống địa chỉ bưu điện có cấu trúc:

```text
arn:partition:service:region:account-id:resource
```

Policy dùng ARN để nói chính xác quyền áp dụng lên resource nào. Không cần thuộc mọi format, nhưng phải nhận ra ARN của bucket và object có thể khác nhau.

### API

Console, CLI và SDK cuối cùng đều gọi AWS API. Ví dụ khi bấm “Create bucket” trên console, phía sau là API request có identity, action, resource và context.

Một request cơ bản được đánh giá như sau:

```text
Ai đang gọi?       → principal / credential
Muốn làm gì?       → API action
Trên tài nguyên nào? → resource ARN
Trong điều kiện nào? → IP, tag, Region, MFA...
Policy có cho phép? → Allow, Deny hoặc implicit deny
```

## 4. Năm lớp của một ứng dụng

Khi đọc câu hỏi dài, chia kiến trúc thành năm lớp. Cách này giúp bạn không bị ngợp bởi tên dịch vụ.

| Lớp | Câu hỏi cần trả lời | Ví dụ AWS |
|---|---|---|
| Entry | Người dùng đi vào hệ thống bằng cách nào? | Route 53, CloudFront, API Gateway, ELB |
| Compute | Code chạy ở đâu? | EC2, Lambda, ECS, EKS, Fargate |
| Storage/Data | File và dữ liệu nằm ở đâu? | S3, EBS, EFS, RDS, DynamoDB |
| Integration | Thành phần trao đổi công việc thế nào? | SQS, SNS, EventBridge, Step Functions |
| Security/Ops | Ai được làm gì và hệ thống được quan sát ra sao? | IAM, KMS, WAF, CloudWatch, CloudTrail |

Không phải kiến trúc nào cũng có đủ mọi dịch vụ. Bảng chỉ giúp bạn đặt mỗi thành phần vào đúng “ngăn”.

## 5. Compute: nơi chạy chương trình

### EC2 — thuê máy ảo

Bạn chọn CPU/RAM, hệ điều hành, network và disk. Bạn kiểm soát nhiều nhất nhưng cũng phải quản patching, scaling và availability nhiều hơn.

**Hình dung:** thuê một căn nhà trống. Bạn có nhiều tự do nhưng phải tự bảo trì.

### Lambda — chạy hàm khi có sự kiện

Bạn đưa code, AWS quản server. Function chạy khi có request hoặc event và thường phù hợp công việc ngắn, stateless, có thể scale theo sự kiện.

**Hình dung:** gọi dịch vụ theo lần dùng. Không phải quản căn nhà, nhưng phải làm theo giới hạn của dịch vụ.

### Containers — đóng gói ứng dụng

Container mang code và dependency trong một package nhất quán. ECS/EKS quản việc chạy container; Fargate cho phép chạy mà không quản EC2 worker nodes.

**Phản xạ đề thi:** “least operational overhead” thường ưu tiên dịch vụ managed/serverless nếu nó vẫn đáp ứng requirement. Không chọn serverless chỉ vì ít vận hành nếu workload cần điều khiển hệ điều hành hoặc chạy vượt giới hạn phù hợp.

## 6. Storage và database khác nhau thế nào?

### Object storage — S3

Lưu object qua key và API. Rất phù hợp cho ảnh, video, backup, log và static content. S3 không phải ổ đĩa gắn vào hệ điều hành và không cung cấp giao diện filesystem POSIX thông thường.

### Block storage — EBS

Là các block giống ổ đĩa gắn cho EC2. Phù hợp boot volume, database tự quản và ứng dụng cần filesystem cục bộ trên một máy.

### File storage — EFS/FSx

Cung cấp file system có thư mục và file, có thể được nhiều máy truy cập tùy dịch vụ. EFS thường gắn với NFS/Linux; FSx có các engine được quản lý cho nhu cầu cụ thể.

### Database

Database không chỉ “lưu dữ liệu”; nó cung cấp cách tìm kiếm, cập nhật, ràng buộc và xử lý đồng thời.

- **Relational:** bảng, hàng, cột, SQL và transaction; ví dụ RDS/Aurora.
- **Key-value/document:** truy cập theo key, scale lớn; ví dụ DynamoDB.
- **Cache:** bản sao dữ liệu nhanh trong memory; ví dụ ElastiCache.

> Câu hỏi đúng không phải “dịch vụ nào tốt nhất?”, mà là “access pattern của dữ liệu là gì?”.

## 7. Networking không đáng sợ nếu đi theo luồng

VPC là mạng riêng logic của bạn trên AWS. CIDR là dải địa chỉ IP của mạng. Subnet chia VPC thành các vùng nhỏ và nằm trong đúng một AZ.

### Public và private không phải tên loại subnet

- Public subnet có route phù hợp tới Internet Gateway.
- Private subnet không có route trực tiếp như vậy.
- Security Group và NACL vẫn quyết định traffic được phép; có route không đồng nghĩa được phép mọi kết nối.

### Route, firewall và DNS làm ba việc khác nhau

| Thành phần | Câu hỏi |
|---|---|
| Route table | Gói tin nên đi đường nào? |
| Security Group/NACL | Gói tin có được phép đi qua không? |
| DNS/Route 53 | Tên miền được phân giải thành endpoint nào? |

### Inbound và outbound

- **Inbound:** traffic đi vào resource.
- **Outbound:** traffic đi ra khỏi resource.
- NAT Gateway chủ yếu giúp resource private chủ động ra Internet; nó không biến resource thành public server nhận kết nối từ Internet.

## 8. Theo dấu một request từ người dùng tới dữ liệu

Ví dụ người dùng mở một website bán hàng:

```text
1. Browser hỏi DNS
   ↓
2. Route 53 trả endpoint phù hợp
   ↓
3. CloudFront nhận request gần người dùng
   ├─ cache hit  → trả nội dung ngay
   └─ cache miss → chuyển về origin
                     ↓
4. ALB phân phối request tới target khỏe
                     ↓
5. EC2/ECS/Lambda chạy business logic
                     ├─ đọc cache ElastiCache
                     ├─ đọc/ghi RDS hoặc DynamoDB
                     └─ gửi việc nền vào SQS
                                      ↓
6. Worker xử lý bất đồng bộ và ghi kết quả
```

Security đi xuyên suốt luồng:

- TLS bảo vệ dữ liệu khi truyền;
- IAM role cấp quyền workload;
- Security Group giới hạn network path;
- KMS hỗ trợ quản khóa mã hóa;
- WAF lọc web request độc hại;
- CloudWatch quan sát metric/log;
- CloudTrail ghi lại hoạt động API quản trị.

Khi làm đề, hãy tự hỏi request đang bị nghẽn hoặc không an toàn ở bước nào. Đáp án tốt thường sửa đúng lớp đó thay vì thêm một dịch vụ không liên quan.

## 9. High availability, scalability và durability

Ba từ này thường xuất hiện cùng nhau nhưng không giống nhau.

| Khái niệm | Câu hỏi đơn giản | Ví dụ |
|---|---|---|
| Availability | Hệ thống có sẵn để phục vụ không? | App chạy ở nhiều AZ |
| Scalability | Có tăng capacity để chịu tải lớn hơn không? | Thêm EC2/read replica |
| Elasticity | Có tự tăng rồi tự giảm theo tải không? | Auto Scaling target tracking |
| Durability | Dữ liệu có còn nguyên sau lỗi không? | Nhiều bản sao/backup |
| Fault tolerance | Một thành phần hỏng mà gần như không gián đoạn được không? | Dự phòng active và failover tự động |

Ví dụ: backup có thể rất durable nhưng không làm database đang chạy highly available, vì restore vẫn mất thời gian. Read replica có thể tăng read scalability nhưng không mặc định là cơ chế failover write giống Multi-AZ.

## 10. Synchronous, asynchronous và queue

### Đồng bộ

Caller chờ kết quả ngay. Phù hợp login hoặc lấy giá sản phẩm. Nếu downstream chậm, caller cũng chậm.

```text
Client → Service A → Service B → trả kết quả
```

### Bất đồng bộ

Caller gửi công việc rồi tiếp tục; worker xử lý sau.

```text
Client → Service A → SQS → Worker
```

Queue giúp hấp thụ spike và tách tốc độ producer khỏi consumer. Nhưng consumer phải xử lý retry, duplicate và idempotency. “Có queue” không có nghĩa message chắc chắn chỉ được xử lý đúng một lần ở mọi tình huống.

## 11. Security: identity trước, network sau

Một request có thể đi đúng đường mạng nhưng vẫn bị IAM từ chối; ngược lại IAM cho phép nhưng network không có route hoặc firewall chặn.

Học theo bốn câu hỏi:

1. **Ai?** User, role, service hay account nào?
2. **Làm gì?** API action nào?
3. **Ở đâu?** Resource nào?
4. **Trong điều kiện nào?** TLS, IP, tag, MFA, organization?

Nguyên tắc least privilege: chỉ cấp quyền cần thiết trong thời gian và phạm vi cần thiết. Workload trên AWS nên dùng role với credential tạm thay vì nhúng access key dài hạn vào code.

## 12. Managed service và operational overhead

Operational overhead là công sức để cài đặt, vá lỗi, backup, scale, monitor và khôi phục.

```text
Tự quản trên EC2  → nhiều quyền kiểm soát, nhiều việc vận hành
Managed service   → AWS quản nhiều lớp hơn
Serverless        → tập trung vào code/data, ít quản server nhất
```

Managed không có nghĩa “không cần quản gì”. Bạn vẫn chịu trách nhiệm cho dữ liệu, quyền truy cập, cấu hình, cost và cách application sử dụng dịch vụ.

Trong câu thi, nếu hai đáp án đều đáp ứng requirement, phương án dùng native managed service với ít custom code thường phù hợp cụm “least operational overhead”.

## 13. Cost: đừng chọn rẻ trước khi đạt yêu cầu

Thứ tự đúng:

1. Đáp ứng security, availability, performance và compliance bắt buộc.
2. Trong các phương án còn lại, chọn cách có tổng chi phí hợp lý nhất.

Các đòn bẩy phổ biến:

- right-size thay vì chạy máy quá lớn;
- tự scale down khi tải giảm;
- Spot cho công việc chịu gián đoạn;
- Savings Plans/Reserved cho baseline ổn định;
- lifecycle/tiering cho dữ liệu cũ;
- cache và CDN để giảm xử lý/truyền dữ liệu không cần thiết;
- xóa resource nhàn rỗi.

Giá mua tài nguyên chỉ là một phần. Hãy tính cả thời gian vận hành, downtime, data transfer và công sức migration.

## 14. Cách đọc một câu SAA-C03

### Bước 1 — tìm danh từ

Xác định client, application, database, file, queue, account và Region đang có.

### Bước 2 — tìm động từ

Ứng dụng cần đọc, ghi, stream, replicate, encrypt, scale, migrate hay audit?

### Bước 3 — tìm ràng buộc quyết định

Ví dụ: multi-AZ, sub-millisecond, no public Internet, minimal downtime, least operations, retain source IP.

### Bước 4 — loại đáp án sai lớp

- Cần DNS nhưng đáp án chỉ tăng compute.
- Cần HA nhưng đáp án chỉ tạo backup.
- Cần permission nhưng đáp án chỉ mở Security Group.
- Cần async buffer nhưng đáp án chỉ thêm load balancer.

### Bước 5 — so trade-off

Đáp án đúng thường không hoàn hảo tuyệt đối; nó phù hợp nhất với requirement và ưu tiên của câu hỏi.

## 15. Bài tập đầu tiên

Một website chạy trên đúng một EC2 public, lưu upload ở ổ đĩa máy và dùng database trên cùng instance. Hãy tìm vấn đề:

1. EC2 hỏng thì web, file và database đều mất khả năng phục vụ.
2. Không thể scale ngang an toàn vì file/session nằm local.
3. Database tranh tài nguyên với web server.
4. Instance public làm tăng bề mặt tấn công.
5. Không có load balancer hoặc health-based replacement.

Một hướng cải thiện:

```text
Route 53 / CloudFront
→ ALB ở nhiều AZ
→ Auto Scaling EC2 private, stateless
→ S3 cho uploads
→ RDS Multi-AZ cho relational data
→ SQS cho background jobs
```

Đây không phải đáp án duy nhất. Điều quan trọng là mỗi thay đổi giải quyết một vấn đề cụ thể.

## Tự kiểm tra

1. Region khác AZ như thế nào?
2. Vì sao public subnet không đồng nghĩa mọi resource trong đó tự động public?
3. S3, EBS và EFS khác nhau ở giao diện truy cập nào?
4. Queue giúp hệ thống chịu traffic spike bằng cách nào?
5. Backup khác high availability ở điểm nào?
6. Vì sao IAM role phù hợp hơn access key cho EC2/Lambda?
7. Khi đề hỏi “least operational overhead”, bạn cần so sánh điều gì?

Nếu trả lời được bằng lời của mình, chuyển sang [Từ điển AWS cho người mới](01-TU-DIEN-AWS-CHO-NGUOI-MOI.md), sau đó học [Ngày 1 — Security](../01-NGAY-1-SECURITY/README.md).
