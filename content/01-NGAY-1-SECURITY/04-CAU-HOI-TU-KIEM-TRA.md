# Ngày 1 — Câu hỏi tự kiểm tra

Trả lời trước khi mở phần đáp án. Mục tiêu không phải nhớ câu chữ mà là nói được rule quyết định.

## Câu hỏi

1. EC2 application cần đọc một S3 prefix. Cách cấp credential an toàn nhất?
2. Identity policy allow `s3:*`, permissions boundary chỉ allow `s3:GetObject`. User có thể `DeleteObject` không?
3. Boundary allow `s3:GetObject`, nhưng identity policy không có S3 allow. User đọc được object không?
4. Member-account admin bị SCP deny `ec2:TerminateInstances`. Admin có terminate được không?
5. SCP allow một action nhưng identity policy không allow. Action có chạy không?
6. Cross-account role cần hai đường permission chính nào?
7. Khi nào dùng external ID?
8. Workforce truy cập 30 accounts bằng corporate IdP nên dùng gì?
9. Mobile end users cần sign-up/sign-in dùng gì?
10. Authenticated mobile users cần temporary AWS credentials dùng gì?
11. Vì sao `s3:ListBucket` và `s3:GetObject` cần ARN khác nhau?
12. Service nào tìm PII trong S3?
13. Service nào quét CVE trên EC2/ECR/Lambda?
14. Service nào phát hiện suspicious API/DNS/network behavior?
15. Service nào tổng hợp findings nhiều accounts?
16. Service nào điều tra relationships sau GuardDuty finding?
17. Chặn SQL injection tại CloudFront dùng gì?
18. Inspect stateful VPC egress traffic bằng AWS-managed firewall dùng gì?
19. Quản WAF rules tập trung toàn Organization dùng gì?
20. KMS dùng envelope encryption để giải quyết vấn đề gì?
21. SSE-KMS request cần những permission classes nào?
22. Khi nào CloudHSM hợp lý hơn KMS?
23. Database password cần rotation tự động nên lưu ở đâu?
24. Hierarchical non-secret app config nên lưu ở đâu?
25. Certificate cho CloudFront phải ở Region nào?
26. CloudFront phân phối private S3 content mà không public bucket dùng gì?
27. Một user tải đúng một private file qua CloudFront dùng signed URL hay signed cookie?
28. Bảo vệ nhiều file HLS không đổi URL dùng gì?
29. Vì sao replication không thay backup?
30. Ai đã gọi `DeleteBucketPolicy` được tìm bằng service nào?

## Đáp án và rule

1. **EC2 IAM role qua instance profile.** Không đặt access key trong code/user data/AMI.
2. **Không.** Effective permission nằm trong giao với boundary; `DeleteObject` vượt trần.
3. **Không.** Boundary không cấp quyền, chỉ giới hạn.
4. **Không.** Explicit deny/SCP guardrail thắng admin allow.
5. **Không.** SCP không cấp quyền; vẫn cần identity/resource allow phù hợp.
6. **Source principal được phép `sts:AssumeRole`; destination role trust policy trust source.** Sau đó role permissions cấp actions.
7. **Third-party assume role cho nhiều customers**, giảm confused-deputy risk theo thiết kế.
8. **IAM Identity Center** kết nối IdP và permission sets.
9. **Cognito user pool.**
10. **Cognito identity pool** map identity sang temporary role credentials.
11. Bucket action áp bucket ARN; object action áp `bucket/*`.
12. **Amazon Macie.**
13. **Amazon Inspector.**
14. **Amazon GuardDuty.**
15. **AWS Security Hub.**
16. **Amazon Detective.**
17. **AWS WAF.**
18. **AWS Network Firewall.**
19. **AWS Firewall Manager** với Organizations.
20. Mã hóa data lớn locally bằng data key, còn KMS key bảo vệ data key; scale và giảm KMS payload/calls.
21. **S3 access + KMS key use** phù hợp, cùng guardrails liên quan.
22. Khi cần dedicated/single-tenant HSM control, custom crypto/PKCS#11 hoặc compliance cụ thể.
23. **AWS Secrets Manager.**
24. **Systems Manager Parameter Store.**
25. **`us-east-1`.**
26. **Origin Access Control (OAC)** + bucket policy + Block Public Access.
27. **Signed URL.**
28. **Signed cookies.**
29. Lỗi/xóa/ransomware có thể replicate; backup có versions/retention/independent recovery point.
30. **AWS CloudTrail.**

## 5 mini-scenarios

### A. Public bucket bị cấm nhưng website phải global

Đáp án kỳ vọng: CloudFront + private S3 REST origin + OAC + ACM + Route 53 alias; WAF nếu cần web protection.

### B. Security team cần hạn chế developers chỉ tạo role dưới một trần

Đáp án kỳ vọng: delegated IAM permission yêu cầu gắn permissions boundary cụ thể; boundary không tự cấp actions.

### C. Encrypted snapshot cần share cross-account

Đáp án kỳ vọng: customer managed KMS key với cross-account policy/grant phù hợp, share/copy snapshot và re-encrypt ở destination nếu cần. Không dựa vào AWS managed key không share được theo yêu cầu.

### D. Central incident pipeline

Đáp án kỳ vọng: GuardDuty/Inspector/Macie → Security Hub/EventBridge → workflow response; Detective/CloudTrail để điều tra.

### E. Chặn một IP ở ALB application

Đáp án kỳ vọng: WAF IP set/rule nếu cần web-layer centralized block. SG allow-only và NACL deny có thể áp ở network scope nhưng có trade-off/placement khác.

## Điểm đạt

- 27–30 đúng: chuyển sang Ngày 2.
- 22–26 đúng: xem lại bảng service boundaries.
- <22 đúng: đọc lại IAM evaluation và detect/protect mapping trước khi làm practice test.

Tiếp theo: [Ngày 2 — Resilience](../02-NGAY-2-RESILIENCE/README.md).
