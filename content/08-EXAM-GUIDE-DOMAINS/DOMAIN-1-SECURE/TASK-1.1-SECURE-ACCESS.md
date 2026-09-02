# Task 1.1 — Design secure access to AWS resources

Task này hỏi: **ai được phép làm hành động nào trên tài nguyên nào, trong account nào và với điều kiện gì?** Bạn cần thiết kế access an toàn cho người, workload, AWS service và nhiều account.

## 1. Giải thích cho người mới

Hãy tưởng tượng AWS là một tòa nhà:

- authentication là kiểm tra giấy tờ ở cửa;
- authorization là thẻ cho phép vào đúng phòng;
- IAM policy là danh sách quyền trên thẻ;
- role là thẻ tạm thời được cấp khi đảm nhận một nhiệm vụ;
- SCP là nội quy toàn tòa nhà, không ai trong tầng được vượt qua;
- resource policy là quy định ngay tại cửa một phòng cụ thể.

Bạn cần cả danh tính hợp lệ và đường cho phép hợp lệ. Mặc định AWS từ chối request nếu không tìm thấy Allow phù hợp; một Explicit Deny áp dụng sẽ thắng Allow.

## 2. Kiến thức Exam Guide muốn bạn biết

### Shared responsibility

AWS bảo vệ cơ sở hạ tầng cloud; khách hàng quản dữ liệu, identity, permission và cấu hình của mình. Dùng dịch vụ managed không chuyển trách nhiệm cấp quyền sang AWS.

### Global infrastructure

Account là ranh giới quản trị; Region/AZ là ranh giới vị trí và lỗi. IAM là global theo cách hoạt động của dịch vụ, nhưng resource và condition có thể gắn Region/account cụ thể.

### Identity options

| Nhu cầu | Lựa chọn thường phù hợp |
|---|---|
| Nhân viên vào nhiều AWS accounts | IAM Identity Center + federation + permission sets |
| EC2/Lambda/ECS gọi AWS API | IAM role gắn với workload |
| Third party vào account | Cross-account role, external ID khi phù hợp |
| User cuối của ứng dụng | Amazon Cognito, không phải hàng nghìn IAM users |
| Legacy bắt buộc credential dài hạn | IAM user, rotation và monitoring chặt |

## 3. Policy evaluation từng bước

Khi gặp câu Allow/Deny, làm theo thứ tự:

1. Xác định principal thực tế và session đang dùng.
2. Liệt kê identity policy và resource/trust policy liên quan.
3. Tìm mọi Explicit Deny.
4. Tìm Allow đúng action, resource và condition.
5. Lấy giao với permissions boundary, session policy và SCP/RCP.
6. Với cross-account, kiểm tra cả phía principal lẫn phía resource/trust.

```text
Quyền có thể được cấp
∩ boundary/session/SCP guardrails
− explicit deny
= quyền hiệu lực
```

### Ví dụ

Developer có `AdministratorAccess`, nhưng SCP ở OU deny xóa KMS key. Developer vẫn không xóa được key. SCP không cấp quyền; nó đặt trần quyền tối đa.

## 4. User, group và role

### IAM user

Có thể có password/access key dài hạn. Dùng hạn chế cho trường hợp legacy; không nhúng access key vào source code, AMI hoặc user data.

### IAM group

Gom IAM users theo job function. Group không chứa role và không lồng group.

### IAM role

Role có hai câu hỏi:

- trust policy: ai được assume role?
- permissions policy: sau khi assume, session được làm gì?

STS cấp temporary credentials có thời hạn. Đây là mặc định tốt cho workload và federation.

## 5. Multi-account design

```text
AWS Organizations
├── Security OU
├── Infrastructure OU
├── Workloads-Prod OU
└── Workloads-NonProd OU
```

- Organizations gom account và consolidated billing.
- OU nhóm account theo governance/lifecycle.
- SCP đặt guardrail quyền tối đa cho member accounts.
- Control Tower tạo landing zone và controls với ít thao tác thủ công.
- Central log/security accounts giảm rủi ro attacker sửa bằng chứng trong workload account.

**Bẫy:** management account có semantics khác member account đối với SCP; đừng dùng SCP thay IAM permission design.

## 6. Cross-account access

### Assume role

Phù hợp khi principal cần một bộ quyền trong account đích. Source identity cần được phép gọi `sts:AssumeRole`; trust policy của role đích phải tin principal phù hợp.

### Resource-based policy

Phù hợp khi một resource như S3 bucket, SQS queue hoặc SNS topic cần cho principal account khác truy cập trực tiếp.

### Cách chọn

- Một resource và vài action: resource policy có thể đơn giản.
- Nhiều resource/action trong account đích: cross-account role thường rõ hơn.
- Third-party quản nhiều khách hàng: role riêng và external ID giúp giảm confused deputy.

## 7. Scenario điển hình

**Đề:** 500 nhân viên dùng corporate directory cần truy cập 20 AWS accounts, quyền theo team, revoke tập trung, không quản IAM users lặp lại.

**Phân tích:** workforce + nhiều accounts + identity có sẵn + quản tập trung.

**Chọn:** IAM Identity Center kết nối IdP; permission sets tạo roles trong target accounts; Organizations/OU/SCP đặt guardrails.

**Không chọn:** tạo 10.000 IAM user-account combinations; chia sẻ một admin role; lưu access keys dài hạn.

## 8. Exam traps

- Root user chỉ cho tác vụ đặc biệt; bật MFA và không tạo root access key.
- `AdministratorAccess` không vượt Explicit Deny hoặc SCP.
- Permissions boundary không tự cấp permission.
- SCP không tự cấp permission.
- Trust policy quyết định ai assume role, không phải role được làm gì sau đó.
- Security Group không cấp quyền gọi S3 API; IAM không mở TCP port.
- IAM Identity Center phục vụ workforce; Cognito thường phục vụ customer identity.

## 9. Checklist làm được task

- [ ] Giải thích authentication khác authorization.
- [ ] Tính được kết quả policy có Allow, boundary và Explicit Deny.
- [ ] Chọn role thay access key cho workload.
- [ ] Thiết kế federation cho workforce nhiều account.
- [ ] Phân biệt SCP, identity policy và resource policy.
- [ ] Chọn assume role hoặc resource policy cho cross-account.

Học sâu: [IAM và AWS Organizations](../../01-NGAY-1-SECURITY/01-IAM-ORGANIZATIONS.md).

Tiếp theo: [Task 1.2 — Secure workloads and applications](TASK-1.2-SECURE-WORKLOADS.md).
