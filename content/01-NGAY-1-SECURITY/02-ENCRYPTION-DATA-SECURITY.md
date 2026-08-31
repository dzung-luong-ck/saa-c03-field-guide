# Encryption và Data Security

## 1. Bắt đầu từ data lifecycle

| Trạng thái dữ liệu | Rủi ro | Control điển hình |
|---|---|---|
| At rest | Disk/snapshot/backup bị truy cập | SSE, EBS/RDS encryption, KMS, access policy |
| In transit | Sniffing/MITM | TLS/HTTPS, VPN/IPsec, certificate validation |
| In use | Process/memory bị compromise | Least privilege, isolation, confidential computing khi cần |
| Backup/replica | Bản sao ngoài control | Encryption key, cross-account policy, retention, Vault Lock |

Encryption không thay authorization. User có quyền decrypt hợp lệ vẫn đọc được dữ liệu; vì vậy phải thiết kế IAM, key policy và network access cùng nhau.

## 2. KMS mental model

AWS KMS quản cryptographic keys và cung cấp APIs tích hợp với nhiều AWS services.

### Envelope encryption

```text
Plaintext data
  ↓ encrypt bằng data key
Ciphertext data

Plaintext data key
  ↓ encrypt bằng KMS key
Encrypted data key

Lưu ciphertext data + encrypted data key cùng nhau.
```

Khi decrypt:

1. Gửi encrypted data key tới KMS.
2. KMS kiểm tra permission và trả plaintext data key qua secure channel.
3. Application dùng data key decrypt data locally.
4. Xóa plaintext key khỏi memory sớm nhất có thể.

Lợi ích: không gửi object lớn vào KMS; mỗi object/message có thể dùng data key riêng; KMS key bảo vệ data keys.

## 3. KMS key ownership

| Loại | Ai quản | Control | Chọn khi |
|---|---|---|---|
| AWS owned key | AWS | Không nhìn/thay policy/rotation | Default encryption đơn giản |
| AWS managed key | AWS tạo theo service trong account | Visibility nhưng ít control | Service-managed integration, không cần custom policy |
| Customer managed key | Khách tạo/quản | Policy, grants, aliases, rotation, lifecycle, audit | Compliance, cross-account, separation, revocation |
| Imported key material | Khách cung cấp material | Có lifecycle/availability trade-off | Regulatory requirement về source key material |
| Custom key store | KMS interface với CloudHSM/external store | Control cao, ops/cost cao | Requirement chuyên biệt |

### Symmetric vs asymmetric

- Symmetric encryption KMS key: lựa chọn mặc định cho AWS service encryption và envelope encryption.
- Asymmetric key: public/private pair; encrypt/decrypt hoặc sign/verify tùy key usage.
- HMAC key: generate/verify MAC.
- Không chọn asymmetric chỉ vì nghe “an toàn hơn”; chọn theo protocol và separation requirement.

### Single-Region vs multi-Region keys

- Single-Region key là mặc định và đủ cho hầu hết AWS managed encryption.
- Multi-Region related keys có cùng key material/key ID để encrypt ở Region này và decrypt ở Region khác mà không cross-Region KMS call.
- Mỗi related key vẫn có ARN, policy, grants, aliases và state riêng; policies không tự đồng bộ.
- Chỉ dùng multi-Region khi application/client-side encryption hoặc DR thực sự cần.

## 4. Key policy, IAM policy và grants

### Key policy

- Primary access control của KMS key.
- Phải tạo đường cho account/IAM administration phù hợp.
- Có thể cấp cross-account use.
- Cẩn thận không khóa chính mình khỏi key.

### IAM policy

- Cho principal gọi KMS actions nếu key policy cho phép IAM delegation/đường sử dụng phù hợp.
- Least privilege theo key ARN và action như Encrypt/Decrypt/GenerateDataKey.

### Grants

- Delegation programmatic, thường được AWS services dùng.
- Có thể giới hạn operations và encryption context.

### Encryption context

- Additional authenticated data, không phải secret.
- Có thể xuất hiện trong CloudTrail.
- Dùng condition để ràng buộc ciphertext với application/resource context.

## 5. Rotation và deletion

