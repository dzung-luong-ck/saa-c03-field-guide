# ELB, Route 53 và mạng biên

## 1. Chọn Elastic Load Balancer

| Dịch vụ | Lớp/giao thức | Điểm mạnh | Từ khóa đề thi |
|---|---|---|---|
| ALB | L7: HTTP, HTTPS, gRPC | Định tuyến theo host/path/header/query; nhiều target group; tích hợp WAF | web, microservice, container, redirect, authentication |
| NLB | L4: TCP, UDP, TLS | Hiệu năng rất cao, độ trễ thấp, IP tĩnh theo AZ, giữ source IP | static IP, non-HTTP, millions of requests, PrivateLink |
| GWLB | L3/L4, GENEVE | Chèn và mở rộng appliance mạng ảo | firewall fleet, IDS/IPS, transparent inspection |
| CLB | Legacy | Ứng dụng cũ; tránh chọn cho thiết kế mới | classic/legacy only |

Quy tắc nhanh:

- Cần đọc nội dung HTTP để định tuyến → **ALB**.
- Cần TCP/UDP, source IP hoặc IP tĩnh → **NLB**.
- Cần một cụm firewall/appliance kiểm tra lưu lượng → **GWLB**.
- Cần load balancer nhận traffic Internet → internet-facing; chỉ dùng nội bộ VPC → internal.

### Listener, rule và target group

- **Listener** nhận kết nối trên protocol/port, ví dụ HTTPS:443.
- ALB listener đánh giá rule theo priority rồi chuyển tới target group, redirect hoặc trả fixed response.
- **Target group** có health check riêng. Target có thể là instance, IP hoặc Lambda tùy loại load balancer.
- Một ASG thường đăng ký instance vào target group; không hard-code IP của instance.
- Cross-zone load balancing phân phối qua target ở các AZ; thuộc tính và chi phí xử lý khác nhau theo loại ELB, nên đề thường tập trung vào kết quả kiến trúc hơn là thuộc tính mặc định.

### TLS và client IP

- Chứng chỉ public cho ALB/NLB thường lấy từ **ACM**; ALB có thể terminate TLS rồi gửi HTTP/HTTPS tới target.
- ALB thêm `X-Forwarded-For`; ứng dụng không nên lấy IP client từ source IP của kết nối tới target.
- NLB phù hợp khi phải giữ source IP ở tầng mạng.
- Security group của target nên chỉ nhận traffic từ security group của ALB. NLB cũng hỗ trợ security group trong các cấu hình hiện đại, nhưng hãy đọc đúng điều kiện câu hỏi.

### Sticky session và deregistration delay

- Sticky session giữ một client vào một target, nhưng làm giảm tính phân phối đều; chỉ chọn khi ứng dụng chưa stateless.
- Kiến trúc tốt hơn: session ở ElastiCache/DynamoDB và mọi instance xử lý được mọi request.
- Khi scale-in/deploy, deregistration delay cho request đang chạy hoàn tất trước khi target bị loại.

## 2. Route 53: DNS và routing policy

### Hosted zone và record

- **Public hosted zone**: DNS public trên Internet.
- **Private hosted zone**: DNS chỉ phân giải trong VPC được liên kết; hybrid DNS dùng Route 53 Resolver endpoint/rule.
- `A` ánh xạ tên sang IPv4; `AAAA` sang IPv6; `CNAME` ánh xạ một tên sang tên khác.
- **Alias record** là mở rộng riêng của Route 53, có thể trỏ tới nhiều tài nguyên AWS và dùng ở zone apex; thường không tính phí DNS query tới target AWS được hỗ trợ.
- Không dùng CNAME ở zone apex. Ví dụ `example.com` → ALB nên dùng Alias A/AAAA.
- TTL thấp giúp thay đổi lan nhanh nhưng tăng truy vấn; TTL cao giảm truy vấn nhưng cache lâu.

### Bảng policy

| Policy | Chọn khi | Ghi nhớ |
|---|---|---|
| Simple | Một tài nguyên hoặc trả nhiều giá trị không kèm logic health | Không phải load balancer thực thụ |
| Weighted | Chia traffic theo tỷ lệ | Canary, blue/green, A/B; weight là tỷ lệ tương đối |
| Latency | Đưa client tới Region có latency DNS đo được thấp hơn | Tối ưu trải nghiệm đa Region |
| Failover | Active-passive | Primary + secondary, health check cho primary |
| Geolocation | Theo vị trí địa lý của user | Content/compliance; nên có default |
| Geoproximity | Theo vị trí resource/user và bias | Dịch ranh giới traffic |
| Multivalue answer | Tối đa nhiều record khỏe mạnh | DNS health-aware đơn giản, không thay ELB |
| IP-based | Theo CIDR nguồn của resolver/client mapping | Điều hướng mạng/ISP cụ thể |

Health check Route 53 có thể:

- kiểm tra endpoint public;
- tính toán từ các health check khác;
- dựa trên CloudWatch alarm cho tài nguyên private/metric tùy chỉnh.

Bẫy: DNS failover không đóng ngay các connection đang tồn tại và còn chịu TTL/cache. Cần failover kết nối nhanh, IP tĩnh toàn cầu và health check ở edge thì cân nhắc Global Accelerator.

