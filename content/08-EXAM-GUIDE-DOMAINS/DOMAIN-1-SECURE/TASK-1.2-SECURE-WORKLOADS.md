# Task 1.2 — Design secure workloads and applications

Task này hỏi cách giảm bề mặt tấn công của application: đặt resource ở đâu, mở traffic nào, cất credentials thế nào, bảo vệ entry point ra sao và phát hiện mối đe dọa bằng dịch vụ nào.

## 1. Giải thích cho người mới

Một application an toàn không dựa vào một “bức tường” duy nhất. **Defense in depth** dùng nhiều lớp độc lập:

```text
Internet
→ Route 53 / CloudFront
→ Shield + WAF
→ Load balancer
→ private application tier
→ isolated database tier
→ IAM role + encryption + logging
```

Nếu một lớp bị vượt qua, lớp tiếp theo vẫn giảm tác động. Ví dụ WAF chặn web attack phổ biến, Security Group chỉ cho app nhận traffic từ ALB, IAM role chỉ cho app đọc đúng secret, database không public.

## 2. Network segmentation

### Public và private subnet

Public subnet có route tới Internet Gateway. Private subnet không có direct route đó. Một resource còn cần public IP và firewall phù hợp mới giao tiếp trực tiếp qua Internet.

Pattern phổ biến:

- ALB trong public subnets ở nhiều AZ.
- EC2/ECS application trong private subnets.
- RDS/cache trong private/isolated subnets.
- NAT Gateway hoặc VPC endpoint cho outbound cần thiết.

### Security Group và NACL

| Control | Phạm vi | Trạng thái | Rule |
|---|---|---|---|
| Security Group | Resource/ENI | Stateful | Allow only |
| Network ACL | Subnet | Stateless | Allow và deny |

Ưu tiên reference Security Group thay vì mở CIDR rộng: DB SG chỉ cho inbound từ app SG, app SG chỉ cho inbound từ ALB SG.

## 3. Secure service access

### VPC endpoint

Cho workload private gọi dịch vụ được hỗ trợ qua private path, giảm phụ thuộc NAT/public Internet. Endpoint policy là một lớp giới hạn bổ sung nhưng không thay IAM/resource policy.

### Secrets

- Secrets Manager phù hợp secret cần rotation/workflow quản lý.
- Systems Manager Parameter Store phù hợp configuration và secret theo feature/tier yêu cầu.
- Workload dùng IAM role để lấy secret khi chạy.
- Không đặt secret trong source, image, environment file commit lên Git hoặc EC2 user data.

## 4. Bảo vệ entry point

| Mối đe dọa/yêu cầu | Dịch vụ/pattern |
|---|---|
| DDoS network/transport cơ bản | Shield Standard đi kèm dịch vụ được bảo vệ |
| DDoS nâng cao và hỗ trợ chuyên biệt | Shield Advanced khi requirement phù hợp |
| SQL injection, XSS, bot/rate rule ở HTTP | AWS WAF |
| Phân phối/cache toàn cầu, private S3 origin | CloudFront + OAC |
| TLS certificate cho dịch vụ tích hợp | AWS Certificate Manager |
| API authentication/throttling | API Gateway authorizer/Cognito/IAM + usage controls |

**Bẫy:** WAF làm việc ở lớp web HTTP; nó không thay Security Group/NACL. Shield không sửa IAM permission.

## 5. Chọn security service đúng tín hiệu

| Cần làm gì? | Dịch vụ thường liên quan |
|---|---|
| Phát hiện hành vi đáng ngờ từ logs/signals | GuardDuty |
| Tìm dữ liệu nhạy cảm trong S3 | Macie |
| Quét lỗ hổng workload được hỗ trợ | Inspector |
| Tổng hợp finding và security posture | Security Hub |
| Điều tra mối quan hệ resource/activity | Detective |
| Quản firewall policy nhiều accounts | Firewall Manager |
| Customer sign-up/sign-in | Cognito user pool |

Đề thi thường đưa một động từ rất rõ: **detect**, **classify**, **scan**, **aggregate**, **protect web request**. Chọn dịch vụ theo động từ, không theo chữ “security” chung chung.

## 6. Kết nối bên ngoài AWS

- Site-to-Site VPN: tunnel mã hóa qua Internet, triển khai nhanh.
- Direct Connect: private dedicated connectivity, ổn định hơn; không tự mã hóa payload.
- Có thể chạy VPN trên Direct Connect nếu cần private path cộng encryption.
- Route, BGP, redundancy và hai đầu kết nối đều quyết định resilience.

## 7. Scenario điển hình

**Đề:** Web public, EC2 không được có public IP, database không Internet-accessible, app cần gọi S3 và lấy database password tự động rotation.

**Thiết kế:** CloudFront/WAF → public ALB → private EC2; DB private chỉ nhận từ app SG; S3 gateway endpoint; Secrets Manager + IAM instance role; NAT chỉ nếu app còn cần outbound Internet khác.

**Loại:** đặt EC2 public rồi chỉ “ẩn” bằng tên subnet; lưu password trong AMI; mở DB SG `0.0.0.0/0`; dùng IAM access key tĩnh.

## 8. Exam traps

- Route table chỉ đường, không phải firewall.
- NAT Gateway không cho Internet chủ động connect vào private EC2.
- NACL stateless nên phải cho phép traffic hai chiều gồm ephemeral ports phù hợp.
- Private subnet không tự mã hóa traffic.
- VPC endpoint không tự cấp IAM permission.
- GuardDuty phát hiện; WAF/Shield bảo vệ theo lớp khác nhau.
- Cognito không thay IAM role cho AWS workload.

## 9. Checklist làm được task

- [ ] Vẽ được public, private và database subnets ở hai AZ.
- [ ] Phân biệt route, SG, NACL và endpoint policy.
- [ ] Thiết kế secret retrieval không có key/password trong code.
- [ ] Chọn đúng WAF, Shield, GuardDuty, Macie, Inspector.
- [ ] Giải thích VPN khác Direct Connect.
- [ ] Theo dấu network path từ client đến database.

Học sâu: [Application và Network Security](../../01-NGAY-1-SECURITY/03-APPLICATION-NETWORK-SECURITY.md) và [VPC Foundations](../../04-NGAY-4-NETWORKING/01-VPC-FOUNDATIONS.md).

Tiếp theo: [Task 1.3 — Data security controls](TASK-1.3-DATA-SECURITY.md).