- Rotation thay key material dùng cho encryption mới; KMS giữ material cũ để decrypt ciphertext cũ.
- Customer managed KMS key có rotation configuration; imported/custom store keys có quy trình khác.
- Alias đổi target không tự re-encrypt dữ liệu.
- Disable key là reversible nhưng làm workloads decrypt/encrypt thất bại.
- Schedule deletion có waiting period; phải inventory dependencies trước.
- Đề hỏi “không mất khả năng decrypt dữ liệu cũ” → rotation phù hợp, không xóa key cũ.

Không học thuộc duy nhất chu kỳ rotation từ slide; xem [KMS rotation documentation](https://docs.aws.amazon.com/kms/latest/developerguide/rotating-keys.html) nếu câu hỏi phụ thuộc con số.

## 6. KMS vs CloudHSM

| | KMS | CloudHSM |
|---|---|---|
| Service model | Managed key service | Dedicated HSM cluster |
| Tenant | Multi-tenant service với isolation | Single-tenant HSMs |
| Key administration | AWS service + customer policies | Customer quản users/keys; AWS quản hardware service |
| Integration | Rất rộng với AWS services | Custom cryptographic/app integration |
| HA | Managed | Khách triển khai HSMs nhiều AZ trong cluster |
| Use case | Hầu hết encryption trên AWS | Regulatory/custom algorithm/full HSM control |

**Exam rule:** nếu đề chỉ yêu cầu encryption và key control/audit, chọn KMS. Chỉ chọn CloudHSM khi nhấn mạnh exclusive HSM control, PKCS#11/custom crypto hoặc compliance cụ thể.

## 7. S3 server-side encryption

| Mode | Key ở đâu | Điểm quyết định |
|---|---|---|
| SSE-S3 | S3 managed | Đơn giản, default managed encryption |
| SSE-KMS | KMS | Key policy, audit, cross-account control, KMS API cost/quota |
| DSSE-KMS | Hai lớp KMS-based encryption | Compliance yêu cầu dual-layer server-side encryption |
| SSE-C | Client cung cấp key mỗi request | AWS không lưu key; client tự quản hoàn toàn |
| Client-side | Mã hóa trước upload | End-to-end control; app quản crypto/key workflow |

### SSE-KMS details hay thi

- Caller cần quyền S3 và KMS phù hợp.
- Cross-account bucket + KMS phải xử lý cả bucket/resource access và key access.
- S3 Bucket Key giảm KMS request traffic/cost cho SSE-KMS ở nhiều workloads.
- Replication của KMS-encrypted objects cần destination key và IAM permissions phù hợp.
- HTTPS là bắt buộc cho SSE-C và nên dùng cho mọi traffic.

### Bucket policy để enforce encryption/HTTPS

Patterns thường gặp:

- Deny request nếu `aws:SecureTransport=false`.
- Deny `PutObject` nếu encryption header không đúng customer managed key yêu cầu.
- Giới hạn requests qua VPC endpoint hoặc Organization khi use case phù hợp.

Không mở bucket public chỉ để CloudFront đọc. Dùng OAC và bucket policy chỉ cho distribution.

## 8. EBS encryption

- Volume data at rest, snapshots và data path giữa supported EC2/EBS được mã hóa.
- Snapshot của encrypted volume được encrypted.
- Volume tạo từ encrypted snapshot tiếp tục encrypted.
- Để mã hóa volume cũ: snapshot → copy snapshot với encryption → tạo volume mới → attach/cut over.
- Encryption by default có thể bật theo Region/account.
- KMS key permission ảnh hưởng khả năng launch từ shared/cross-account encrypted AMI/snapshot.

## 9. RDS/Aurora encryption

- Chọn encryption khi tạo database/cluster; thường không bật trực tiếp cho existing unencrypted DB theo kiểu toggle đơn giản.
- Migration phổ biến: snapshot → copy encrypted snapshot → restore DB mới → cut over.
- Automated backups, snapshots, replicas theo behavior của encrypted source/keys.
- In transit: enforce TLS và validate certificate.
- TDE/native encryption có engine-specific use cases; không thay storage encryption.
- Secrets Manager có thể lưu/rotate DB credentials; RDS Proxy tích hợp IAM/auth/secrets tùy kiến trúc.

## 10. Secrets Manager vs Parameter Store

| | Secrets Manager | SSM Parameter Store |
|---|---|---|
| Tối ưu | Secrets | Configuration và secure parameters |
| Rotation | Built-in/managed hoặc Lambda rotation | Không có full secret rotation workflow tương đương mặc định |
| Data | Secret JSON/string | String, StringList, SecureString |
| KMS | Có | SecureString dùng KMS |
| Cost | Có charge theo secret/API | Standard tier có economics khác; advanced features có cost |

### Chọn Secrets Manager khi

- Database password cần rotate tự động.
- API key/credential có lifecycle.
- App cần retrieve secret runtime bằng IAM role.

### Chọn Parameter Store khi

- Hierarchical application config.
- AMI ID, endpoint, feature flag, non-secret configuration.
- SecureString nhưng không cần rotation workflow đầy đủ.

### Secure pattern

```text
Workload role → GetSecretValue/GetParameter
             → decrypt qua KMS permissions
             → cache secret ngắn hạn trong memory
```

Không ghi secret vào logs, tags, resource names, CloudFormation outputs hoặc user data.

## 11. ACM và TLS

AWS Certificate Manager provision và renew certificates cho integrated services.

| Target | Certificate placement |
|---|---|
| CloudFront | Request/import certificate ở `us-east-1` |
| Regional ALB/NLB TLS listener | Certificate ở cùng Region với load balancer |
| Regional API Gateway custom domain | Certificate ở Region tương ứng |

- Public ACM certificates gắn với integrated services được renew tự động nếu validation/association còn đúng.
- DNS validation thường dễ automate hơn email validation.
- ACM private CA phục vụ private PKI, có cost và governance riêng.
- Certificate encryption in transit không tự chứng minh user authorization.

## 12. Backup encryption và ransomware resistance

Defense in depth:

- Backup plan và retention độc lập production credentials.
- Cross-account copy vào backup account.
- Cross-Region copy cho Regional disaster.
- Customer managed KMS key policy được bảo vệ.
- AWS Backup Vault Lock/Object Lock cho immutability.
- Hạn chế `DeleteRecoveryPoint`, KMS deletion và account leave bằng governance controls.
- Restore test định kỳ; backup không được kiểm tra có thể không đạt RTO.

## 13. Scenario reasoning

### Scenario A — CloudFront private S3 với audit key usage

```text
Viewer HTTPS
→ CloudFront
→ OAC-signed request
→ private S3 bucket SSE-KMS
```

Controls:

- bucket policy chỉ cho CloudFront distribution;
- KMS key policy cho S3/authorized principals theo design;
- Block Public Access;
- CloudTrail/CloudFront/S3 logging theo audit requirement.

### Scenario B — Cross-account encrypted snapshots

Yêu cầu account B restore snapshot từ account A.

- Snapshot phải được share/copy theo service rules.
- AWS managed KMS key thường không đáp ứng cross-account sharing cần thiết.
- Dùng customer managed KMS key và key policy/grant cho account B.
- Account B copy snapshot và re-encrypt bằng key của B nếu isolation yêu cầu.

### Scenario C — Secret rotation không downtime

- Secrets Manager rotation cập nhật secret và database/service.
- Application retrieve current secret hoặc dùng connection pool/dual-user rotation pattern phù hợp.
- Monitor failed rotation; không hard-code version stage.

## 14. Exam traps

- KMS không phải nơi mã hóa trực tiếp file hàng GB; envelope encryption.
- Customer managed key không tự cho user quyền decrypt.
- Xóa/disable KMS key có thể làm backups/data không thể đọc.
- SSE-KMS cần cả S3 và KMS permissions.
- ACM không phải DNS service; Route 53 không tự cấp certificate.
- Secrets Manager phù hợp rotation; Parameter Store phù hợp config/SecureString đơn giản.
- CloudHSM không phải “KMS rẻ hơn” và tạo overhead đáng kể.

Tiếp theo: [Application và Network Security](03-APPLICATION-NETWORK-SECURITY.md).