## 3. CloudFront

CloudFront là CDN phân phối qua edge location:

- cache object gần user, giảm latency và tải origin;
- origin thường là S3, ALB, API Gateway, MediaPackage hoặc custom HTTP origin;
- cache key/policy quyết định header, cookie, query string nào ảnh hưởng cache;
- origin request policy quyết định dữ liệu nào được forward về origin;
- invalidation ép object cũ hết hiệu lực sớm nhưng có chi phí; versioned filename thường tốt hơn.

### Bảo vệ origin S3

- Dùng **Origin Access Control (OAC)** và bucket policy chỉ cho CloudFront distribution đọc bucket.
- Block Public Access vẫn bật; user không truy cập thẳng S3 URL.
- OAI là cơ chế cũ; đề mới ưu tiên OAC khi khả dụng.
- Signed URL hợp một file/client; signed cookie hợp nhiều file bị giới hạn mà không đổi URL.

### Security và availability

- Gắn AWS WAF vào CloudFront để chặn ở edge.
- ACM certificate cho CloudFront phải ở `us-east-1`.
- Geo restriction chặn/cho phép theo quốc gia, khác Route 53 geolocation routing: một bên kiểm soát phân phối, một bên chọn endpoint DNS.
- Origin group cung cấp primary/secondary origin failover cho một số lỗi HTTP.
- Lambda@Edge/CloudFront Functions tùy chỉnh request/response ở edge; CloudFront Functions nhẹ, nhanh, phù hợp logic viewer đơn giản.

## 4. AWS Global Accelerator

- Cấp **hai static Anycast IP** làm entry point toàn cầu.
- Traffic TCP/UDP vào edge gần user rồi đi trên AWS global network tới endpoint khỏe mạnh.
- Endpoint có thể là ALB, NLB, EC2 hoặc Elastic IP ở nhiều Region.
- Không cache nội dung; phù hợp ứng dụng non-HTTP, gaming, VoIP, API cần IP tĩnh hoặc failover nhanh.

### CloudFront, Global Accelerator hay Route 53?

| Nhu cầu | Chọn |
|---|---|
| Cache ảnh/video/static/HTTP content | CloudFront |
| HTTP dynamic nhưng muốn edge security/TLS và tối ưu kết nối | CloudFront có thể vẫn phù hợp |
| TCP/UDP, static Anycast IP, regional failover nhanh | Global Accelerator |
| Chỉ cần DNS routing theo latency/weight/geography | Route 53 |
| Cân bằng trong một Region/VPC | ELB |

Các dịch vụ có thể phối hợp: Route 53 Alias → CloudFront/Global Accelerator/ELB; CloudFront → ALB origin; ALB → targets đa AZ.

## 5. Mẫu kiến trúc hay thi

### Web public có HA

`Route 53 Alias → CloudFront + WAF → ALB public subnets → EC2/ECS private subnets → database private subnets`

- ALB và compute trải ít nhất hai AZ.
- Instance không cần public IP; outbound qua NAT hoặc VPC endpoint.
- Static assets có thể ở S3 private qua OAC.

### Blue/green hoặc canary

- Cùng Region: ALB weighted forward tới hai target group.
- Khác endpoint/Region: Route 53 weighted record.
- Serverless: Lambda alias weighted routing hoặc API Gateway canary.

### SaaS private service

`Consumer VPC → interface endpoint → PrivateLink endpoint service → NLB → provider targets`

Không yêu cầu peering, không lộ toàn bộ CIDR của provider.

## 6. Bẫy chọn đáp án

- “Static IP cho ALB” không có nghĩa gắn Elastic IP trực tiếp vào ALB; dùng Global Accelerator trước ALB hoặc NLB nếu phù hợp.
- Route 53 không forward HTTP và không thay load balancer.
- CloudFront không phải DNS authoritative và không thay Route 53 hosted zone.
- ALB không phải lựa chọn cho UDP.
- NLB không định tuyến theo URL path.
- Security group stateful; route table không phải firewall.
- Health check load balancer chỉ quyết định target nào nhận request, không tự sửa ứng dụng.
- Một endpoint trong một AZ không tạo HA đa AZ.

## 7. Tự kiểm tra 10 câu

1. Path `/api` và `/images` đi hai service khác nhau? → ALB listener rules.
2. UDP game server cần IP cố định? → NLB hoặc Global Accelerator trước regional endpoints.
3. Domain apex trỏ ALB? → Route 53 Alias A/AAAA.
4. 10% traffic tới phiên bản mới? → Weighted routing/weighted target group tùy phạm vi.
5. Bucket S3 chỉ cho CDN đọc? → CloudFront OAC + bucket policy + Block Public Access.
6. User toàn cầu tải object lặp lại? → CloudFront.
7. TCP app đa Region cần failover nhanh? → Global Accelerator.
8. Active-passive bằng DNS? → Route 53 failover policy + health check.
9. Firewall appliance fleet cần scale trong suốt? → GWLB.
10. Private SaaS cho nhiều VPC khách hàng? → PrivateLink + NLB.

## Nguồn AWS nên đối chiếu

- [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [Route 53 routing policies](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [AWS Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
